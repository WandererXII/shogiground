import type { State } from './state.js';
import * as sg from './types.js';
import * as board from './board.js';
import { addToHand, removeFromHand } from './hands.js';
import * as util from './util.js';
import { clear as drawClear } from './draw.js';
import { anim } from './anim.js';

export interface DragCurrent {
  piece: sg.Piece; // piece being dragged
  pos: sg.NumberPair; // latest event position
  origPos: sg.NumberPair; // first event position
  started: boolean; // whether the drag has started; as per the distance setting
  touch: boolean; // was the dragging initiated from touch event
  originTarget: EventTarget | null;
  fromBoard?: {
    orig: sg.Key; // orig key of dragging piece
    previouslySelected?: sg.Key; // selected piece before drag began
    keyHasChanged: boolean; // whether the drag has left the orig key or piece
  };
  fromOutside?: {
    originBounds: DOMRect | undefined; // bounds of the piece that initiated the drag
    leftOrigin: boolean; // have we ever left originBounds
    previouslySelectedPiece?: sg.Piece;
  };
}

export function start(s: State, e: sg.MouchEvent): void {
  const bounds = s.dom.bounds.board.bounds(),
    position = util.eventPosition(e),
    orig = bounds && position && util.getKeyAtDomPos(position, util.sentePov(s.orientation), s.dimensions, bounds);

  if (!orig) return;

  const piece = s.pieces.get(orig),
    previouslySelected = s.selected;
  if (!previouslySelected && s.drawable.enabled && (s.drawable.eraseOnClick || !piece || piece.color !== s.turnColor))
    drawClear(s);

  // Prevent touch scroll and create no corresponding mouse event, if there
  // is an intent to interact with the board.
  if (
    e.cancelable !== false &&
    (!e.touches ||
      s.blockTouchScroll ||
      s.selectedPiece ||
      piece ||
      previouslySelected ||
      pieceCloseTo(s, position, bounds))
  )
    e.preventDefault();
  const hadPremove = !!s.premovable.current;
  const hadPredrop = !!s.predroppable.current;
  if (s.selectable.deleteOnTouch) board.deletePiece(s, orig);
  else if (s.selected) {
    if (!board.promotionDialogMove(s, s.selected, orig)) {
      if (board.canMove(s, s.selected, orig)) anim(state => board.selectSquare(state, orig), s);
      else board.selectSquare(s, orig);
    }
  } else if (s.selectedPiece) {
    if (!board.promotionDialogDrop(s, s.selectedPiece, orig)) {
      if (board.canDrop(s, s.selectedPiece, orig)) anim(state => board.selectSquare(state, orig), s);
      else board.selectSquare(s, orig);
    }
  } else {
    board.selectSquare(s, orig);
  }

  const stillSelected = s.selected === orig,
    draggedEl = s.dom.elements.board?.dragged;

  if (piece && draggedEl && stillSelected && board.isDraggable(s, piece)) {
    const touch = e.type === 'touchstart';

    s.draggable.current = {
      piece,
      pos: position,
      origPos: position,
      started: s.draggable.autoDistance && !touch,
      touch,
      originTarget: e.target,
      fromBoard: {
        orig,
        previouslySelected,
        keyHasChanged: false,
      },
    };

    draggedEl.sgColor = piece.color;
    draggedEl.sgRole = piece.role;
    draggedEl.className = `dragging ${util.pieceNameOf(piece)}`;
    draggedEl.classList.toggle('touch', touch);

    processDrag(s);
  } else {
    if (hadPremove) board.unsetPremove(s);
    if (hadPredrop) board.unsetPredrop(s);
  }
  s.dom.redraw();
}

function pieceCloseTo(s: State, pos: sg.NumberPair, bounds: DOMRect): boolean {
  const asSente = util.sentePov(s.orientation),
    radiusSq = Math.pow(bounds.width / s.dimensions.files, 2);
  for (const key of s.pieces.keys()) {
    const center = util.computeSquareCenter(key, asSente, s.dimensions, bounds);
    if (util.distanceSq(center, pos) <= radiusSq) return true;
  }
  return false;
}

