import * as board from './board.js';
import * as sg from './types.js';
import { State } from './state.js';
import { createEl, key2pos, pieceNameOf, posToTranslateRel, setDisplay, translateRel } from './util';

function setPromotion(s: State, key: sg.Key, pieces: sg.Piece[]): void {
  s.promotion.active = true;
  s.promotion.key = key;
  s.promotion.pieces = pieces;
}

function unsetPromotion(s: State): void {
  s.promotion.active = false;
  s.promotion.key = undefined;
  s.promotion.pieces = undefined;
}

export function renderPromotion(s: State): void {
  const promotionEl = s.dom.board.elements.promotion;
  if (promotionEl && s.promotion.active && s.promotion.key && s.promotion.pieces) {
    const asSente = board.sentePov(s),
      initPos = key2pos(s.promotion.key),
      promotionSquare = createEl('sg-promotion-square'),
      promotionChoices = createEl('sg-promotion-choices');
    translateRel(promotionSquare, posToTranslateRel(s.dimensions)(initPos, asSente), 1);

    for (const p of s.promotion.pieces) {
      const pieceNode = createEl('piece', pieceNameOf(p)) as sg.PieceNode;
      pieceNode.sgColor = p.color;
      pieceNode.sgRole = p.role;
      promotionChoices.appendChild(pieceNode);
    }

    promotionEl.innerHTML = '';
    promotionSquare.appendChild(promotionChoices);
    promotionEl.appendChild(promotionSquare);
    setDisplay(promotionEl, s.promotion.active);
  } else if (promotionEl) {
    setDisplay(promotionEl, false);
  }
}

export function promote(s: State, e: sg.MouchEvent): void {
  e.stopPropagation();

  const target = e.target as HTMLElement | null,
    key = s.promotion.key;
  if (target && sg.isPieceNode(target) && key && s.promotion.active) {
    const piece = { color: target.sgColor, role: target.sgRole };
    if (s.activeColor === 'both' || s.activeColor === s.turnColor) s.pieces.set(key, piece);
    board.callUserFunction(s.promotion.after, piece);
  } else board.callUserFunction(s.promotion.cancel);
  unsetPromotion(s);

  s.dom.redraw();
}

export function startPromotion(s: State, key: sg.Key, pieces: sg.Piece[]): void {
  if (s.viewOnly) return;
  board.unselect(s);
  setPromotion(s, key, pieces);
}

export function cancelPromotion(s: State): void {
  if (!s.promotion.active || !s.dom.board.elements.promotion) return;
  unsetPromotion(s);
  board.callUserFunction(s.promotion.cancel);
}
