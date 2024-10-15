import type { State } from './state.js';
import type * as sg from './types.js';
import * as drag from './drag.js';
import * as draw from './draw.js';
import {
  callUserFunction,
  eventPosition,
  getHandPieceAtDomPos,
  isMiddleButton,
  isPieceNode,
  isRightButton,
  samePiece,
} from './util.js';
import { anim } from './anim.js';
import { userDrop, userMove, cancelPromotion, selectSquare } from './board.js';
import { usesBounds } from './shapes.js';

type MouchBind = (e: sg.MouchEvent) => void;
type StateMouchBind = (d: State, e: sg.MouchEvent) => void;

function clearBounds(s: State): void {
  s.dom.bounds.board.bounds.clear();
  s.dom.bounds.hands.bounds.clear();
  s.dom.bounds.hands.pieceBounds.clear();
}

function onResize(s: State): () => void {
  return () => {
    clearBounds(s);
    if (usesBounds(s.drawable.shapes.concat(s.drawable.autoShapes))) s.dom.redrawShapes();
  };
}

export function bindBoard(s: State, boardEls: sg.BoardElements): void {
  if ('ResizeObserver' in window) new ResizeObserver(onResize(s)).observe(boardEls.board);

  if (s.viewOnly) return;

  const piecesEl = boardEls.pieces,
    promotionEl = boardEls.promotion;

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

export function bindHand(s: State, handEl: HTMLElement): void {
  if ('ResizeObserver' in window) new ResizeObserver(onResize(s)).observe(handEl);

  if (s.viewOnly) return;

  const onStart = startDragFromHand(s);
  handEl.addEventListener('mousedown', onStart as EventListener, { passive: false });
  handEl.addEventListener('touchstart', onStart as EventListener, {
    passive: false,
  });
  handEl.addEventListener('click', () => {
    if (s.promotion.current) {
      cancelPromotion(s);
      s.dom.redraw();
    }
  });

  if (s.disableContextMenu || s.drawable.enabled) handEl.addEventListener('contextmenu', e => e.preventDefault());
}

// returns the unbind function
export function bindDocument(s: State): sg.Unbind {
  const unbinds: sg.Unbind[] = [];

  // Old versions of Edge and Safari do not support ResizeObserver. Send
  // shogiground.resize if a user action has changed the bounds of the board.
  if (!('ResizeObserver' in window)) {
    unbinds.push(unbindable(document.body, 'shogiground.resize', onResize(s)));
  }

  if (!s.viewOnly) {
    const onmove = dragOrDraw(s, drag.move, draw.move),
      onend = dragOrDraw(s, drag.end, draw.end);

    for (const ev of ['touchmove', 'mousemove']) unbinds.push(unbindable(document, ev, onmove as EventListener));
    for (const ev of ['touchend', 'mouseup']) unbinds.push(unbindable(document, ev, onend as EventListener));

    unbinds.push(unbindable(document, 'scroll', () => clearBounds(s), { capture: true, passive: true }));
    unbinds.push(unbindable(window, 'resize', () => clearBounds(s), { passive: true }));
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
    else if (e.shiftKey || isRightButton(e) || s.drawable.forced) {
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
      piece = pos && getHandPieceAtDomPos(pos, s.hands.roles, s.dom.bounds.hands.pieceBounds());

    if (piece) {
      if (s.draggable.current) drag.cancel(s);
      else if (s.drawable.current) draw.cancel(s);
      else if (isMiddleButton(e)) {
        if (s.drawable.enabled) {
          if (e.cancelable !== false) e.preventDefault();
          draw.setDrawPiece(s, piece);
        }
      } else if (e.shiftKey || isRightButton(e) || s.drawable.forced) {
        if (s.drawable.enabled) draw.startFromHand(s, piece, e);
      } else if (!s.viewOnly && !drag.unwantedEvent(e)) {
        if (e.cancelable !== false) e.preventDefault();
        drag.dragNewPiece(s, piece, e);
      }
    }
  };
}

function promote(s: State, e: sg.MouchEvent): void {
  e.stopPropagation();

  const target = e.target as HTMLElement | null,
    cur = s.promotion.current;
  if (target && isPieceNode(target) && cur) {
    const piece = { color: target.sgColor, role: target.sgRole },
      prom = !samePiece(cur.piece, piece);
    if (cur.dragged || (s.turnColor !== s.activeColor && s.activeColor !== 'both')) {
      if (s.selected) userMove(s, s.selected, cur.key, prom);
      else if (s.selectedPiece) userDrop(s, s.selectedPiece, cur.key, prom);
    } else anim(s => selectSquare(s, cur.key, prom), s);

    callUserFunction(s.promotion.events.after, piece);
  } else anim(s => cancelPromotion(s), s);
  s.promotion.current = undefined;

  s.dom.redraw();
}
