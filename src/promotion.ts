import * as board from './board.js';
import * as sg from './types.js';
import { State } from './state.js';
import { createEl, key2pos, pieceNameOf, posToTranslateAbs, setDisplay, translateAbs } from './util';

export function setPromotion(s: State, key: sg.Key, pieces: sg.Piece[]): void {
  s.promotion.active = true;
  s.promotion.key = key;
  s.promotion.pieces = pieces;
}

export function cancelPromotion(s: State): void {
  s.promotion.active = false;
  s.promotion.key = undefined;
  s.promotion.pieces = undefined;
}

export function renderPromotions(s: State): void {
  const promotionEl = s.dom.elements.promotion;
  if (!s.promotion.active || !s.promotion.key || !s.promotion.pieces || !promotionEl) return;

  const asSente = board.sentePov(s),
    initPos = key2pos(s.promotion.key);
  const promotionChoice = createEl('promotion');
  translateAbs(promotionChoice, posToTranslateAbs(s.dimensions, s.dom.bounds())(initPos, asSente), 1);

  s.promotion.pieces.forEach(p => {
    const pieceNode = createEl('piece', pieceNameOf(p)) as sg.PieceNode;
    pieceNode.sgColor = p.color;
    pieceNode.sgRole = p.role;
    promotionChoice.appendChild(pieceNode);
  });

  promotionEl.innerHTML = '';
  promotionEl.appendChild(promotionChoice);
  setDisplay(promotionEl, s.promotion.active);
}

export function promote(s: State, e: sg.MouchEvent): void {
  e.preventDefault();

  const key = s.promotion.key,
    target = e.target as HTMLElement | null;

  if (s.promotion.active && key && target && sg.isPieceNode(target)) {
    const piece = { color: target.sgColor, role: target.sgRole };
    s.pieces.set(key, piece);
    board.callUserFunction(s.promotion.after, piece);
  } else board.callUserFunction(s.promotion.cancel);

  cancelPromotion(s);
  setDisplay(s.dom.elements.promotion!, false);

  s.dom.redraw();
}
