import { State } from './state';
import { key2pos, createEl, posToTranslateRel, posToTranslateAbs, translateRel, translateAbs } from './util';
import { sentePov } from './board';
import { AnimCurrent, AnimVectors, AnimVector, AnimFadings } from './anim';
import { DragCurrent } from './drag';
import * as sg from './types';

type PieceName = string; // `$color $role`

type SquareClasses = Map<sg.Key, string>;

// ported from https://github.com/veloce/lichobile/blob/master/src/js/shogiground/view.js
// in case of bugs, blame @veloce
export function render(s: State): void {
  const asSente: boolean = sentePov(s),
    posToTranslate = s.dom.relative ? posToTranslateRel(s.dimensions) : posToTranslateAbs(s.dimensions, s.dom.bounds()),
    translate = s.dom.relative ? translateRel : translateAbs,
    boardEl: HTMLElement = s.dom.elements.board,
    handsEl: HTMLElement[] | undefined = s.dom.elements.hands,
    pieces: sg.Pieces = s.pieces,
    curAnim: AnimCurrent | undefined = s.animation.current,
    anims: AnimVectors = curAnim ? curAnim.plan.anims : new Map(),
    fadings: AnimFadings = curAnim ? curAnim.plan.fadings : new Map(),
    curDrag: DragCurrent | undefined = s.draggable.current,
    squares: SquareClasses = computeSquareClasses(s),
    samePieces: Set<sg.Key> = new Set(),
    sameSquares: Set<sg.Key> = new Set(),
    movedPieces: Map<PieceName, sg.PieceNode[]> = new Map(),
    movedSquares: Map<string, sg.SquareNode[]> = new Map(); // by class name
  let k: sg.Key,
    el: sg.PieceNode | sg.SquareNode | undefined,
    pieceAtKey: sg.Piece | undefined,
    elPieceName: PieceName,
    anim: AnimVector | undefined,
    fading: sg.Piece | undefined,
    pMvdset: sg.PieceNode[] | undefined,
    pMvd: sg.PieceNode | undefined,
    sMvdset: sg.SquareNode[] | undefined,
    sMvd: sg.SquareNode | undefined;

  // walk over all board dom elements, apply animations and flag moved pieces
  el = boardEl.firstChild as sg.PieceNode | sg.SquareNode | undefined;
  while (el) {
    k = el.sgKey;
    if (isPieceNode(el)) {
      pieceAtKey = pieces.get(k);
      anim = anims.get(k);
      fading = fadings.get(k);
      elPieceName = el.sgPiece;

      //      el.classList.remove('fix-blur');
      //    if (k === '00') el.classList.add('fix-blur');

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
    } else if (isSquareNode(el)) {
      const cn = el.className;
      if (squares.get(k) === cn) sameSquares.add(k);
      else appendValue(movedSquares, cn, el);
    }
    el = el.nextSibling as sg.PieceNode | sg.SquareNode | undefined;
  }

  // walk over all squares in current set, apply dom changes to moved squares
  // or append new squares
  for (const [sk, className] of squares) {
    if (!sameSquares.has(sk)) {
      sMvdset = movedSquares.get(className);
      sMvd = sMvdset && sMvdset.pop();
      const translation = posToTranslate(key2pos(sk), asSente);
      if (sMvd) {
        sMvd.sgKey = sk;
        translate(sMvd, translation, false);
      } else {
        const squareNode = createEl('square', className) as sg.SquareNode;
        squareNode.sgKey = sk;
        translate(squareNode, translation, false);
        boardEl.insertBefore(squareNode, boardEl.firstChild);
      }
    }
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

        boardEl.appendChild(pieceNode);
      }
    }
  }

  if (handsEl !== undefined) {
    for (const i of [0, 1]) {
      // add hands if nonexistent yet
      const color = i === 0 ? 'sente' : 'gote';
      const hands = handsEl[i].firstElementChild || makeHand(s, handsEl[i], color);
      const handPieces = hands.getElementsByTagName('piece');
      for (let j = 0; j < handPieces.length; j++) {
        const role = handPieces[j].getAttribute('data-role') as sg.Role;
        handPieces[j].setAttribute('data-nb', (s.hands?.get({ color, role }) || 0).toString());
      }
    }
  }

  // remove any element that remains in the moved sets
  for (const nodes of movedPieces.values()) removeNodes(s, nodes);
  for (const nodes of movedSquares.values()) removeNodes(s, nodes);
}

export function updateBounds(s: State): void {
  if (s.dom.relative) return;
  const asSente: boolean = sentePov(s),
    posToTranslate = posToTranslateAbs(s.dimensions, s.dom.bounds());
  let el = s.dom.elements.board.firstChild as sg.PieceNode | sg.SquareNode | undefined;
  while (el) {
    if (isPieceNode(el) && !el.sgAnimating) translateAbs(el, posToTranslate(key2pos(el.sgKey), asSente));
    else if (isSquareNode(el)) translateAbs(el, posToTranslate(key2pos(el.sgKey), asSente), false);
    el = el.nextSibling as sg.PieceNode | sg.SquareNode | undefined;
  }
}

function isPieceNode(el: sg.PieceNode | sg.SquareNode): el is sg.PieceNode {
  return el.tagName === 'PIECE';
}
function isSquareNode(el: sg.PieceNode | sg.SquareNode): el is sg.SquareNode {
  return el.tagName === 'SQUARE';
}

function removeNodes(s: State, nodes: HTMLElement[]): void {
  for (const node of nodes) s.dom.elements.board.removeChild(node);
}

function pieceNameOf(piece: sg.Piece): string {
  return `${piece.color} ${piece.role}`;
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
  } else if (s.dropmode.active || s.draggable.current?.orig === '00') {
    const piece = s.dropmode.active ? s.dropmode.piece : s.draggable.current?.piece;
    if (piece && s.dropmode.showDropDests) {
      const dests = s.dropmode.dropDests?.get(piece.role);
      if (dests)
        for (const k of dests) {
          addSquare(squares, k, 'move-dest');
        }
      const pDests = s.predroppable.dropDests;
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

export function makeHand(s: State, element: HTMLElement, color: string): HTMLElement {
  const position = (s.orientation === 'sente') !== (color == 'sente') ? 'top' : 'bottom',
    hand = createEl('div', 'hand hand-' + position);
  element.appendChild(hand);
  for (const role of []) {
    // todo
    const c1 = createEl('div', 'hand-c1');
    hand.appendChild(c1);
    const c2 = createEl('div', 'hand-c2');
    c1.appendChild(c2);
    const piece = createEl('piece', role + ' ' + color);
    piece.setAttribute('data-role', role);
    piece.setAttribute('data-color', color);
    piece.setAttribute('data-nb', '0');
    c2.appendChild(piece);
  }
  return hand;
}

function appendValue<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const arr = map.get(key);
  if (arr) arr.push(value);
  else map.set(key, [value]);
}
