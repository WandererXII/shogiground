import { HeadlessState } from './state.js';
import { pos2key, opposite } from './util.js';
import { premove } from './premove.js';
import * as sg from './types.js';

export function callUserFunction<T extends (...args: any[]) => void>(f: T | undefined, ...args: Parameters<T>): void {
  if (f) setTimeout(() => f(...args), 1);
}

export function toggleOrientation(state: HeadlessState): void {
  state.orientation = opposite(state.orientation);
  state.animation.current = state.draggable.current = state.selected = undefined;
}

export function reset(state: HeadlessState): void {
  state.lastMove = undefined;
  unselect(state);
  unsetPremove(state);
  unsetPredrop(state);
}

export function setPieces(state: HeadlessState, pieces: sg.PiecesDiff): void {
  for (const [key, piece] of pieces) {
    if (piece) state.pieces.set(key, piece);
    else state.pieces.delete(key);
  }
}

export function setCheck(state: HeadlessState, color: sg.Color | boolean): void {
  state.check = undefined;
  if (color === true) color = state.turnColor;
  if (color)
    for (const [k, p] of state.pieces) {
      if (p.role === 'king' && p.color === color) {
        state.check = k;
      }
    }
}

function setPremove(state: HeadlessState, orig: sg.Key, dest: sg.Key, meta: sg.SetPremoveMetadata): void {
  unsetPredrop(state);
  state.premovable.current = [orig, dest];
  callUserFunction(state.premovable.events.set, orig, dest, meta);
}

export function unsetPremove(state: HeadlessState): void {
  if (state.premovable.current) {
    state.premovable.current = undefined;
    callUserFunction(state.premovable.events.unset);
  }
}

function setPredrop(state: HeadlessState, role: sg.Role, key: sg.Key): void {
  unsetPremove(state);
  state.predroppable.current = { role, key };
  callUserFunction(state.predroppable.events.set, role, key);
}

export function unsetPredrop(state: HeadlessState): void {
  const pd = state.predroppable;
  if (pd.current) {
    pd.current = undefined;
    callUserFunction(pd.events.unset);
  }
}

export function baseMove(state: HeadlessState, orig: sg.Key, dest: sg.Key): sg.Piece | boolean {
  const origPiece = state.pieces.get(orig),
    destPiece = state.pieces.get(dest);
  if (orig === dest || !origPiece) return false;
  const captured = destPiece && destPiece.color !== origPiece.color ? destPiece : undefined;
  if (state.hands.enabled && captured) {
    const afterRole = state.hands.captureProcessing(captured.role);
    if (afterRole) addToHand(state, { color: opposite(captured.color), role: afterRole });
  }
  if (dest === state.selected) unselect(state);
  callUserFunction(state.events.move, orig, dest, captured);
  state.pieces.set(dest, origPiece);
  state.pieces.delete(orig);
  state.lastMove = [orig, dest];
  state.check = undefined;
  callUserFunction(state.events.change);
  return captured || true;
}

export function baseDrop(state: HeadlessState, piece: sg.Piece, key: sg.Key, force?: boolean): boolean {
  if (state.pieces.has(key)) {
    if (force) state.pieces.delete(key);
    else return false;
  }
  callUserFunction(state.events.drop, piece, key);
  state.pieces.set(key, piece);
  state.lastMove = [key];
  state.check = undefined;
  callUserFunction(state.events.change);
  state.movable.dests = undefined;
  state.droppable.dests = undefined;
  state.turnColor = opposite(state.turnColor);
  return true;
}

function baseUserMove(state: HeadlessState, orig: sg.Key, dest: sg.Key): sg.Piece | boolean {
  const result = baseMove(state, orig, dest);
  if (result) {
    state.movable.dests = undefined;
    state.droppable.dests = undefined;
    state.turnColor = opposite(state.turnColor);
    state.animation.current = undefined;
  }
  return result;
}

export function userDrop(state: HeadlessState, dest: sg.Key, force?: boolean, fromHand?: boolean): void {
  const piece = state.pieces.get('00');
  if (piece && (canDrop(state, dest) || force)) {
    state.pieces.delete('00');
    if (baseDrop(state, piece, dest, force) && fromHand) {
      removeFromHand(state, piece);
      state.dropmode.active = false;
      state.dropmode.piece = undefined;
    }
    callUserFunction(state.droppable.events.after, piece, dest, {
      premove: false,
      predrop: false,
    });
  } else if (piece && canPredrop(state, dest)) {
    setPredrop(state, piece.role, dest);
  } else {
    unsetPremove(state);
    unsetPredrop(state);
  }
  state.pieces.delete('00');
  unselect(state);
}

export function userMove(state: HeadlessState, orig: sg.Key, dest: sg.Key): boolean {
  if (canMove(state, orig, dest)) {
    const result = baseUserMove(state, orig, dest);
    if (result) {
      const holdTime = state.hold.stop();
      unselect(state);
      const metadata: sg.MoveMetadata = {
        premove: false,
        ctrlKey: state.stats.ctrlKey,
        holdTime,
      };
      if (result !== true) metadata.captured = result;
      callUserFunction(state.movable.events.after, orig, dest, metadata);
      return true;
    }
  } else if (canPremove(state, orig, dest)) {
    setPremove(state, orig, dest, {
      ctrlKey: state.stats.ctrlKey,
    });
    unselect(state);
    return true;
  }
  unselect(state);
  return false;
}

export function addToHand(state: HeadlessState, piece: sg.Piece, cnt = 1): void {
  const hand = state.hands.handMap.get(piece.color);
  if (hand) hand.set(piece.role, (hand.get(piece.role) || 0) + cnt);
}

