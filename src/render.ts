import { State } from './state.js';
import {
  key2pos,
  createEl,
  posToTranslateRel,
  posToTranslateAbs,
  translateRel,
  translateAbs,
  opposite,
  pieceNameOf,
} from './util.js';
import { sentePov } from './board.js';
import { AnimCurrent, AnimVectors, AnimVector, AnimFadings } from './anim.js';
import { DragCurrent } from './drag.js';
import * as sg from './types.js';

type PieceName = string; // `$color $role`

type SquareClasses = Map<sg.Key, string>;

// ported from https://github.com/veloce/lichobile/blob/master/src/js/shogiground/view.js
// in case of bugs, blame @veloce
export function render(s: State): void {
  const asSente: boolean = sentePov(s),
    posToTranslate = s.dom.relative ? posToTranslateRel(s.dimensions) : posToTranslateAbs(s.dimensions, s.dom.bounds()),
    translate = s.dom.relative ? translateRel : translateAbs,
    squaresEl: HTMLElement = s.dom.elements.squares,
    piecesEl: HTMLElement = s.dom.elements.pieces,
    handTopEl: HTMLElement | undefined = s.dom.elements.handTop,
    handBotEl: HTMLElement | undefined = s.dom.elements.handBot,
    pieces: sg.Pieces = s.pieces,
    curAnim: AnimCurrent | undefined = s.animation.current,
    anims: AnimVectors = curAnim ? curAnim.plan.anims : new Map(),
    fadings: AnimFadings = curAnim ? curAnim.plan.fadings : new Map(),
    curDrag: DragCurrent | undefined = s.draggable.current,
    squares: SquareClasses = computeSquareClasses(s),
    samePieces: Set<sg.Key> = new Set(),
    movedPieces: Map<PieceName, sg.PieceNode[]> = new Map();

  let k: sg.Key,
    el: HTMLElement | undefined,
    pieceAtKey: sg.Piece | undefined,
    elPieceName: PieceName,
    anim: AnimVector | undefined,
    fading: sg.Piece | undefined,
    pMvdset: sg.PieceNode[] | undefined,
    pMvd: sg.PieceNode | undefined;

  // walk over all board dom elements, apply animations and flag moved pieces
  el = piecesEl.firstElementChild as HTMLElement | undefined;
  while (el) {
    if (sg.isPieceNode(el)) {
      k = el.sgKey;
      pieceAtKey = pieces.get(k);
      anim = anims.get(k);
      fading = fadings.get(k);
      elPieceName = el.sgPiece;

      // if piece not being dragged anymore, remove dragging style
      if (el.sgDragging && (!curDrag || curDrag.orig !== k)) {
        el.classList.remove('dragging');
        translate(el, posToTranslate(key2pos(k), asSente));
        el.sgDragging = false;
      }
      // remove fading class if it still remains
      if (!fading && el.sgFading) {
        el.sgFading = false;
        el.classList.remove('fading');
      }
      // there is now a piece at this dom key
      if (pieceAtKey) {
        // continue animation if already animating and same piece
        // (otherwise it could animate a captured piece)
        if (anim && el.sgAnimating && elPieceName === pieceNameOf(pieceAtKey)) {
          const pos = key2pos(k);
          pos[0] += anim[2];
          pos[1] += anim[3];
          el.classList.add('anim');
          translate(el, posToTranslate(pos, asSente));
        } else if (el.sgAnimating) {
          el.sgAnimating = false;
          el.classList.remove('anim');
          translate(el, posToTranslate(key2pos(k), asSente));
        }
        // same piece: flag as same
        if (elPieceName === pieceNameOf(pieceAtKey) && (!fading || !el.sgFading)) {
          samePieces.add(k);
        }
        // different piece: flag as moved unless it is a fading piece
        else {
          if (fading && elPieceName === pieceNameOf(fading)) {
            el.classList.add('fading');
            el.sgFading = true;
          } else {
            appendValue(movedPieces, elPieceName, el);
          }
        }
      }
      // no piece: flag as moved
      else {
        appendValue(movedPieces, elPieceName, el);
      }
    }
    el = el.nextElementSibling as HTMLElement | undefined;
  }

  // walk over all squares and apply classes
  let sqEl = squaresEl.firstElementChild as HTMLElement | undefined;
  while (sqEl && sg.isSquareNode(sqEl)) {
    const cc = squares.get(sqEl.sgKey) || '';
    sqEl.className = cc;
    sqEl = sqEl.nextElementSibling as HTMLElement | undefined;
  }
  // walk over all pieces in current set, apply dom changes to moved pieces
  // or append new pieces
  for (const [k, p] of pieces) {
    anim = anims.get(k);
    if (!samePieces.has(k)) {
      pMvdset = movedPieces.get(pieceNameOf(p));
      pMvd = pMvdset && pMvdset.pop();
      // a same piece was moved
      if (pMvd) {
        // apply dom changes
        pMvd.sgKey = k;
        if (pMvd.sgFading) {
          pMvd.classList.remove('fading');
          pMvd.sgFading = false;
        }
        const pos = key2pos(k);
        if (anim) {
          pMvd.sgAnimating = true;
          pMvd.classList.add('anim');
          pos[0] += anim[2];
          pos[1] += anim[3];
        }
        translate(pMvd, posToTranslate(pos, asSente));
      }
      // no piece in moved obj: insert the new piece
      // assumes the new piece is not being dragged
      else {
        const pieceName = pieceNameOf(p),
          pieceNode = createEl('piece', pieceName) as sg.PieceNode,
          pos = key2pos(k);

        pieceNode.sgPiece = pieceName;
        pieceNode.sgKey = k;
        if (anim) {
          pieceNode.sgAnimating = true;
          pos[0] += anim[2];
          pos[1] += anim[3];
        }
        translate(pieceNode, posToTranslate(pos, asSente));

        piecesEl.appendChild(pieceNode);
      }
    }
  }

  if (s.hands.enabled && handTopEl && handBotEl) {
    updateHand(s, opposite(s.orientation), handTopEl);
    updateHand(s, s.orientation, handBotEl);
  }

  // remove any element that remains in the moved sets
  for (const nodes of movedPieces.values()) removeNodes(s, nodes);
}

