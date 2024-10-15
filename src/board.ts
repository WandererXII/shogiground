import type { HeadlessState } from './state.js';
import type * as sg from './types.js';
import { callUserFunction, opposite, pieceNameOf, samePiece } from './util.js';
import { addToHand, removeFromHand } from './hands.js';

export function toggleOrientation(state: HeadlessState): void {
  state.orientation = opposite(state.orientation);
  state.animation.current =
    state.draggable.current =
    state.promotion.current =
    state.hovered =
    state.selected =
    state.selectedPiece =
      undefined;
}

export function reset(state: HeadlessState): void {
  unselect(state);
  unsetPremove(state);
  unsetPredrop(state);
  cancelPromotion(state);
  state.animation.current = state.draggable.current = state.hovered = undefined;
}

export function setPieces(state: HeadlessState, pieces: sg.PiecesDiff): void {
  for (const [key, piece] of pieces) {
    if (piece) state.pieces.set(key, piece);
    else state.pieces.delete(key);
  }
}

export function setChecks(state: HeadlessState, checksValue: sg.Key[] | sg.Color | boolean): void {
  if (Array.isArray(checksValue)) {
    state.checks = checksValue;
  } else {
    if (checksValue === true) checksValue = state.turnColor;
    if (checksValue) {
      const checks: sg.Key[] = [];
      for (const [k, p] of state.pieces) {
        if (state.highlight.checkRoles.includes(p.role) && p.color === checksValue) checks.push(k);
      }
      state.checks = checks;
    } else state.checks = undefined;
  }
}

function setPremove(state: HeadlessState, orig: sg.Key, dest: sg.Key, prom: boolean): void {
  unsetPredrop(state);
  state.premovable.current = { orig, dest, prom };
  callUserFunction(state.premovable.events.set, orig, dest, prom);
}

export function unsetPremove(state: HeadlessState): void {
  if (state.premovable.current) {
    state.premovable.current = undefined;
    callUserFunction(state.premovable.events.unset);
  }
}

function setPredrop(state: HeadlessState, piece: sg.Piece, key: sg.Key, prom: boolean): void {
  unsetPremove(state);
  state.predroppable.current = { piece, key, prom };
  callUserFunction(state.predroppable.events.set, piece, key, prom);
}

export function unsetPredrop(state: HeadlessState): void {
  if (state.predroppable.current) {
    state.predroppable.current = undefined;
    callUserFunction(state.predroppable.events.unset);
  }
}

export function baseMove(
  state: HeadlessState,
  orig: sg.Key,
  dest: sg.Key,
  prom: boolean
): sg.Piece | boolean {
  const origPiece = state.pieces.get(orig),
    destPiece = state.pieces.get(dest);
  if (orig === dest || !origPiece) return false;
  const captured = destPiece && destPiece.color !== origPiece.color ? destPiece : undefined,
    promPiece = prom && promotePiece(state, origPiece);
  if (dest === state.selected || orig === state.selected) unselect(state);
  state.pieces.set(dest, promPiece || origPiece);
  state.pieces.delete(orig);
  state.lastDests = [orig, dest];
  state.checks = undefined;
  callUserFunction(state.events.move, orig, dest, prom, captured);
  callUserFunction(state.events.change);
  return captured || true;
}

export function baseDrop(
  state: HeadlessState,
  piece: sg.Piece,
  key: sg.Key,
  prom: boolean
): boolean {
  const pieceCount = state.hands.handMap.get(piece.color)?.get(piece.role) || 0;
  if (!pieceCount && !state.droppable.spare) return false;
  const promPiece = prom && promotePiece(state, piece);
  if (
    key === state.selected ||
    (!state.droppable.spare &&
      pieceCount === 1 &&
      state.selectedPiece &&
      samePiece(state.selectedPiece, piece))
  )
    unselect(state);
  state.pieces.set(key, promPiece || piece);
  state.lastDests = [key];
  state.checks = undefined;
  if (!state.droppable.spare) removeFromHand(state, piece);
  callUserFunction(state.events.drop, piece, key, prom);
  callUserFunction(state.events.change);
  return true;
}

function baseUserMove(
  state: HeadlessState,
  orig: sg.Key,
  dest: sg.Key,
  prom: boolean
): sg.Piece | boolean {
  const result = baseMove(state, orig, dest, prom);
  if (result) {
    state.movable.dests = undefined;
    state.droppable.dests = undefined;
    state.turnColor = opposite(state.turnColor);
    state.animation.current = undefined;
  }
  return result;
}

function baseUserDrop(state: HeadlessState, piece: sg.Piece, key: sg.Key, prom: boolean): boolean {
  const result = baseDrop(state, piece, key, prom);
  if (result) {
    state.movable.dests = undefined;
    state.droppable.dests = undefined;
    state.turnColor = opposite(state.turnColor);
    state.animation.current = undefined;
  }
  return result;
}

