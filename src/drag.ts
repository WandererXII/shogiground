import { State } from './state';
import * as board from './board';
import * as util from './util';
import { clear as drawClear } from './draw';
import * as sg from './types';
import { anim } from './anim';
import { predrop } from './premove';

export interface DragCurrent {
  orig: sg.Key; // orig key of dragging piece
  piece: sg.Piece;
  origPos: sg.NumberPair; // first event position
  pos: sg.NumberPair; // latest event position
  started: boolean; // whether the drag has started; as per the distance setting
  element: sg.PieceNode | (() => sg.PieceNode | undefined);
  newPiece?: boolean; // is it a new piece from outside the board
  force?: boolean; // can the new piece replace an existing one (editor)
  previouslySelected?: sg.Key;
  originTarget: EventTarget | null;
}

export function start(s: State, e: sg.MouchEvent): void {
  if (e.button !== undefined && e.button !== 0) return; // only touch or left click
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  const bounds = s.dom.bounds(),
    position = util.eventPosition(e)!,
    dims = util.dimensions(s.variant),
    orig = board.getKeyAtDomPos(position, board.sentePov(s), dims, bounds);
  if (!orig) return;
  const piece = s.pieces.get(orig);
  const previouslySelected = s.selected;
  if (!previouslySelected && s.drawable.enabled && (s.drawable.eraseOnClick || !piece || piece.color !== s.turnColor))
    drawClear(s);
  // Prevent touch scroll and create no corresponding mouse event, if there
  // is an intent to interact with the board.
  if (
    e.cancelable !== false &&
    (!e.touches || s.blockTouchScroll || piece || previouslySelected || pieceCloseTo(s, position))
  )
    e.preventDefault();
  const hadPremove = !!s.premovable.current;
  const hadPredrop = !!s.predroppable.current || !!s.predroppable.dropDests;
  s.stats.ctrlKey = e.ctrlKey;
  if (s.selected && board.canMove(s, s.selected, orig)) {
    anim(state => board.selectSquare(state, orig), s);
  } else {
    board.selectSquare(s, orig);
  }
  const stillSelected = s.selected === orig;
  const element = pieceElementByKey(s, orig);
  if (piece && element && stillSelected && board.isDraggable(s, orig)) {
    s.draggable.current = {
      orig,
      piece,
      origPos: position,
      pos: position,
      started: s.draggable.autoDistance && s.stats.dragged,
      element,
      previouslySelected,
      originTarget: e.target,
    };
    element.sgDragging = true;
    element.classList.add('dragging');
    element.classList.remove('fix-blur');
    // place ghost
    const ghost = s.dom.elements.ghost;
    if (ghost) {
      ghost.className = `ghost ${piece.color} ${piece.role}`;
      util.translateAbs(ghost, util.posToTranslateAbs(dims, bounds)(util.key2pos(orig), board.sentePov(s)));
      util.setVisible(ghost, true);
    }
    processDrag(s);
  } else {
    if (hadPremove) board.unsetPremove(s);
    if (hadPredrop) board.unsetPredrop(s);
  }
  s.dom.redraw();
}

function pieceCloseTo(s: State, pos: sg.NumberPair): boolean {
  const asSente = board.sentePov(s),
    bounds = s.dom.bounds(),
    dims = util.dimensions(s.variant),
    radiusSq = Math.pow(bounds.width / dims.files, 2);
  for (const key of s.pieces.keys()) {
    const center = util.computeSquareCenter(key, asSente, dims, bounds);
    if (util.distanceSq(center, pos) <= radiusSq) return true;
  }
  return false;
}

export function dragNewPiece(s: State, piece: sg.Piece, e: sg.MouchEvent, force?: boolean): void {
  const key: sg.Key = '00';
  s.pieces.set(key, piece);
  board.unselect(s);
  s.dom.redraw();

  const position = util.eventPosition(e)!;

  s.draggable.current = {
    orig: key,
    piece,
    origPos: position,
    pos: position,
    started: true,
    element: () => pieceElementByKey(s, key),
    originTarget: e.target,
    newPiece: true,
    force: !!force,
  };
  if (board.isPredroppable(s)) {
    s.predroppable.dropDests = predrop(s.pieces, piece, util.dimensions(s.variant));
  }
  processDrag(s);
}