export function dragNewPiece(s: State, piece: sg.Piece, e: sg.MouchEvent, spare?: boolean): void {
  const previouslySelectedPiece = s.selectedPiece,
    draggedEl = s.dom.elements.board?.dragged,
    position = util.eventPosition(e),
    touch = e.type === 'touchstart';

  if (!previouslySelectedPiece && !spare && s.drawable.enabled && s.drawable.eraseOnClick) drawClear(s);

  if (!spare && s.selectable.deleteOnTouch) removeFromHand(s, piece);
  else board.selectPiece(s, piece, spare);

  const hadPremove = !!s.premovable.current,
    hadPredrop = !!s.predroppable.current,
    stillSelected = s.selectedPiece && util.samePiece(s.selectedPiece, piece);

  if (draggedEl && position && s.selectedPiece && stillSelected && board.isDraggable(s, piece)) {
    s.draggable.current = {
      piece: s.selectedPiece,
      pos: position,
      origPos: position,
      touch,
      started: s.draggable.autoDistance && !touch,
      originTarget: e.target,
      fromOutside: {
        originBounds: !spare ? s.dom.bounds.hands.pieceBounds().get(util.pieceNameOf(piece)) : undefined,
        leftOrigin: false,
        previouslySelectedPiece: !spare ? previouslySelectedPiece : undefined,
      },
    };

    draggedEl.sgColor = piece.color;
    draggedEl.sgRole = piece.role;
    draggedEl.className = `dragging ${util.pieceNameOf(piece)}`;
    draggedEl.classList.toggle('touch', touch);

    processDrag(s);
  } else {
    if (hadPremove) board.unsetPremove(s);
    if (hadPredrop) board.unsetPredrop(s);
  }
  s.dom.redraw();
}

