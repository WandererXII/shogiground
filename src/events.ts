import { State } from './state';
import * as drag from './drag';
import * as draw from './draw';
import { cancelDropMode, drop, setDropMode } from './drop';
import { eventPosition, isRightButton } from './util';
import * as sg from './types';
import { getKeyAtDomPos, sentePov } from './board';

type MouchBind = (e: sg.MouchEvent) => void;
type StateMouchBind = (d: State, e: sg.MouchEvent) => void;

export function bindBoard(s: State, boundsUpdated: () => void): void {
  const boardEl = s.dom.elements.board;

  if (!s.dom.relative && s.resizable && 'ResizeObserver' in window) new ResizeObserver(boundsUpdated).observe(boardEl);

  if (s.viewOnly) return;

  // Cannot be passive, because we prevent touch scrolling and dragging of
  // selected elements.
  const onStart = startDragOrDraw(s);
  boardEl.addEventListener('touchstart', onStart as EventListener, {
    passive: false,
  });
  boardEl.addEventListener('mousedown', onStart as EventListener, {
    passive: false,
  });

  if (s.disableContextMenu || s.drawable.enabled) {
    boardEl.addEventListener('contextmenu', e => e.preventDefault());
  }
}

export function bindHands(s: State): void {
  if (!s.hands.enabled || s.viewOnly || !s.dom.elements.handTop || !s.dom.elements.handBot) return;
  bindHand(s, s.dom.elements.handBot);
  bindHand(s, s.dom.elements.handTop);
}

function bindHand(s: State, handEl: HTMLElement): void {
  handEl.addEventListener('mousedown', startDragFromHand(s) as EventListener, { passive: false });
  handEl.addEventListener('touchstart', startDragFromHand(s) as EventListener, {
    passive: false,
  });

  if (s.selectable) {
    handEl.addEventListener('mouseup', selectToDropFromHand(s) as EventListener, { passive: false });
    handEl.addEventListener('touchend', selectToDropFromHand(s) as EventListener, { passive: false });
  }

  if (s.disableContextMenu || s.drawable.enabled) handEl.addEventListener('contextmenu', e => e.preventDefault());
}

// returns the unbind function
export function bindDocument(s: State, boundsUpdated: () => void): sg.Unbind {
  const unbinds: sg.Unbind[] = [];

  // Old versions of Edge and Safari do not support ResizeObserver. Send
  // shogiground.resize if a user action has changed the bounds of the board.
  if (!s.dom.relative && s.resizable && !('ResizeObserver' in window)) {
    unbinds.push(unbindable(document.body, 'shogiground.resize', boundsUpdated));
  }

  if (!s.viewOnly) {
    const onmove = dragOrDraw(s, drag.move, draw.move);
    const onend = dragOrDraw(s, drag.end, draw.end);

    for (const ev of ['touchmove', 'mousemove']) unbinds.push(unbindable(document, ev, onmove as EventListener));
    for (const ev of ['touchend', 'mouseup']) unbinds.push(unbindable(document, ev, onend as EventListener));

    const onScroll = () => s.dom.bounds.clear();
    unbinds.push(unbindable(document, 'scroll', onScroll, { capture: true, passive: true }));
    unbinds.push(unbindable(window, 'resize', onScroll, { passive: true }));
  }

  return () => unbinds.forEach(f => f());
}

function unbindable(
  el: EventTarget,
  eventName: string,
  callback: EventListener,
  options?: AddEventListenerOptions
): sg.Unbind {
  el.addEventListener(eventName, callback, options);
  return () => el.removeEventListener(eventName, callback, options);
}

function startDragOrDraw(s: State): MouchBind {
  return e => {
    if (s.draggable.current) drag.cancel(s);
    else if (s.drawable.current) draw.cancel(s);
    else if (e.shiftKey || isRightButton(e)) {
      if (s.drawable.enabled) draw.start(s, e);
    } else if (!s.viewOnly) {
      if (s.dropmode.active && !squareOccupied(s, e)) drop(s, e);
      else {
        cancelDropMode(s);
        drag.start(s, e);
      }
    }
  };
}

function dragOrDraw(s: State, withDrag: StateMouchBind, withDraw: StateMouchBind): MouchBind {
  return e => {
    if (s.drawable.current) {
      if (s.drawable.enabled) withDraw(s, e);
    } else if (!s.viewOnly) withDrag(s, e);
  };
}

function squareOccupied(s: State, e: sg.MouchEvent): boolean {
  const position = eventPosition(e);
  const dest = position && getKeyAtDomPos(position, sentePov(s), s.dimensions, s.dom.bounds());
  if (dest && s.pieces.has(dest)) return true;
  return false;
}

function getPiece(pieceEl: HTMLElement): sg.Piece | undefined {
  const role = pieceEl.dataset.role as sg.Role;
  const color = pieceEl.dataset.color as sg.Color;
  if (role && color) return { role: role, color: color };
  return;
}

function startDragFromHand(s: State): MouchBind {
  return e => {
    e.preventDefault();
    const piece = getPiece(e.target as HTMLElement);
    if (
      piece &&
      (s.movable.color === 'both' || s.movable.color === piece.color) &&
      s.hands.handMap.get(piece.color)?.get(piece.role)
    ) {
      cancelDropMode(s);
      drag.dragNewPiece(s, piece, e, true, false);
    }
  };
}
function selectToDropFromHand(s: State): MouchBind {
  return e => {
    const piece = getPiece(e.target as HTMLElement);
    if (
      piece &&
      (s.movable.color === 'both' || s.movable.color === piece.color) &&
      s.hands.handMap.get(piece.color)?.get(piece.role) &&
      (e.type !== 'touchend' ||
        !s.draggable.current ||
        (Math.abs(s.draggable.current.pos[0] - s.draggable.current.origPos[0]) < 20 &&
          Math.abs(s.draggable.current.pos[1] - s.draggable.current.origPos[1]) < 20))
    ) {
      if (s.dropmode.active) cancelDropMode(s);
      else setDropMode(s, piece, true);
    }
  };
}