function processDrag(s: State): void {
  requestAnimationFrame(() => {
    const cur = s.draggable.current;
    if (!cur) return;
    // cancel animations while dragging
    if (s.animation.current?.plan.anims.has(cur.orig)) s.animation.current = undefined;
    // if moving piece is gone, cancel
    const origPiece = s.pieces.get(cur.orig);
    if (!origPiece || !util.samePiece(origPiece, cur.piece)) cancel(s);
    else {
      if (!cur.started && util.distanceSq(cur.pos, cur.origPos) >= Math.pow(s.draggable.distance, 2))
        cur.started = true;
      if (cur.started) {
        // support lazy elements
        if (typeof cur.element === 'function') {
          const found = cur.element();
          if (!found) return;
          found.sgDragging = true;
          found.classList.add('dragging');
          found.classList.remove('fix-blur');
          cur.element = found;
        }

        const bounds = s.dom.bounds(),
          dims = util.dimensions(s.variant);
        util.translateAbs(cur.element, [
          cur.pos[0] - bounds.left - bounds.width / (dims.files * 2),
          cur.pos[1] - bounds.top - bounds.height / (dims.ranks * 2),
        ]);
      }
    }
    processDrag(s);
  });
}

export function move(s: State, e: sg.MouchEvent): void {
  // support one finger touch only
  if (s.draggable.current && (!e.touches || e.touches.length < 2)) {
    s.draggable.current.pos = util.eventPosition(e)!;
  }
}

export function end(s: State, e: sg.MouchEvent): void {
  const cur = s.draggable.current;
  if (!cur) return;
  // create no corresponding mouse event
  if (e.type === 'touchend' && e.cancelable !== false) e.preventDefault();
  // comparing with the origin target is an easy way to test that the end event
  // has the same touch origin
  if (e.type === 'touchend' && cur.originTarget !== e.target && !cur.newPiece) {
    s.draggable.current = undefined;
    return;
  }
  board.unsetPremove(s);
  board.unsetPredrop(s);
  // touchend has no position; so use the last touchmove position instead
  const eventPos = util.eventPosition(e) || cur.pos;
  const dest = board.getKeyAtDomPos(eventPos, board.sentePov(s), util.dimensions(s.variant), s.dom.bounds());
  if (dest && cur.started && cur.orig !== dest) {
    if (cur.newPiece) board.dropNewPiece(s, dest, cur.force);
    else {
      s.stats.ctrlKey = e.ctrlKey;
      if (board.userMove(s, cur.orig, dest)) s.stats.dragged = true;
    }
  } else if (cur.newPiece) {
    s.pieces.delete(cur.orig);
  } else if (s.draggable.deleteOnDropOff && !dest) {
    s.draggable.lastDropOff = cur;
    s.pieces.delete(cur.orig);
    board.callUserFunction(s.events.change);
  }
  if (cur.orig === cur.previouslySelected && (cur.orig === dest || !dest)) board.unselect(s);
  else if (!s.selectable.enabled) board.unselect(s);

  removeDragElements(s);

  s.draggable.current = undefined;
  s.dom.redraw();
}

export function cancel(s: State): void {
  const cur = s.draggable.current;
  if (cur) {
    if (cur.newPiece) s.pieces.delete(cur.orig);
    s.draggable.current = undefined;
    board.unselect(s);
    removeDragElements(s);
    s.dom.redraw();
  }
}

function removeDragElements(s: State): void {
  const e = s.dom.elements;
  if (e.ghost) util.setVisible(e.ghost, false);
}

function pieceElementByKey(s: State, key: sg.Key): sg.PieceNode | undefined {
  let el = s.dom.elements.board.firstChild;
  while (el) {
    if ((el as sg.KeyedNode).sgKey === key && (el as sg.KeyedNode).tagName === 'PIECE') return el as sg.PieceNode;
    el = el.nextSibling;
  }
  return;
}