export function updateBounds(s: State): void {
  if (s.dom.relative) return;
  const asSente: boolean = sentePov(s),
    posToTranslate = posToTranslateAbs(s.dimensions, s.dom.bounds());
  let el = s.dom.elements.pieces.firstElementChild as HTMLElement | undefined;
  while (el) {
    if (sg.isPieceNode(el) && !el.sgAnimating) translateAbs(el, posToTranslate(key2pos(el.sgKey), asSente));
    el = el.nextElementSibling as HTMLElement | undefined;
  }
}

function removeNodes(s: State, nodes: HTMLElement[]): void {
  for (const node of nodes) s.dom.elements.pieces.removeChild(node);
}

function computeSquareClasses(s: State): SquareClasses {
  const squares: SquareClasses = new Map();
  if (s.lastMove && s.highlight.lastMove)
    for (const k of s.lastMove) {
      if (!k.includes('*')) addSquare(squares, k, 'last-move');
    }
  if (s.check && s.highlight.check) addSquare(squares, s.check, 'check');
  if (s.selected) {
    addSquare(squares, s.selected, 'selected');
    if (s.movable.showDests) {
      const dests = s.movable.dests?.get(s.selected);
      if (dests)
        for (const k of dests) {
          addSquare(squares, k, 'move-dest' + (s.pieces.has(k) ? ' oc' : ''));
        }
      const pDests = s.premovable.dests;
      if (pDests)
        for (const k of pDests) {
          addSquare(squares, k, 'premove-dest' + (s.pieces.has(k) ? ' oc' : ''));
        }
    }
  } else if (s.dropmode.active || s.draggable.current?.newPiece) {
    const piece = s.dropmode.active ? s.dropmode.piece : s.draggable.current?.piece;
    if (piece && s.droppable.showDests) {
      const dests = s.droppable.dests?.get(piece.role);
      if (dests)
        for (const k of dests) {
          addSquare(squares, k, 'move-dest');
        }
      const pDests = s.predroppable.dests;
      if (pDests && s.turnColor !== piece.color)
        for (const k of pDests) {
          addSquare(squares, k, 'premove-dest' + (s.pieces.has(k) ? ' oc' : ''));
        }
    }
  }
  const premove = s.premovable.current;
  if (premove) for (const k of premove) addSquare(squares, k, 'current-premove');
  else if (s.predroppable.current) addSquare(squares, s.predroppable.current.key, 'current-premove');

  return squares;
}

function addSquare(squares: SquareClasses, key: sg.Key, klass: string): void {
  const classes = squares.get(key);
  if (classes) squares.set(key, `${classes} ${klass}`);
  else squares.set(key, klass);
}

function makeHandPiece(piece: sg.Piece, hands: sg.Hands, selected: boolean): HTMLElement {
  const pieceEl = createEl('piece', pieceNameOf(piece));
  const num = hands.get(piece.color)?.get(piece.role) || 0;
  pieceEl.dataset.role = piece.role;
  pieceEl.dataset.color = piece.color;
  pieceEl.dataset.nb = num.toString();
  pieceEl.classList.toggle('selected', selected);

  return pieceEl;
}

function updateHand(s: State, color: sg.Color, handEl: HTMLElement): void {
  if (handEl.children.length !== s.hands.handRoles.length) {
    handEl.innerHTML = '';
    for (const role of s.hands.handRoles) {
      handEl.appendChild(
        makeHandPiece(
          { role: role, color: color },
          s.hands.handMap,
          s.dropmode.active && s.dropmode.piece?.color === color && s.dropmode.piece.role === role
        )
      );
    }
  } else {
    let piece = handEl.firstElementChild as HTMLElement | undefined;
    while (piece) {
      const role = piece.dataset.role as sg.Role;
      const num = s.hands.handMap.get(color)?.get(role) || 0;
      piece.classList.toggle(
        'selected',
        s.dropmode.active && s.dropmode.piece?.color === color && s.dropmode.piece.role === role
      );
      piece.dataset.nb = num.toString();
      piece = piece.nextElementSibling as HTMLHtmlElement | undefined;
    }
  }
}

function appendValue<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const arr = map.get(key);
  if (arr) arr.push(value);
  else map.set(key, [value]);
}