export function removeFromHand(state: HeadlessState, piece: sg.Piece, cnt = 1): void {
  const hand = state.hands.handMap.get(piece.color);
  const num = hand?.get(piece.role);
  if (hand && num) hand.set(piece.role, Math.max(num - cnt, 0));
}

export function selectSquare(state: HeadlessState, key: sg.Key, force?: boolean): void {
  callUserFunction(state.events.select, key);
  if (state.selected) {
    if (state.selected === key && !state.draggable.enabled) {
      unselect(state);
      state.hold.cancel();
      return;
    } else if ((state.selectable.enabled || force) && state.selected !== key) {
      if (userMove(state, state.selected, key)) {
        state.stats.dragged = false;
        return;
      }
    }
  }
  if (isMovable(state, key) || isPremovable(state, key)) {
    setSelected(state, key);
    state.hold.start();
  }
}

export function setSelected(state: HeadlessState, key: sg.Key): void {
  state.selected = key;
  if (isPremovable(state, key)) {
    state.premovable.dests = premove(state.pieces, key, state.dimensions);
  } else {
    state.premovable.dests = undefined;
    state.predroppable.dropDests = undefined;
  }
}

export function unselect(state: HeadlessState): void {
  state.selected = undefined;
  state.premovable.dests = undefined;
  state.predroppable.dropDests = undefined;
  state.hold.cancel();
}

function isMovable(state: HeadlessState, orig: sg.Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece && (state.activeColor === 'both' || (state.activeColor === piece.color && state.turnColor === piece.color))
  );
}

export function canMove(state: HeadlessState, orig: sg.Key, dest: sg.Key): boolean {
  return (
    orig !== dest && isMovable(state, orig) && (state.movable.free || !!state.movable.dests?.get(orig)?.includes(dest))
  );
}

function canDrop(state: HeadlessState, dest: sg.Key): boolean {
  const piece = state.pieces.get('00');
  return (
    !!piece &&
    ('00' === dest || !state.pieces.has(dest)) &&
    (state.activeColor === 'both' || (state.activeColor === piece.color && state.turnColor === piece.color)) &&
    (state.droppable.free || !!state.droppable.dests?.get(piece.role)?.includes(dest))
  );
}

function isPremovable(state: HeadlessState, orig: sg.Key): boolean {
  const piece = state.pieces.get(orig);
  return !!piece && state.premovable.enabled && state.activeColor === piece.color && state.turnColor !== piece.color;
}

export function isPredroppable(state: HeadlessState): boolean {
  const piece = state.dropmode.active ? state.dropmode.piece : state.draggable.current?.piece;
  return (
    !!piece &&
    (state.dropmode.active || state.draggable.current?.orig === '00') &&
    state.predroppable.enabled &&
    state.activeColor === piece.color &&
    state.turnColor !== piece.color
  );
}

function canPremove(state: HeadlessState, orig: sg.Key, dest: sg.Key): boolean {
  return orig !== dest && isPremovable(state, orig) && premove(state.pieces, orig, state.dimensions).includes(dest);
}

function canPredrop(state: HeadlessState, dest: sg.Key): boolean {
  const piece = state.pieces.get('00');
  const destPiece = state.pieces.get(dest);
  return (
    !!piece &&
    (!destPiece || destPiece.color !== state.activeColor) &&
    state.predroppable.enabled &&
    state.activeColor === piece.color &&
    state.turnColor !== piece.color
  );
}

export function isDraggable(state: HeadlessState, orig: sg.Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece &&
    state.draggable.enabled &&
    (state.activeColor === 'both' ||
      (state.activeColor === piece.color && (state.turnColor === piece.color || state.premovable.enabled)))
  );
}

export function playPremove(state: HeadlessState): boolean {
  const move = state.premovable.current;
  if (!move) return false;
  const orig = move[0],
    dest = move[1];
  let success = false;
  if (canMove(state, orig, dest)) {
    const result = baseUserMove(state, orig, dest);
    if (result) {
      const metadata: sg.MoveMetadata = { premove: true };
      if (result !== true) metadata.captured = result;
      callUserFunction(state.movable.events.after, orig, dest, metadata);
      success = true;
    }
  }
  unsetPremove(state);
  return success;
}

export function playPredrop(state: HeadlessState): boolean {
  const drop = state.predroppable.current;
  let success = false;
  if (!drop) return false;
  if (canDrop(state, drop.key)) {
    const piece = {
      role: drop.role,
      color: state.activeColor,
    } as sg.Piece;
    if (baseDrop(state, piece, drop.key)) {
      callUserFunction(state.droppable.events.after, piece, drop.key, {
        premove: false,
        predrop: true,
      });
      success = true;
    }
  }
  unsetPredrop(state);
  return success;
}

export function cancelMove(state: HeadlessState): void {
  unsetPremove(state);
  unsetPredrop(state);
  unselect(state);
}

export function stop(state: HeadlessState): void {
  state.activeColor = state.movable.dests = state.droppable.dests = state.animation.current = undefined;
  cancelMove(state);
}

export function getKeyAtDomPos(
  pos: sg.NumberPair,
  asSente: boolean,
  dims: sg.Dimensions,
  bounds: ClientRect
): sg.Key | undefined {
  let file = Math.floor((dims.files * (pos[0] - bounds.left)) / bounds.width);
  if (asSente) file = dims.files - 1 - file;
  let rank = dims.ranks - 1 - Math.floor((dims.ranks * (pos[1] - bounds.top)) / bounds.height);
  if (asSente) rank = dims.ranks - 1 - rank;
  return file >= 0 && file < dims.files && rank >= 0 && rank < dims.ranks ? pos2key([file, rank]) : undefined;
}

export function sentePov(s: HeadlessState): boolean {
  return s.orientation === 'sente';
}
