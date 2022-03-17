import { HeadlessState } from './state.js';
import { pos2key, opposite, samePiece } from './util.js';
import { premove } from './premove.js';
import * as sg from './types.js';
import { predrop } from './predrop.js';

export function callUserFunction<T extends (...args: any[]) => void>(f: T | undefined, ...args: Parameters<T>): void {
  if (f) setTimeout(() => f(...args), 1);
}

export function toggleOrientation(state: HeadlessState): void {
  state.orientation = opposite(state.orientation);
  state.animation.current = state.draggable.current = state.selected = state.selectedPiece = undefined;
}

export function reset(state: HeadlessState): void {
  state.lastMove = undefined;
  state.animation.current = state.draggable.current = undefined;
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

function setPremove(state: HeadlessState, orig: sg.Key, dest: sg.Key): void {
  unsetPredrop(state);
  state.premovable.current = [orig, dest];
  callUserFunction(state.premovable.events.set, orig, dest);
}

export function unsetPremove(state: HeadlessState): void {
  if (state.premovable.current) {
    state.premovable.current = undefined;
    callUserFunction(state.premovable.events.unset);
  }
}

function setPredrop(state: HeadlessState, piece: sg.Piece, key: sg.Key): void {
  unsetPremove(state);
  state.predroppable.current = { piece, key };
  callUserFunction(state.predroppable.events.set, piece, key);
}

export function unsetPredrop(state: HeadlessState): void {
  if (state.predroppable.current) {
    state.predroppable.current = undefined;
    callUserFunction(state.predroppable.events.unset);
  }
}

export function baseMove(state: HeadlessState, orig: sg.Key, dest: sg.Key): sg.Piece | boolean {
  const origPiece = state.pieces.get(orig),
    destPiece = state.pieces.get(dest);
  if (orig === dest || !origPiece) return false;
  const captured = destPiece && destPiece.color !== origPiece.color ? destPiece : undefined;
  if (dest === state.selected) unselect(state);
  callUserFunction(state.events.move, orig, dest, captured);
  state.pieces.set(dest, origPiece);
  state.pieces.delete(orig);
  state.lastMove = [orig, dest];
  state.check = undefined;
  callUserFunction(state.events.change);
  return captured || true;
}

export function baseDrop(state: HeadlessState, piece: sg.Piece, key: sg.Key, spare?: boolean): boolean {
  if (state.pieces.has(key) && !state.droppable.free) return false;
  callUserFunction(state.events.drop, piece, key);
  state.pieces.set(key, piece);
  state.lastMove = [key];
  if (!spare) removeFromHand(state, piece);
  state.check = undefined;
  callUserFunction(state.events.change);
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

function baseUserDrop(state: HeadlessState, piece: sg.Piece, key: sg.Key, spare?: boolean): boolean {
  const result = baseDrop(state, piece, key, spare);
  if (result) {
    state.movable.dests = undefined;
    state.droppable.dests = undefined;
    state.turnColor = opposite(state.turnColor);
    state.animation.current = undefined;
  }
  return result;
}

export function userDrop(state: HeadlessState, piece: sg.Piece, dest: sg.Key, spare?: boolean): boolean {
  if (canDrop(state, piece, dest)) {
    const result = baseUserDrop(state, piece, dest, spare);
    if (result) {
      unselect(state);
      callUserFunction(state.droppable.events.after, piece, dest, {
        premove: false,
        predrop: false,
      });
      return true;
    }
  } else if (canPredrop(state, piece, dest)) {
    setPredrop(state, piece, dest);
    unselect(state);
    return true;
  }
  unselect(state);
  return false;
}

export function userMove(state: HeadlessState, orig: sg.Key, dest: sg.Key): boolean {
  if (canMove(state, orig, dest)) {
    const result = baseUserMove(state, orig, dest);
    if (result) {
      unselect(state);
      const metadata: sg.MoveMetadata = {
        premove: false,
        predrop: false,
      };
      if (result !== true) metadata.captured = result;
      callUserFunction(state.movable.events.after, orig, dest, metadata);
      return true;
    }
  } else if (canPremove(state, orig, dest)) {
    setPremove(state, orig, dest);
    unselect(state);
    return true;
  }
  unselect(state);
  return false;
}

export function addToHand(state: HeadlessState, piece: sg.Piece, cnt = 1): void {
  const hand = state.hands.handMap.get(piece.color);
  if (hand && state.hands.roles.includes(piece.role)) hand.set(piece.role, (hand.get(piece.role) || 0) + cnt);
}

export function removeFromHand(state: HeadlessState, piece: sg.Piece, cnt = 1): void {
  const hand = state.hands.handMap.get(piece.color);
  const num = hand?.get(piece.role);
  if (hand && num) hand.set(piece.role, Math.max(num - cnt, 0));
}

export function selectSquare(state: HeadlessState, key: sg.Key, spare?: boolean, force?: boolean): void {
  callUserFunction(state.events.select, key);
  if (state.selectedPiece) {
    if (userDrop(state, state.selectedPiece, key, spare)) return;
  } else if (state.selected) {
    if (state.selected === key && !state.draggable.enabled) {
      unselect(state);
      return;
    } else if ((state.selectable.enabled || force) && state.selected !== key) {
      if (userMove(state, state.selected, key)) {
        return;
      }
    }
  }
  if (isMovable(state, key) || isPremovable(state, key)) {
    setSelected(state, key);
  }
}

export function selectPiece(state: HeadlessState, piece: sg.Piece): void {
  callUserFunction(state.events.pieceSelect, piece);

  if (!state.draggable.enabled && state.selectedPiece && samePiece(state.selectedPiece, piece)) unselect(state);
  else if (isDroppable(state, piece) || isPredroppable(state, piece)) {
    setSelectedPiece(state, piece);
  }
}

export function setSelected(state: HeadlessState, key: sg.Key): void {
  unselect(state);
  state.selected = key;

  if (isPremovable(state, key)) {
    state.premovable.dests = premove(state.pieces, key, state.dimensions);
  }
}

export function setSelectedPiece(state: HeadlessState, piece: sg.Piece): void {
  unselect(state);
  state.selectedPiece = piece;

  if (isPredroppable(state, piece)) {
    state.predroppable.dests = predrop(state.pieces, piece, state.dimensions);
  }
}

export function unselect(state: HeadlessState): void {
  state.selected = undefined;
  state.selectedPiece = undefined;
  state.premovable.dests = undefined;
  state.predroppable.dests = undefined;
}

function isMovable(state: HeadlessState, orig: sg.Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece && (state.activeColor === 'both' || (state.activeColor === piece.color && state.turnColor === piece.color))
  );
}

function isDroppable(state: HeadlessState, piece: sg.Piece): boolean {
  return state.activeColor === 'both' || (state.activeColor === piece.color && state.turnColor === piece.color);
}

export function canMove(state: HeadlessState, orig: sg.Key, dest: sg.Key): boolean {
  return (
    orig !== dest && isMovable(state, orig) && (state.movable.free || !!state.movable.dests?.get(orig)?.includes(dest))
  );
}

export function canDrop(state: HeadlessState, piece: sg.Piece, dest: sg.Key): boolean {
  return (
    isDroppable(state, piece) && (state.droppable.free || !!state.droppable.dests?.get(piece.role)?.includes(dest))
  );
}

function isPremovable(state: HeadlessState, orig: sg.Key): boolean {
  const piece = state.pieces.get(orig);
  return !!piece && state.premovable.enabled && state.activeColor === piece.color && state.turnColor !== piece.color;
}

export function isPredroppable(state: HeadlessState, piece: sg.Piece): boolean {
  return state.predroppable.enabled && state.activeColor === piece.color && state.turnColor !== piece.color;
}

function canPremove(state: HeadlessState, orig: sg.Key, dest: sg.Key): boolean {
  return orig !== dest && isPremovable(state, orig) && premove(state.pieces, orig, state.dimensions).includes(dest);
}

function canPredrop(state: HeadlessState, piece: sg.Piece, dest: sg.Key): boolean {
  const destPiece = state.pieces.get(dest);
  return (
    isPredroppable(state, piece) &&
    (!destPiece || destPiece.color !== state.activeColor) &&
    predrop(state.pieces, piece, state.dimensions).includes(dest)
  );
}

export function isDraggable(state: HeadlessState, piece: sg.Piece): boolean {
  return (
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
      const metadata: sg.MoveMetadata = { premove: true, predrop: false };
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
  if (canDrop(state, drop.piece, drop.key)) {
    if (baseUserDrop(state, drop.piece, drop.key)) {
      callUserFunction(state.droppable.events.after, drop.piece, drop.key, {
        premove: false,
        predrop: true,
      });
      success = true;
    }
  }
  unsetPredrop(state);
  return success;
}

export function cancelMoveOrDrop(state: HeadlessState): void {
  unsetPremove(state);
  unsetPredrop(state);
  unselect(state);
}

export function stop(state: HeadlessState): void {
  state.activeColor =
    state.movable.dests =
    state.droppable.dests =
    state.draggable.current =
    state.animation.current =
      undefined;
  cancelMoveOrDrop(state);
}

export function getKeyAtDomPos(
  pos: sg.NumberPair,
  asSente: boolean,
  dims: sg.Dimensions,
  bounds: DOMRect
): sg.Key | undefined {
  let file = Math.floor((dims.files * (pos[0] - bounds.left)) / bounds.width);
  if (asSente) file = dims.files - 1 - file;
  let rank = Math.floor((dims.ranks * (pos[1] - bounds.top)) / bounds.height);
  if (!asSente) rank = dims.ranks - 1 - rank;
  return file >= 0 && file < dims.files && rank >= 0 && rank < dims.ranks ? pos2key([file, rank]) : undefined;
}

export function sentePov(s: HeadlessState): boolean {
  return s.orientation === 'sente';
}
