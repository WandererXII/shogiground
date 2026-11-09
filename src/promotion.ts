import { anim } from './anim.js';
import { unselect, userDrop, userMove } from './board.js';
import type { State } from './state.js';
import type { Piece } from './types.js';
import { callUserFunction, samePiece } from './util.js';

// Both pointer and keyboard choices finish the same pending move or drop.
export function choosePromotion(s: State, piece?: Piece): void {
  const cur = s.promotion.current;
  if (piece && cur) {
    s.promotion.current = s.hovered = undefined;
    const prom = !samePiece(cur.piece, piece);
    const turn = s.turnColor;
    const play = (s: State) => {
      if (s.selected) userMove(s, s.selected, cur.key, prom);
      else if (s.selectedPiece) userDrop(s, s.selectedPiece, cur.key, prom);
    };
    if (cur.dragged || (turn !== s.activeColor && s.activeColor !== 'both')) play(s);
    else {
      callUserFunction(s.events.select, cur.key);
      anim(play, s);
    }

    // An immediate move or drop advances the turn. Queuing one does not.
    if (s.turnColor !== turn) callUserFunction(s.promotion.events.after, piece);
    else callUserFunction(s.promotion.events.cancel);
  } else if (cur) unselect(s);
  s.dom.redraw();
}
