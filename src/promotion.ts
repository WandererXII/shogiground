import * as board from './board.js';
import * as sg from './types.js';
import { HeadlessState, State } from './state.js';
import { createEl, key2pos, pieceNameOf, posToTranslateRel, setDisplay, translateRel } from './util';

function setPromotion(s: HeadlessState, key: sg.Key, pieces: sg.Piece[]): void {
  s.promotion.current = { key, pieces };
}

function unsetPromotion(s: HeadlessState): void {
  s.promotion.current = undefined;
}

export function renderPromotion(s: State): void {
  const promotionEl = s.dom.board.elements.promotion,
    cur = s.promotion.current;
  if (promotionEl && cur) {
    const asSente = board.sentePov(s),
      initPos = key2pos(cur.key),
      promotionSquare = createEl('sg-promotion-square'),
      promotionChoices = createEl('sg-promotion-choices');
    translateRel(promotionSquare, posToTranslateRel(s.dimensions)(initPos, asSente), 1);

    for (const p of cur.pieces) {
      const pieceNode = createEl('piece', pieceNameOf(p)) as sg.PieceNode;
      pieceNode.sgColor = p.color;
      pieceNode.sgRole = p.role;
      promotionChoices.appendChild(pieceNode);
    }

    promotionEl.innerHTML = '';
    promotionSquare.appendChild(promotionChoices);
    promotionEl.appendChild(promotionSquare);
    setDisplay(promotionEl, true);
  } else if (promotionEl) {
    setDisplay(promotionEl, false);
  }
}

export function promote(s: State, e: sg.MouchEvent): void {
  e.stopPropagation();

  const target = e.target as HTMLElement | null,
    key = s.promotion.current?.key;
  if (target && sg.isPieceNode(target) && key) {
    const piece = { color: target.sgColor, role: target.sgRole };
    if (s.activeColor === 'both' || s.activeColor === s.turnColor) s.pieces.set(key, piece);
    board.callUserFunction(s.promotion.after, piece);
  } else board.callUserFunction(s.promotion.cancel);
  unsetPromotion(s);

  s.dom.redraw();
}

export function startPromotion(s: HeadlessState, key: sg.Key, pieces: sg.Piece[]): void {
  if (s.viewOnly) return;
  board.unselect(s);
  setPromotion(s, key, pieces);
}

export function cancelPromotion(s: HeadlessState): void {
  if (!s.promotion.current) return;
  unsetPromotion(s);
  board.callUserFunction(s.promotion.cancel);
}
