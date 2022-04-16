import { State } from './state.js';
import * as drag from './drag.js';
import * as draw from './draw.js';
import { eventPosition, getHandPieceAtDomPos, isMiddleButton, isRightButton } from './util.js';
import * as sg from './types.js';
import { cancelPromotion, promote } from './promotion.js';

type MouchBind = (e: sg.MouchEvent) => void;
type StateMouchBind = (d: State, e: sg.MouchEvent) => void;

export function bindBoard(s: State, onResize: () => void): void {
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(s.dom.board.elements.board);

  if (s.viewOnly) return;

  const piecesEl = s.dom.board.elements.pieces;
  const promotionEl = s.dom.board.elements.promotion;

  // Cannot be passive, because we prevent touch scrolling and dragging of selected elements.
  const onStart = startDragOrDraw(s);
  piecesEl.addEventListener('touchstart', onStart as EventListener, {
    passive: false,
  });
  piecesEl.addEventListener('mousedown', onStart as EventListener, {
    passive: false,
  });
  if (s.disableContextMenu || s.drawable.enabled) piecesEl.addEventListener('contextmenu', e => e.preventDefault());

  if (promotionEl) {
    const pieceSelection = (e: sg.MouchEvent) => promote(s, e);
    promotionEl.addEventListener('click', pieceSelection as EventListener);
    if (s.disableContextMenu) promotionEl.addEventListener('contextmenu', e => e.preventDefault());
  }
}

export function bindHands(s: State, onResize: () => void): void {
  if (s.dom.hands.elements.top) bindHand(s, s.dom.hands.elements.top, onResize);
  if (s.dom.hands.elements.bottom) bindHand(s, s.dom.hands.elements.bottom, onResize);
}

function bindHand(s: State, handEl: HTMLElement, onResize: () => void): void {
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(handEl);

  if (s.viewOnly) return;

  const onStart = startDragFromHand(s);
  handEl.addEventListener('mousedown', onStart as EventListener, { passive: false });
  handEl.addEventListener('touchstart', onStart as EventListener, {
    passive: false,
  });
  if (s.dom.board.elements.promotion)
    handEl.addEventListener('click', () => {
      if (s.promotion.current) {
        cancelPromotion(s);
        s.dom.redraw();
      }
    });

  if (s.disableContextMenu || s.drawable.enabled) handEl.addEventListener('contextmenu', e => e.preventDefault());
}

// returns the unbind function
export function bindDocument(s: State, onResize: () => void): sg.Unbind {
  const unbinds: sg.Unbind[] = [];

  // Old versions of Edge and Safari do not support ResizeObserver. Send
  // shogiground.resize if a user action has changed the bounds of the board.
  if (!('ResizeObserver' in window)) {
    unbinds.push(unbindable(document.body, 'shogiground.resize', onResize));
  }

  if (!s.viewOnly) {
    const onmove = dragOrDraw(s, drag.move, draw.move);
    const onend = dragOrDraw(s, drag.end, draw.end);

    for (const ev of ['touchmove', 'mousemove']) unbinds.push(unbindable(document, ev, onmove as EventListener));
    for (const ev of ['touchend', 'mouseup']) unbinds.push(unbindable(document, ev, onend as EventListener));

    const onScroll = () => {
      s.dom.board.bounds.clear();
      s.dom.hands.bounds.clear();
      s.dom.hands.pieceBounds.clear();
    };
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
    } else if (!s.viewOnly && !drag.unwantedEvent(e)) drag.start(s, e);
  };
}

function dragOrDraw(s: State, withDrag: StateMouchBind, withDraw: StateMouchBind): MouchBind {
  return e => {
    if (s.drawable.current) {
      if (s.drawable.enabled) withDraw(s, e);
    } else if (!s.viewOnly) withDrag(s, e);
  };
}

function startDragFromHand(s: State): MouchBind {
  return e => {
    if (s.promotion.current) return;

    const pos = eventPosition(e),
      piece = pos && getHandPieceAtDomPos(pos, s.hands.roles, s.dom.hands.pieceBounds());

    if (piece) {
      if (s.draggable.current) drag.cancel(s);
      else if (s.drawable.current) draw.cancel(s);
      else if (isMiddleButton(e)) {
        if (s.drawable.enabled) draw.setDrawPiece(s, piece);
      } else if (e.shiftKey || isRightButton(e)) {
        if (s.drawable.enabled) draw.startFromHand(s, piece, e);
      } else if (!s.viewOnly && !drag.unwantedEvent(e)) {
        if (e.cancelable !== false) e.preventDefault();
        drag.dragNewPiece(s, piece, e);
      }
    }
  };
}
