import { State } from './state.js';
import { key2pos, createEl, setDisplay, posToTranslateRel, translateRel, pieceNameOf, sentePov } from './util.js';
import { AnimCurrent, AnimVectors, AnimVector, AnimFadings, AnimPromotions } from './anim.js';
import { DragCurrent } from './drag.js';
import * as sg from './types.js';

type SquareClasses = Map<sg.Key, string>;

export function render(s: State): void {
  const asSente: boolean = sentePov(s.orientation),
    scaleDown = s.scaleDownPieces ? 0.5 : 1,
    posToTranslate = posToTranslateRel(s.dimensions),
    squaresEl: HTMLElement = s.dom.board.elements.squares,
    piecesEl: HTMLElement = s.dom.board.elements.pieces,
    draggedEl: sg.PieceNode | undefined = s.dom.board.elements.dragged,
    squareOverEl: HTMLElement | undefined = s.dom.board.elements.squareOver,
    promotionEl: HTMLElement | undefined = s.dom.board.elements.promotion,
    pieces: sg.Pieces = s.pieces,
    curAnim: AnimCurrent | undefined = s.animation.current,
    anims: AnimVectors = curAnim ? curAnim.plan.anims : new Map(),
    fadings: AnimFadings = curAnim ? curAnim.plan.fadings : new Map(),
    promotions: AnimPromotions = curAnim ? curAnim.plan.promotions : new Map(),
    curDrag: DragCurrent | undefined = s.draggable.current,
    curPromKey: sg.Key | undefined = s.promotion.current?.dragged ? s.selected : undefined,
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
    prom: sg.Piece | undefined,
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
      prom = promotions.get(k);
      elPieceName = pieceNameOf({ color: el.sgColor, role: el.sgRole });

      // if piece dragged add or remove ghost class or if promotion dialog is active for the piece add prom class
      if (((curDrag?.started && curDrag.fromBoard?.orig === k) || (curPromKey && curPromKey === k)) && !el.sgGhost) {
        el.sgGhost = true;
        el.classList.add('ghost');
      } else if (el.sgGhost && (!curDrag || curDrag.fromBoard?.orig !== k) && (!curPromKey || curPromKey !== k)) {
        el.sgGhost = false;
        el.classList.remove('ghost');
      }
      // remove fading class if it still remains
      if (!fading && el.sgFading) {
        el.sgFading = false;
        el.classList.remove('fading');
      }
      // there is now a piece at this dom key
      if (pieceAtKey) {
        // continue animation if already animating and same piece or promoting piece
        // (otherwise it could animate a captured piece)
        if (
          anim &&
          el.sgAnimating &&
          (elPieceName === pieceNameOf(pieceAtKey) || (prom && elPieceName === pieceNameOf(prom)))
        ) {
          const pos = key2pos(k);
          pos[0] += anim[2];
          pos[1] += anim[3];
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
        // different piece: flag as moved unless it is a fading piece or an animated promoting piece
        else {
          if (fading && elPieceName === pieceNameOf(fading)) {
            el.sgFading = true;
            el.classList.add('fading');
          } else if (prom && elPieceName === pieceNameOf(prom)) {
            samePieces.add(k);
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
    const piece = promotions.get(k) || p;
    anim = anims.get(k);
    if (!samePieces.has(k)) {
      pMvdset = movedPieces.get(pieceNameOf(piece));
      pMvd = pMvdset && pMvdset.pop();
      // a same piece was moved
      if (pMvd) {
        // apply dom changes
        pMvd.sgKey = k;
        if (pMvd.sgFading) {
          pMvd.sgFading = false;
          pMvd.classList.remove('fading');
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
  // remove any element that remains in the moved sets
  for (const nodes of movedPieces.values()) removeNodes(s, nodes);

  if (promotionEl) renderPromotion(s, promotionEl);
}

function removeNodes(s: State, nodes: HTMLElement[]): void {
  for (const node of nodes) s.dom.board.elements.pieces.removeChild(node);
}

function appendValue<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const arr = map.get(key);
  if (arr) arr.push(value);
  else map.set(key, [value]);
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
    addSquare(squares, premove.dest, 'current-pre' + (premove.prom ? ' prom' : ''));
  } else if (s.predroppable.current)
    addSquare(squares, s.predroppable.current.key, 'current-pre' + (s.predroppable.current.prom ? ' prom' : ''));

  return squares;
}

function addSquare(squares: SquareClasses, key: sg.Key, klass: string): void {
  const classes = squares.get(key);
  if (classes) squares.set(key, `${classes} ${klass}`);
  else squares.set(key, klass);
}

function renderPromotion(s: State, promotionEl: HTMLElement): void {
  const cur = s.promotion.current,
    key = cur && cur.key,
    pieces = cur ? [cur.promotedPiece, cur.piece] : [],
    hash = promotionHash(!!cur, key, pieces);
  if (s.promotion.prevPromotionHash === hash) return;
  s.promotion.prevPromotionHash = hash;

  if (key) {
    const asSente = sentePov(s.orientation),
      initPos = key2pos(key),
      promotionSquare = createEl('sg-promotion-square'),
      promotionChoices = createEl('sg-promotion-choices');
    translateRel(promotionSquare, posToTranslateRel(s.dimensions)(initPos, asSente), 1);

    for (const p of pieces) {
      const pieceNode = createEl('piece', pieceNameOf(p)) as sg.PieceNode;
      pieceNode.sgColor = p.color;
      pieceNode.sgRole = p.role;
      promotionChoices.appendChild(pieceNode);
    }

    promotionEl.innerHTML = '';
    promotionSquare.appendChild(promotionChoices);
    promotionEl.appendChild(promotionSquare);
    setDisplay(promotionEl, true);
  } else {
    setDisplay(promotionEl, false);
  }
}

function promotionHash(active: boolean, key: sg.Key | undefined, pieces: sg.Piece[]): string {
  return [active, key, pieces.map(p => pieceNameOf(p)).join(' ')].join(' ');
}
