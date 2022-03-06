import { State } from './state.js';
import * as board from './board.js';
import * as util from './util.js';
import { clear as drawClear } from './draw.js';
import * as sg from './types.js';
import { anim } from './anim.js';
import { predrop } from './predrop.js';

export interface DragCurrent {
  piece: sg.Piece;
  orig?: sg.Key; // orig key of dragging piece, undefined if outside the board
  origPos: sg.NumberPair; // first event position
  touch: boolean; // is the initial event from 'touchstart'
  pos: sg.NumberPair; // latest event position
  hovering?: sg.Key; // currently hovered square
  started: boolean; // whether the drag has started; as per the distance setting
  newPiece?: boolean; // is it a new piece from outside the board
  fromHand?: boolean; // is it a piece from shogiground hand
  force?: boolean; // can the new piece replace an existing one (editor)
  previouslySelected?: sg.Key;
  originTarget: EventTarget | null;
  keyHasChanged: boolean; // whether the drag has left the orig key
}

export function start(s: State, e: sg.MouchEvent): void {
  if (!e.isTrusted || (e.button !== undefined && e.button !== 0)) return; // only touch or left click
  if (e.touches && e.touches.length > 1) return; // support one finger touch only

  const bounds = s.dom.bounds(),
    position = util.eventPosition(e),
    orig = position && board.getKeyAtDomPos(position, board.sentePov(s), s.dimensions, bounds);

  if (!orig || !position) return;

  const piece = s.pieces.get(orig),
    previouslySelected = s.selected;
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
  const hadPredrop = !!s.predroppable.current || !!s.predroppable.dests;
  if (s.selected && board.canMove(s, s.selected, orig)) {
    anim(state => board.selectSquare(state, orig), s);
  } else {
    board.selectSquare(s, orig);
  }
  const stillSelected = s.selected === orig;

  if (piece && stillSelected && board.isDraggable(s, orig)) {
    const touch = e.type === 'touchstart',
      pieceName = util.pieceNameOf(piece),
      draggedEl = s.dom.elements.dragged;

    s.draggable.current = {
      piece,
      orig,
      touch,
      origPos: position,
      pos: position,
      started: s.draggable.autoDistance && !touch,
      previouslySelected,
      originTarget: e.target,
      keyHasChanged: false,
    };

    draggedEl.sgPiece = pieceName;
    draggedEl.className = `dragging ${pieceName}`;
    draggedEl.classList.toggle('touch', touch);

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
    radiusSq = Math.pow(bounds.width / s.dimensions.files, 2);
  for (const key of s.pieces.keys()) {
    const center = util.computeSquareCenter(key, asSente, s.dimensions, bounds);
    if (util.distanceSq(center, pos) <= radiusSq) return true;
  }
  return false;
}

export function dragNewPiece(s: State, piece: sg.Piece, e: sg.MouchEvent, hand: boolean, force: boolean): void {
  board.unselect(s);

  const position = util.eventPosition(e)!,
    pieceName = util.pieceNameOf(piece),
    touch = e.type === 'touchstart',
    draggedEl = s.dom.elements.dragged;

  s.draggable.current = {
    piece,
    touch,
    origPos: position,
    pos: position,
    started: true,
    originTarget: e.target,
    newPiece: true,
    fromHand: hand,
    force: force,
    keyHasChanged: s.dropmode.active && s.dropmode.piece?.role === piece.role && s.dropmode.piece.color === piece.color,
  };

  draggedEl.sgPiece = pieceName;
  draggedEl.className = `dragging ${pieceName}`;
  draggedEl.classList.toggle('touch', touch);

  if (board.isPredroppable(s, piece)) s.predroppable.dests = predrop(s.pieces, piece, s.dimensions);
  if (hand) {
    s.dropmode.active = true;
    s.dropmode.piece = piece;
  }

  s.dom.redraw();
  processDrag(s);
}

function processDrag(s: State): void {
  requestAnimationFrame(() => {
    const cur = s.draggable.current;
    if (!cur) return;
    // cancel animations while dragging
    if (cur.orig && s.animation.current?.plan.anims.has(cur.orig)) s.animation.current = undefined;
    // if moving piece is gone, cancel
    const origPiece = cur.orig ? s.pieces.get(cur.orig) : cur.piece;
    if (!origPiece || !util.samePiece(origPiece, cur.piece)) cancel(s);
    else {
      if (!cur.started && util.distanceSq(cur.pos, cur.origPos) >= Math.pow(s.draggable.distance, 2)) {
        cur.started = true;
        s.dom.redraw();
      }
      if (cur.started) {
        const draggedEl = s.dom.elements.dragged,
          bounds = s.dom.bounds();

        util.translateAbs(
          draggedEl,
          [
            cur.pos[0] - bounds.left - bounds.width / (s.dimensions.files * 2),
            cur.pos[1] - bounds.top - bounds.height / (s.dimensions.ranks * 2),
          ],
          s.scaleDownPieces ? 0.5 : 1
        );

        if (!draggedEl.sgDragging) {
          draggedEl.sgDragging = true;
          util.setDisplay(draggedEl, true);
        }
        const hover = board.getKeyAtDomPos(cur.pos, board.sentePov(s), s.dimensions, bounds);

        cur.keyHasChanged = cur.keyHasChanged || (!cur.newPiece && cur.orig !== hover);

        // if the hovered square changed
        if (hover !== cur.hovering) {
          const prevHover = cur.hovering;
          cur.hovering = hover;
          updateHovers(s, prevHover);
          if (hover && cur.touch && s.draggable.showTouchSquareOverlay) {
            util.translateAbs(
              s.dom.elements.squareOver,
              util.posToTranslateAbs(s.dimensions, bounds)(util.key2pos(hover), board.sentePov(s)),
              1
            );
            util.setDisplay(s.dom.elements.squareOver, true);
          } else if (cur.touch) {
            util.setDisplay(s.dom.elements.squareOver, false);
          }
        }
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
  const dest = board.getKeyAtDomPos(eventPos, board.sentePov(s), s.dimensions, s.dom.bounds());
  if (dest && cur.started && cur.orig !== dest) {
    if (cur.newPiece) {
      board.userDrop(s, cur.piece, dest, cur.force, cur.fromHand);
    } else if (cur.orig) {
      board.userMove(s, cur.orig, dest);
    }
  } else if (cur.newPiece) {
    if (cur.fromHand && util.distanceSq(cur.pos, cur.origPos) >= Math.pow(s.draggable.distance, 4)) {
      board.cancelDropMode(s);
    }
  } else if (cur.orig && s.draggable.deleteOnDropOff && !dest) {
    s.draggable.lastDropOff = cur;
    s.pieces.delete(cur.orig);
    board.callUserFunction(s.events.change);
  }
  if ((cur.orig === cur.previouslySelected || cur.keyHasChanged) && (cur.orig === dest || !dest)) board.unselect(s);
  else if (!s.selectable.enabled) board.unselect(s);

  s.draggable.current = undefined;
  s.dom.redraw();
}

export function cancel(s: State): void {
  const cur = s.draggable.current;
  if (cur) {
    s.draggable.current = undefined;
    board.unselect(s);
    s.dom.redraw();
  }
}

export function updateHovers(s: State, prevHover?: sg.Key): void {
  let el = s.dom.elements.squares.firstElementChild as HTMLElement | undefined;
  while (el && sg.isSquareNode(el)) {
    const key = el.sgKey;

    if (s.draggable.current?.hovering === key) el.classList.add('hover');
    else if (prevHover === key) el.classList.remove('hover');

    el = el.nextElementSibling as HTMLElement | undefined;
  }
}