export function userDrop(
  state: HeadlessState,
  piece: sg.Piece,
  key: sg.Key,
  prom?: boolean
): boolean {
  const realProm = prom || state.promotion.forceDropPromotion(piece, key);
  if (canDrop(state, piece, key)) {
    const result = baseUserDrop(state, piece, key, realProm);
    if (result) {
      unselect(state);
      callUserFunction(state.droppable.events.after, piece, key, realProm, {
        premade: false,
      });
      return true;
    }
  } else if (canPredrop(state, piece, key)) {
    setPredrop(state, piece, key, realProm);
    unselect(state);
    return true;
  }
  unselect(state);
  return false;
}

export function userMove(
  state: HeadlessState,
  orig: sg.Key,
  dest: sg.Key,
  prom?: boolean
): boolean {
  const realProm = prom || state.promotion.forceMovePromotion(orig, dest);
  if (canMove(state, orig, dest)) {
    const result = baseUserMove(state, orig, dest, realProm);
    if (result) {
      unselect(state);
      const metadata: sg.MoveMetadata = {
        premade: false,
      };
      if (result !== true) metadata.captured = result;
      callUserFunction(state.movable.events.after, orig, dest, realProm, metadata);
      return true;
    }
  } else if (canPremove(state, orig, dest)) {
    setPremove(state, orig, dest, realProm);
    unselect(state);
    return true;
  }
  unselect(state);
  return false;
}

export function basePromotionDialog(state: HeadlessState, piece: sg.Piece, key: sg.Key): boolean {
  const promotedPiece = promotePiece(state, piece);
  if (state.viewOnly || state.promotion.current || !promotedPiece) return false;

  state.promotion.current = {
    piece,
    promotedPiece,
    key,
    dragged: !!state.draggable.current,
  };
  state.hovered = key;

  return true;
}

export function promotionDialogDrop(state: HeadlessState, piece: sg.Piece, key: sg.Key): boolean {
  if (
    canDropPromote(state, piece, key) &&
    (canDrop(state, piece, key) || canPredrop(state, piece, key))
  ) {
    if (basePromotionDialog(state, piece, key)) {
      callUserFunction(state.promotion.events.initiated);
      return true;
    }
  }
  return false;
}

export function promotionDialogMove(state: HeadlessState, orig: sg.Key, dest: sg.Key): boolean {
  if (
    canMovePromote(state, orig, dest) &&
    (canMove(state, orig, dest) || canPremove(state, orig, dest))
  ) {
    const piece = state.pieces.get(orig);
    if (piece && basePromotionDialog(state, piece, dest)) {
      callUserFunction(state.promotion.events.initiated);
      return true;
    }
  }
  return false;
}

function promotePiece(s: HeadlessState, piece: sg.Piece): sg.Piece | undefined {
  const promRole = s.promotion.promotesTo(piece.role);
  return promRole !== undefined ? { color: piece.color, role: promRole } : undefined;
}

export function deletePiece(state: HeadlessState, key: sg.Key): void {
  if (state.pieces.delete(key)) callUserFunction(state.events.change);
}

export function selectSquare(
  state: HeadlessState,
  key: sg.Key,
  prom?: boolean,
  force?: boolean
): void {
  callUserFunction(state.events.select, key);

  // unselect if selecting selected key, keep selected for drag
  if (!state.draggable.enabled && state.selected === key) {
    callUserFunction(state.events.unselect, key);
    unselect(state);
    return;
  }

  // try moving/dropping
  if (
    state.selectable.enabled ||
    force ||
    (state.selectable.forceSpares && state.selectedPiece && state.droppable.spare)
  ) {
    if (state.selectedPiece && userDrop(state, state.selectedPiece, key, prom)) return;
    else if (state.selected && userMove(state, state.selected, key, prom)) return;
  }

  if (
    (state.selectable.enabled || state.draggable.enabled || force) &&
    (isMovable(state, key) || isPremovable(state, key))
  ) {
    setSelected(state, key);
  }
}

export function selectPiece(
  state: HeadlessState,
  piece: sg.Piece,
  spare?: boolean,
  force?: boolean,
  api?: boolean
): void {
  callUserFunction(state.events.pieceSelect, piece);

  if (state.selectable.addSparesToHand && state.droppable.spare && state.selectedPiece) {
    addToHand(state, { role: state.selectedPiece.role, color: piece.color });
    callUserFunction(state.events.change);
    unselect(state);
  } else if (
    !api &&
    !state.draggable.enabled &&
    state.selectedPiece &&
    samePiece(state.selectedPiece, piece)
  ) {
    callUserFunction(state.events.pieceUnselect, piece);
    unselect(state);
  } else if (
    (state.selectable.enabled || state.draggable.enabled || force) &&
    (isDroppable(state, piece, !!spare) || isPredroppable(state, piece))
  ) {
    setSelectedPiece(state, piece);
    state.droppable.spare = !!spare;
  } else {
    unselect(state);
  }
}

export function setSelected(state: HeadlessState, key: sg.Key): void {
  unselect(state);
  state.selected = key;
  setPreDests(state);
}

export function setSelectedPiece(state: HeadlessState, piece: sg.Piece): void {
  unselect(state);
  state.selectedPiece = piece;
  setPreDests(state);
}

