import { HeadlessState } from './state.js';
import * as sg from './types.js';
import { samePiece } from './util.js';

export function addToHand(s: HeadlessState, piece: sg.Piece, cnt = 1): void {
  const hand = s.hands.handMap.get(piece.color);
  if (hand && s.hands.roles.includes(piece.role)) hand.set(piece.role, (hand.get(piece.role) || 0) + cnt);
}

export function removeFromHand(s: HeadlessState, piece: sg.Piece, cnt = 1): void {
  const hand = s.hands.handMap.get(piece.color);
  const num = hand?.get(piece.role);
  if (hand && num) hand.set(piece.role, Math.max(num - cnt, 0));
}

export function renderHand(s: HeadlessState, handEl: HTMLElement): void {
  handEl.classList.toggle('promotion', !!s.promotion.current);
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
