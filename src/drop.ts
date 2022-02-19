import { State } from './state.js';
import * as sg from './types.js';
import * as board from './board.js';
import * as util from './util.js';
import { cancel as dragCancel } from './drag.js';
import { predrop } from './predrop.js';

export function setDropMode(s: State, piece: sg.Piece, fromHand: boolean): void {
  s.dropmode.active = true;
  s.dropmode.piece = piece;
  s.dropmode.fromHand = fromHand;
  dragCancel(s);
  board.unselect(s);
  if (board.isPredroppable(s, piece)) {
    s.predroppable.dests = predrop(s.pieces, piece, s.dimensions);
  }
}

export function drop(s: State, e: sg.MouchEvent): void {
  if (!s.dropmode.active) return;

  if (e.cancelable) e.preventDefault();

  board.unsetPremove(s);
  board.unsetPredrop(s);

  const piece = s.dropmode.piece;

  if (piece) {
    const position = util.eventPosition(e);
    const dest = position && board.getKeyAtDomPos(position, board.sentePov(s), s.dimensions, s.dom.bounds());
    if (dest) {
      board.userDrop(s, piece, dest, false, true);
      if (s.dropmode.fromHand) board.cancelDropMode(s);
    }
  }
  s.dom.redraw();
}