export function setPreDests(state: HeadlessState): void {
  state.premovable.dests = state.predroppable.dests = undefined;

  if (state.selected && isPremovable(state, state.selected) && state.premovable.generate)
    state.premovable.dests = state.premovable.generate(state.selected, state.pieces);
  else if (
    state.selectedPiece &&
    isPredroppable(state, state.selectedPiece) &&
    state.predroppable.generate
  )
    state.predroppable.dests = state.predroppable.generate(state.selectedPiece, state.pieces);
}

export function unselect(state: HeadlessState): void {
  state.selected =
    state.selectedPiece =
    state.premovable.dests =
    state.predroppable.dests =
    state.promotion.current =
      undefined;
}

function isMovable(state: HeadlessState, orig: sg.Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece &&
    (state.activeColor === 'both' ||
      (state.activeColor === piece.color && state.turnColor === piece.color))
  );
}

function isDroppable(state: HeadlessState, piece: sg.Piece, spare: boolean): boolean {
  return (
    (spare || !!state.hands.handMap.get(piece.color)?.get(piece.role)) &&
    (state.activeColor === 'both' ||
      (state.activeColor === piece.color && state.turnColor === piece.color))
  );
}

export function canMove(state: HeadlessState, orig: sg.Key, dest: sg.Key): boolean {
  return (
    orig !== dest &&
    isMovable(state, orig) &&
    (state.movable.free || !!state.movable.dests?.get(orig)?.includes(dest))
  );
}

export function canDrop(state: HeadlessState, piece: sg.Piece, dest: sg.Key): boolean {
  return (
    isDroppable(state, piece, state.droppable.spare) &&
    (state.droppable.free ||
      state.droppable.spare ||
      !!state.droppable.dests?.get(pieceNameOf(piece))?.includes(dest))
  );
}

function canMovePromote(state: HeadlessState, orig: sg.Key, dest: sg.Key): boolean {
  const piece = state.pieces.get(orig);
  return !!piece && state.promotion.movePromotionDialog(orig, dest);
}

function canDropPromote(state: HeadlessState, piece: sg.Piece, key: sg.Key): boolean {
  return !state.droppable.spare && state.promotion.dropPromotionDialog(piece, key);
}

function isPremovable(state: HeadlessState, orig: sg.Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece &&
    state.premovable.enabled &&
    state.activeColor === piece.color &&
    state.turnColor !== piece.color
  );
}

function isPredroppable(state: HeadlessState, piece: sg.Piece): boolean {
  return (
    !!state.hands.handMap.get(piece.color)?.get(piece.role) &&
    state.predroppable.enabled &&
    state.activeColor === piece.color &&
    state.turnColor !== piece.color
  );
}

export function canPremove(state: HeadlessState, orig: sg.Key, dest: sg.Key): boolean {
  return (
    orig !== dest &&
    isPremovable(state, orig) &&
    !!state.premovable.generate &&
    state.premovable.generate(orig, state.pieces).includes(dest)
  );
}

export function canPredrop(state: HeadlessState, piece: sg.Piece, dest: sg.Key): boolean {
  const destPiece = state.pieces.get(dest);
  return (
    isPredroppable(state, piece) &&
    (!destPiece || destPiece.color !== state.activeColor) &&
    !!state.predroppable.generate &&
    state.predroppable.generate(piece, state.pieces).includes(dest)
  );
}

export function isDraggable(state: HeadlessState, piece: sg.Piece): boolean {
  return (
    state.draggable.enabled &&
    (state.activeColor === 'both' ||
      (state.activeColor === piece.color &&
        (state.turnColor === piece.color || state.premovable.enabled)))
  );
}

export function playPremove(state: HeadlessState): boolean {
  const move = state.premovable.current;
  if (!move) return false;
  const orig = move.orig,
    dest = move.dest,
    prom = move.prom;
  let success = false;
  if (canMove(state, orig, dest)) {
    const result = baseUserMove(state, orig, dest, prom);
    if (result) {
      const metadata: sg.MoveMetadata = { premade: true };
      if (result !== true) metadata.captured = result;
      callUserFunction(state.movable.events.after, orig, dest, prom, metadata);
      success = true;
    }
  }
  unsetPremove(state);
  return success;
}

export function playPredrop(state: HeadlessState): boolean {
  const drop = state.predroppable.current;
  if (!drop) return false;
  const piece = drop.piece,
    key = drop.key,
    prom = drop.prom;
  let success = false;
  if (canDrop(state, piece, key)) {
    if (baseUserDrop(state, piece, key, prom)) {
      callUserFunction(state.droppable.events.after, piece, key, prom, {
        premade: true,
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

export function cancelPromotion(state: HeadlessState): void {
  if (!state.promotion.current) return;

  unselect(state);
  state.promotion.current = undefined;
  state.hovered = undefined;
  callUserFunction(state.promotion.events.cancel);
}

export function stop(state: HeadlessState): void {
  state.activeColor =
    state.movable.dests =
    state.droppable.dests =
    state.draggable.current =
    state.animation.current =
    state.promotion.current =
    state.hovered =
      undefined;
  cancelMoveOrDrop(state);
}
