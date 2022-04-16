import { State } from './state.js';
import { key2pos, createEl, setDisplay, posToTranslateRel, translateRel, pieceNameOf, samePiece } from './util.js';
import { sentePov } from './board.js';
import { AnimCurrent, AnimVectors, AnimVector, AnimFadings } from './anim.js';
import { DragCurrent } from './drag.js';
import * as sg from './types.js';

type SquareClasses = Map<sg.Key, string>;

export function render(s: State): void {
  const asSente: boolean = sentePov(s),
    scaleDown = s.scaleDownPieces ? 0.5 : 1,
    posToTranslate = posToTranslateRel(s.dimensions),
    squaresEl: HTMLElement = s.dom.board.elements.squares,
    piecesEl: HTMLElement = s.dom.board.elements.pieces,
    draggedEl: sg.PieceNode | undefined = s.dom.board.elements.dragged,
    squareOverEl: HTMLElement | undefined = s.dom.board.elements.squareOver,
    handTopEl: HTMLElement | undefined = s.dom.hands.elements.top,
    handBotEl: HTMLElement | undefined = s.dom.hands.elements.bottom,
    pieces: sg.Pieces = s.pieces,
    curAnim: AnimCurrent | undefined = s.animation.current,
    anims: AnimVectors = curAnim ? curAnim.plan.anims : new Map(),
    fadings: AnimFadings = curAnim ? curAnim.plan.fadings : new Map(),
    curDrag: DragCurrent | undefined = s.draggable.current,
    squares: SquareClasses = computeSquareClasses(s),
    samePieces: Set<sg.Key> = new Set(),
    movedPieces: Map<sg.PieceName, sg.PieceNode[]> = new Map();

  // if piece not being dragged anymore, hide it
  if (!curDrag && draggedEl?.sgDragging) {
    draggedEl.sgDragging = false;
    setDisplay(draggedEl, false);
    if (squareOverEl) setDisplay(squareOverEl, false);
  }

  let k: sg.Key,
    el: HTMLElement | undefined,
    pieceAtKey: sg.Piece | undefined,
    elPieceName: sg.PieceName,
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
      elPieceName = pieceNameOf({ color: el.sgColor, role: el.sgRole });

      // if piece dragged add or remove ghost class
      if (curDrag?.started && curDrag.fromBoard?.orig === k) {
        el.classList.add('ghost');
        el.sgGhost = true;
      } else if (el.sgGhost && (!curDrag || curDrag.fromBoard?.orig !== k)) {
        el.classList.remove('ghost');
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
          translateRel(el, posToTranslate(pos, asSente), scaleDown);
        } else if (el.sgAnimating) {
          el.sgAnimating = false;
          el.classList.remove('anim');
          translateRel(el, posToTranslate(key2pos(k), asSente), scaleDown);
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
    sqEl.className = squares.get(sqEl.sgKey) || '';
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
        translateRel(pMvd, posToTranslate(pos, asSente), scaleDown);
      }
      // no piece in moved obj: insert the new piece
      // assumes the new piece is not being dragged
      else {
        const pieceNode = createEl('piece', pieceNameOf(p)) as sg.PieceNode,
          pos = key2pos(k);

        pieceNode.sgColor = p.color;
        pieceNode.sgRole = p.role;
        pieceNode.sgKey = k;
        if (anim) {
          pieceNode.sgAnimating = true;
          pos[0] += anim[2];
          pos[1] += anim[3];
        }
        translateRel(pieceNode, posToTranslate(pos, asSente), scaleDown);

        piecesEl.appendChild(pieceNode);
      }
    }
  }

  if (handTopEl) updateHand(s, handTopEl);
  if (handBotEl) updateHand(s, handBotEl);

  // remove any element that remains in the moved sets
  for (const nodes of movedPieces.values()) removeNodes(s, nodes);
}

function removeNodes(s: State, nodes: HTMLElement[]): void {
  for (const node of nodes) s.dom.board.elements.pieces.removeChild(node);
}

function computeSquareClasses(s: State): SquareClasses {
  const squares: SquareClasses = new Map();
  if (s.lastDests && s.highlight.lastDests) for (const k of s.lastDests) addSquare(squares, k, 'last-dest');
  if (s.check && s.highlight.check) addSquare(squares, s.check, 'check');
  if (s.draggable.current?.hovering) addSquare(squares, s.draggable.current.hovering, 'hover');
  if (s.selected) {
    if (s.activeColor === 'both' || s.activeColor === s.turnColor) addSquare(squares, s.selected, 'selected');
    else addSquare(squares, s.selected, 'preselected');
    if (s.movable.showDests) {
      const dests = s.movable.dests?.get(s.selected);
      if (dests)
        for (const k of dests) {
          addSquare(squares, k, 'dest' + (s.pieces.has(k) ? ' oc' : ''));
        }
      const pDests = s.premovable.dests;
      if (pDests)
        for (const k of pDests) {
          addSquare(squares, k, 'pre-dest' + (s.pieces.has(k) ? ' oc' : ''));
        }
    }
  } else if (s.selectedPiece) {
    if (s.droppable.showDests) {
      const dests = s.droppable.dests?.get(s.selectedPiece.role);
      if (dests)
        for (const k of dests) {
          addSquare(squares, k, 'dest');
        }
      const pDests = s.predroppable.dests;
      if (pDests)
        for (const k of pDests) {
          addSquare(squares, k, 'pre-dest' + (s.pieces.has(k) ? ' oc' : ''));
        }
    }
  }
  const premove = s.premovable.current;
  if (premove) {
    addSquare(squares, premove.orig, 'current-pre');
    addSquare(squares, premove.dest, 'current-pre');
  } else if (s.predroppable.current) addSquare(squares, s.predroppable.current.key, 'current-pre');

  return squares;
}

function addSquare(squares: SquareClasses, key: sg.Key, klass: string): void {
  const classes = squares.get(key);
  if (classes) squares.set(key, `${classes} ${klass}`);
  else squares.set(key, klass);
}

function updateHand(s: State, handEl: HTMLElement): void {
  handEl.classList.toggle('promotion', s.promotion.active);
  let pieceEl = handEl.firstElementChild as sg.PieceNode | undefined;
  while (pieceEl) {
    const piece = { role: pieceEl.sgRole, color: pieceEl.sgColor };
    const num = s.hands.handMap.get(piece.color)?.get(piece.role) || 0;
    const isSelected = !!s.selectedPiece && samePiece(piece, s.selectedPiece) && !s.droppable.spare;

    pieceEl.classList.toggle('selected', (s.activeColor === 'both' || s.activeColor === s.turnColor) && isSelected);
    pieceEl.classList.toggle('preselected', s.activeColor !== 'both' && s.activeColor !== s.turnColor && isSelected);
    pieceEl.classList.toggle('drawing', !!s.drawable.piece && samePiece(s.drawable.piece, piece));
    pieceEl.classList.toggle('current-pre', !!s.predroppable.current && samePiece(s.predroppable.current.piece, piece));
    pieceEl.dataset.nb = num.toString();
    pieceEl = pieceEl.nextElementSibling as sg.PieceNode | undefined;
  }
}

function appendValue<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const arr = map.get(key);
  if (arr) arr.push(value);
  else map.set(key, [value]);
}
