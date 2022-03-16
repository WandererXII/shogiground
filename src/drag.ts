import { State } from './state.js';
import * as board from './board.js';
import * as util from './util.js';
import { clear as drawClear } from './draw.js';
import * as sg from './types.js';
import { anim } from './anim.js';

export interface DragCurrent {
  piece: sg.Piece; // piece being dragged
  pos: sg.NumberPair; // latest event position
  origPos: sg.NumberPair; // first event position
  started: boolean; // whether the drag has started; as per the distance setting
  touch: boolean; // was the dragging initiated from touch event
  hovering?: sg.Key; // currently hovered square
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
  const bounds = s.dom.boardBounds(),
    position = util.eventPosition(e),
    orig = position && board.getKeyAtDomPos(position, board.sentePov(s), s.dimensions, bounds);

  if (!orig) return;

  const piece = s.pieces.get(orig),
    previouslySelected = s.selected;
  if (!previouslySelected && s.drawable.enabled && (s.drawable.eraseOnClick || !piece || piece.color !== s.turnColor))
    drawClear(s);

  // Prevent touch scroll and create no corresponding mouse event, if there
  // is an intent to interact with the board.
  if (
    e.cancelable !== false &&
    (!e.touches || s.blockTouchScroll || s.selectedPiece || piece || previouslySelected || pieceCloseTo(s, position))
  )
    e.preventDefault();
  const hadPremove = !!s.premovable.current;
  const hadPredrop = !!s.predroppable.current;
  if (
    (s.selectedPiece && board.canDrop(s, s.selectedPiece, orig)) ||
    (s.selected && board.canMove(s, s.selected, orig))
  ) {
    anim(state => board.selectSquare(state, orig), s);
  } else {
    board.selectSquare(s, orig);
  }

