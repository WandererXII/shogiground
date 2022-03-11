import { State } from './state.js';
import * as drag from './drag.js';
import * as draw from './draw.js';
import { drop } from './drop.js';
import { eventPosition, isRightButton } from './util.js';
import * as sg from './types.js';
import { cancelDropMode, getKeyAtDomPos, sentePov } from './board.js';
import { promote } from './promotion.js';

type MouchBind = (e: sg.MouchEvent) => void;
type StateMouchBind = (d: State, e: sg.MouchEvent) => void;

export function bindBoard(s: State, boundsUpdated: () => void): void {
  const piecesEl = s.dom.elements.pieces;
  const promotionEl = s.dom.elements.promotion;

  if (!s.dom.relative && s.resizable && 'ResizeObserver' in window) new ResizeObserver(boundsUpdated).observe(piecesEl);

  if (s.viewOnly) return;

  // Cannot be passive, because we prevent touch scrolling and dragging of selected elements.
  const onStart = startDragOrDraw(s);
  piecesEl.addEventListener('touchstart', onStart as EventListener, {
    passive: false,
  });
  piecesEl.addEventListener('mousedown', onStart as EventListener, {
    passive: false,
  });

  const pieceSelection = (e: sg.MouchEvent) => promote(s, e);
  promotionEl.addEventListener('click', pieceSelection as EventListener, {
    passive: false,
  });

  if (s.disableContextMenu || s.drawable.enabled) {
    piecesEl.addEventListener('contextmenu', e => e.preventDefault());
    promotionEl.addEventListener('contextmenu', e => e.preventDefault());
  }
}

export function bindHands(s: State): void {
  if (s.viewOnly || !s.dom.elements.handTop || !s.dom.elements.handBottom) return;
  bindHand(s, s.dom.elements.handTop);
  bindHand(s, s.dom.elements.handBottom);
}

function bindHand(s: State, handEl: HTMLElement): void {
  handEl.addEventListener('mousedown', startDragFromHand(s) as EventListener, { passive: false });
  handEl.addEventListener('touchstart', startDragFromHand(s) as EventListener, {
    passive: false,
  });

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

function startDragFromHand(s: State): MouchBind {
  return e => {
    const target = e.target as HTMLElement;
    if (sg.isPieceNode(target)) {
      const piece = { color: target.sgColor, role: target.sgRole };
      if (
        (s.activeColor === 'both' || s.activeColor === piece.color) &&
        s.hands.handMap.get(piece.color)?.get(piece.role)
      ) {
        e.preventDefault();
        drag.dragNewPiece(s, piece, e, true, false);
      }
    }
  };
}