function processDrag(s: State): void {
  requestAnimationFrame(() => {
    const cur = s.draggable.current,
      draggedEl = s.dom.elements.board?.dragged,
      bounds = s.dom.bounds.board.bounds();
    if (!cur || !draggedEl || !bounds) return;
    // cancel animations while dragging
    if (cur.fromBoard?.orig && s.animation.current?.plan.anims.has(cur.fromBoard.orig)) s.animation.current = undefined;
    // if moving piece is gone, cancel
    const origPiece = cur.fromBoard ? s.pieces.get(cur.fromBoard.orig) : cur.piece;
    if (!origPiece || !util.samePiece(origPiece, cur.piece)) cancel(s);
    else {
      if (!cur.started && util.distanceSq(cur.pos, cur.origPos) >= Math.pow(s.draggable.distance, 2)) {
        cur.started = true;
        s.dom.redraw();
      }
      if (cur.started) {
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
        const hover = util.getKeyAtDomPos(cur.pos, util.sentePov(s.orientation), s.dimensions, bounds);

        if (cur.fromBoard) cur.fromBoard.keyHasChanged = cur.fromBoard.keyHasChanged || cur.fromBoard.orig !== hover;
        else if (cur.fromOutside)
          cur.fromOutside.leftOrigin =
            cur.fromOutside.leftOrigin ||
            (!!cur.fromOutside.originBounds && !util.isInsideRect(cur.fromOutside.originBounds, cur.pos));

        // if the hovered square changed
        if (hover !== s.hovered) {
          updateHoveredSquares(s, hover);
          if (cur.touch && s.dom.elements.board?.squareOver) {
            if (hover && s.draggable.showTouchSquareOverlay) {
              util.translateAbs(
                s.dom.elements.board.squareOver,
                util.posToTranslateAbs(s.dimensions, bounds)(util.key2pos(hover), util.sentePov(s.orientation)),
                1
              );
              util.setDisplay(s.dom.elements.board.squareOver, true);
            } else {
              util.setDisplay(s.dom.elements.board.squareOver, false);
            }
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
  } else if (
    (s.selected || s.selectedPiece || s.highlight.hovered) &&
    !s.draggable.current &&
    (!e.touches || e.touches.length < 2)
  ) {
    const bounds = s.dom.bounds.board.bounds(),
      hover = bounds && util.getKeyAtDomPos(util.eventPosition(e)!, util.sentePov(s.orientation), s.dimensions, bounds);
    if (hover !== s.hovered) updateHoveredSquares(s, hover);
  }
}

export function end(s: State, e: sg.MouchEvent): void {
  const cur = s.draggable.current;
  if (!cur) return;
  // create no corresponding mouse event
  if (e.type === 'touchend' && e.cancelable !== false) e.preventDefault();
  // comparing with the origin target is an easy way to test that the end event
  // has the same touch origin
  if (e.type === 'touchend' && cur.originTarget !== e.target && !cur.fromOutside) {
    s.draggable.current = undefined;
    if (s.hovered && !s.highlight.hovered) updateHoveredSquares(s, undefined);
    return;
  }
  board.unsetPremove(s);
  board.unsetPredrop(s);
  // touchend has no position; so use the last touchmove position instead
  const eventPos = util.eventPosition(e) || cur.pos,
    bounds = s.dom.bounds.board.bounds(),
    dest = bounds && util.getKeyAtDomPos(eventPos, util.sentePov(s.orientation), s.dimensions, bounds);

  if (dest && cur.started && cur.fromBoard?.orig !== dest) {
    if (cur.fromOutside && !board.promotionDialogDrop(s, cur.piece, dest)) board.userDrop(s, cur.piece, dest);
    else if (cur.fromBoard && !board.promotionDialogMove(s, cur.fromBoard.orig, dest))
      board.userMove(s, cur.fromBoard.orig, dest);
  } else if (s.draggable.deleteOnDropOff && !dest) {
    if (cur.fromBoard) s.pieces.delete(cur.fromBoard.orig);
    else if (cur.fromOutside && !s.droppable.spare) removeFromHand(s, cur.piece);

    if (s.draggable.addToHandOnDropOff) {
      const handBounds = s.dom.bounds.hands.bounds(),
        handBoundsTop = handBounds.get('top'),
        handBoundsBottom = handBounds.get('bottom');
      if (handBoundsTop && util.isInsideRect(handBoundsTop, cur.pos))
        addToHand(s, { color: util.opposite(s.orientation), role: cur.piece.role });
      else if (handBoundsBottom && util.isInsideRect(handBoundsBottom, cur.pos))
        addToHand(s, { color: s.orientation, role: cur.piece.role });
    }
    util.callUserFunction(s.events.change);
  }

  if (
    cur.fromBoard &&
    (cur.fromBoard.orig === cur.fromBoard.previouslySelected || cur.fromBoard.keyHasChanged) &&
    (cur.fromBoard.orig === dest || !dest)
  ) {
    unselect(s, cur, dest);
  } else if (
    (!dest && cur.fromOutside?.leftOrigin) ||
    (cur.fromOutside?.originBounds &&
      util.isInsideRect(cur.fromOutside.originBounds, cur.pos) &&
      cur.fromOutside.previouslySelectedPiece &&
      util.samePiece(cur.fromOutside.previouslySelectedPiece, cur.piece))
  ) {
    unselect(s, cur, dest);
  } else if (!s.selectable.enabled && !s.promotion.current) {
    unselect(s, cur, dest);
  }

  s.draggable.current = undefined;
  if (!s.highlight.hovered && !s.promotion.current) s.hovered = undefined;
  s.dom.redraw();
}

function unselect(s: State, cur: DragCurrent, dest?: sg.Key): void {
  if (cur.fromBoard && cur.fromBoard.orig === dest) util.callUserFunction(s.events.unselect, cur.fromBoard.orig);
  else if (cur.fromOutside?.originBounds && util.isInsideRect(cur.fromOutside.originBounds, cur.pos))
    util.callUserFunction(s.events.pieceUnselect, cur.piece);
  board.unselect(s);
}

export function cancel(s: State): void {
  if (s.draggable.current) {
    s.draggable.current = undefined;
    if (!s.highlight.hovered) s.hovered = undefined;
    board.unselect(s);
    s.dom.redraw();
  }
}

// support one finger touch only or left click
export function unwantedEvent(e: sg.MouchEvent): boolean {
  return !e.isTrusted || (e.button !== undefined && e.button !== 0) || (!!e.touches && e.touches.length > 1);
}

function validDestToHover(s: State, key: sg.Key): boolean {
  return (
    (!!s.selected && (board.canMove(s, s.selected, key) || board.canPremove(s, s.selected, key))) ||
    (!!s.selectedPiece && (board.canDrop(s, s.selectedPiece, key) || board.canPredrop(s, s.selectedPiece, key)))
  );
}

function updateHoveredSquares(s: State, key: sg.Key | undefined): void {
  const sqaureEls = s.dom.elements.board?.squares.children;
  if (!sqaureEls || s.promotion.current) return;

  const prevHover = s.hovered;
  if (s.highlight.hovered || (key && validDestToHover(s, key))) s.hovered = key;
  else s.hovered = undefined;

  const asSente = util.sentePov(s.orientation),
    curIndex = s.hovered && util.domSquareIndexOfKey(s.hovered, asSente, s.dimensions),
    curHoverEl = curIndex !== undefined && sqaureEls[curIndex];
  if (curHoverEl) curHoverEl.classList.add('hover');

  const prevIndex = prevHover && util.domSquareIndexOfKey(prevHover, asSente, s.dimensions),
    prevHoverEl = prevIndex !== undefined && sqaureEls[prevIndex];
  if (prevHoverEl) prevHoverEl.classList.remove('hover');
}
