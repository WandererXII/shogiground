import { anim } from './anim.js';
import { cancelPromotion, selectSquare, userDrop, userMove } from './board.js';
import type { State } from './state.js';
import type { Piece } from './types.js';
import { callUserFunction, samePiece } from './util.js';

// Both pointer and keyboard choices finish the same pending move or drop.
export function choosePromotion(s: State, piece?: Piece): void {
  const cur = s.promotion.current;
  if (piece && cur) {
    const prom = !samePiece(cur.piece, piece);
    if (cur.dragged || (s.turnColor !== s.activeColor && s.activeColor !== 'both')) {
      if (s.selected) userMove(s, s.selected, cur.key, prom);
      else if (s.selectedPiece) userDrop(s, s.selectedPiece, cur.key, prom);
    } else anim((s) => selectSquare(s, cur.key, prom), s);

    callUserFunction(s.promotion.events.after, piece);
  } else anim((s) => cancelPromotion(s), s);
  s.promotion.current = undefined;
  s.dom.redraw();
}