  const stillSelected = s.selected === orig,
    draggedEl = s.dom.elements.dragged;

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

function pieceCloseTo(s: State, pos: sg.NumberPair): boolean {
  const asSente = board.sentePov(s),
    bounds = s.dom.boardBounds(),
    radiusSq = Math.pow(bounds.width / s.dimensions.files, 2);
  for (const key of s.pieces.keys()) {
    const center = util.computeSquareCenter(key, asSente, s.dimensions, bounds);
    if (util.distanceSq(center, pos) <= radiusSq) return true;
  }
  return false;
}

export function dragNewPiece(s: State, piece: sg.Piece, e: sg.MouchEvent): void {
  const previouslySelectedPiece = s.selectedPiece,
    draggedEl = s.dom.elements.dragged,
    position = util.eventPosition(e)!,
    touch = e.type === 'touchstart';

  if (!draggedEl) return;

  board.selectPiece(s, piece);
  s.dom.redraw();

  const hadPremove = !!s.premovable.current;
  const hadPredrop = !!s.predroppable.current;

  if (board.isDraggable(s, piece)) {
    s.draggable.current = {
      piece,
      pos: position,
      origPos: position,
      touch,
      started: s.draggable.autoDistance && !touch,
      originTarget: e.target,
      fromOutside: {
        originBounds: s.dom.handPiecesBounds().get(util.pieceNameOf(piece)),
        leftOrigin: false,
        previouslySelectedPiece,
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
}

function processDrag(s: State): void {
  requestAnimationFrame(() => {
    const cur = s.draggable.current,
      draggedEl = s.dom.elements.dragged;
    if (!cur || !draggedEl) return;
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
        const bounds = s.dom.boardBounds();

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

        if (cur.fromBoard) cur.fromBoard.keyHasChanged = cur.fromBoard.keyHasChanged || cur.fromBoard.orig !== hover;
        else if (cur.fromOutside)
          cur.fromOutside.leftOrigin =
            cur.fromOutside.leftOrigin ||
            (!!cur.fromOutside.originBounds && !isInsideSquare(cur.fromOutside.originBounds, cur.pos));

        // if the hovered square changed
        if (hover !== cur.hovering) {
          const prevHover = cur.hovering;
          cur.hovering = hover;
          updateHovers(s, prevHover);
          if (cur.touch && s.dom.elements.squareOver) {
            if (hover && s.draggable.showTouchSquareOverlay) {
              util.translateAbs(
                s.dom.elements.squareOver,
                util.posToTranslateAbs(s.dimensions, bounds)(util.key2pos(hover), board.sentePov(s)),
                1
              );
              util.setDisplay(s.dom.elements.squareOver, true);
            } else {
              util.setDisplay(s.dom.elements.squareOver, false);
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
    return;
  }
  board.unsetPremove(s);
  board.unsetPredrop(s);
  // touchend has no position; so use the last touchmove position instead
  const eventPos = util.eventPosition(e) || cur.pos;
  const dest = board.getKeyAtDomPos(eventPos, board.sentePov(s), s.dimensions, s.dom.boardBounds());
  if (dest && cur.started && cur.fromBoard?.orig !== dest) {
    if (cur.fromOutside) board.userDrop(s, cur.piece, dest);
    else if (cur.fromBoard) board.userMove(s, cur.fromBoard.orig, dest);
  } else if (s.draggable.deleteOnDropOff && !dest) {
    if (cur.fromBoard) s.pieces.delete(cur.fromBoard.orig);
    else if (cur.fromOutside) board.removeFromHand(s, cur.piece);

    if (s.draggable.addToHandOnDropOff) {
      const handBounds = s.dom.handsBounds(),
        handBoundsTop = handBounds.get('top'),
        handBoundsBottom = handBounds.get('bottom');
      if (handBoundsTop && isInsideSquare(handBoundsTop, cur.pos))
        board.addToHand(s, { color: util.opposite(s.orientation), role: cur.piece.role });
      else if (handBoundsBottom && isInsideSquare(handBoundsBottom, cur.pos))
        board.addToHand(s, { color: s.orientation, role: cur.piece.role });
    }
    board.callUserFunction(s.events.change);
  }

  if (
    cur.fromBoard &&
    (cur.fromBoard.orig === cur.fromBoard.previouslySelected || cur.fromBoard.keyHasChanged) &&
    (cur.fromBoard.orig === dest || !dest)
  )
    board.unselect(s);
  else if (
    cur.fromOutside?.leftOrigin ||
    (cur.fromOutside?.originBounds &&
      isInsideSquare(cur.fromOutside.originBounds, cur.pos) &&
      cur.fromOutside.previouslySelectedPiece &&
      util.samePiece(cur.fromOutside.previouslySelectedPiece as sg.Piece, cur.piece))
  )
    board.unselect(s);
  else if (!s.selectable.enabled) board.unselect(s);

  s.draggable.current = undefined;
  s.dom.redraw();
}

export function cancel(s: State): void {
  if (s.draggable.current) {
    s.draggable.current = undefined;
    board.unselect(s);
    s.dom.redraw();
  }
}

// support one finger touch only or left click
export function unwantedEvent(e: sg.MouchEvent): boolean {
  return !e.isTrusted || (e.button !== undefined && e.button !== 0) || (!!e.touches && e.touches.length > 1);
}

function isInsideSquare(rect: DOMRect, pos: sg.Pos): boolean {
  return (
    rect.left <= pos[0] && rect.top <= pos[1] && rect.left + rect.width > pos[0] && rect.top + rect.height > pos[1]
  );
}

function updateHovers(s: State, prevHover?: sg.Key): void {
  const asSente = board.sentePov(s),
    sqaureEls = s.dom.elements.squares.children;

  const curIndex =
      s.draggable.current?.hovering && util.domSquareIndexOfKey(s.draggable.current.hovering, asSente, s.dimensions),
    curHoverEl = curIndex && sqaureEls[curIndex];
  if (curHoverEl) curHoverEl.classList.add('hover');

  const prevIndex = prevHover && util.domSquareIndexOfKey(prevHover, asSente, s.dimensions),
    prevHoverEl = prevIndex && sqaureEls[prevIndex];
  if (prevHoverEl) prevHoverEl.classList.remove('hover');
}
