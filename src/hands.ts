import type { HeadlessState } from './state.js';
import * as sg from './types.js';
import { samePiece } from './util.js';

export function addToHand(s: HeadlessState, piece: sg.Piece, cnt = 1): void {
  const hand = s.hands.handMap.get(piece.color),
    role = (s.hands.roles.includes(piece.role) ? piece.role : s.promotion.unpromotesTo(piece.role)) || piece.role;
  if (hand && s.hands.roles.includes(role)) hand.set(role, (hand.get(role) || 0) + cnt);
}

export function removeFromHand(s: HeadlessState, piece: sg.Piece, cnt = 1): void {
  const hand = s.hands.handMap.get(piece.color),
    role = (s.hands.roles.includes(piece.role) ? piece.role : s.promotion.unpromotesTo(piece.role)) || piece.role,
    num = hand?.get(role);
  if (hand && num) hand.set(role, Math.max(num - cnt, 0));
}

export function renderHand(s: HeadlessState, handEl: HTMLElement): void {
  handEl.classList.toggle('promotion', !!s.promotion.current);
  let wrapEl = handEl.firstElementChild as HTMLElement | undefined;
  while (wrapEl) {
    const pieceEl = wrapEl.firstElementChild as sg.PieceNode,
      piece = { role: pieceEl.sgRole, color: pieceEl.sgColor },
      num = s.hands.handMap.get(piece.color)?.get(piece.role) || 0,
      isSelected = !!s.selectedPiece && samePiece(piece, s.selectedPiece) && !s.droppable.spare;

    wrapEl.classList.toggle('selected', (s.activeColor === 'both' || s.activeColor === s.turnColor) && isSelected);
    wrapEl.classList.toggle('preselected', s.activeColor !== 'both' && s.activeColor !== s.turnColor && isSelected);
    wrapEl.classList.toggle('drawing', !!s.drawable.piece && samePiece(s.drawable.piece, piece));
    wrapEl.classList.toggle('current-pre', !!s.predroppable.current && samePiece(s.predroppable.current.piece, piece));
    wrapEl.dataset.nb = num.toString();
    wrapEl = wrapEl.nextElementSibling as HTMLElement | undefined;
  }
}
