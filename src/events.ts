import { State } from './state.js';
import * as drag from './drag.js';
import * as draw from './draw.js';
import { isRightButton, samePiece } from './util.js';
import * as sg from './types.js';
import { promote } from './promotion.js';
import { removeFromHand } from './board.js';

type MouchBind = (e: sg.MouchEvent) => void;
type StateMouchBind = (d: State, e: sg.MouchEvent) => void;

export function bindBoard(s: State, boundsUpdated: () => void): void {
  if (s.resizable && 'ResizeObserver' in window) new ResizeObserver(boundsUpdated).observe(s.dom.elements.board);

  if (s.viewOnly) return;

  const piecesEl = s.dom.elements.pieces;
  const promotionEl = s.dom.elements.promotion;

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
    promotionEl.addEventListener('click', pieceSelection as EventListener, {
      passive: false,
    });
    if (s.disableContextMenu) promotionEl.addEventListener('contextmenu', e => e.preventDefault());
  }
}

export function bindHands(s: State): void {
  if (s.viewOnly || !s.dom.elements.handTop || !s.dom.elements.handBottom) return;
  bindHand(s, s.dom.elements.handTop);
  bindHand(s, s.dom.elements.handBottom);
}

function bindHand(s: State, handEl: HTMLElement): void {
  if (s.resizable && 'ResizeObserver' in window)
    new ResizeObserver(() => {
      s.dom.boardBounds.clear();
      s.dom.handPiecesBounds.clear();
      s.dom.handsBounds.clear();
    }).observe(handEl);

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
  if (s.resizable && !('ResizeObserver' in window)) {
    unbinds.push(unbindable(document.body, 'shogiground.resize', boundsUpdated));
  }

  if (!s.viewOnly) {
    const onmove = dragOrDraw(s, drag.move, draw.move);
    const onend = dragOrDraw(s, drag.end, draw.end);

    for (const ev of ['touchmove', 'mousemove']) unbinds.push(unbindable(document, ev, onmove as EventListener));
    for (const ev of ['touchend', 'mouseup']) unbinds.push(unbindable(document, ev, onend as EventListener));

    const onScroll = () => {
      s.dom.boardBounds.clear();
      s.dom.handsBounds.clear();
      s.dom.handPiecesBounds.clear();
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
    const target = e.target as HTMLElement;
    if (sg.isPieceNode(target)) {
      const piece = { color: target.sgColor, role: target.sgRole };
      if (e.shiftKey || isRightButton(e)) {
        if (s.drawable.piece && samePiece(s.drawable.piece, piece)) s.drawable.piece = undefined;
        else s.drawable.piece = piece;
        s.dom.redraw();
      } else if (!s.viewOnly && !drag.unwantedEvent(e)) {
        if (s.spares.deleteOnTouch) {
          removeFromHand(s, piece);
          s.dom.redraw();
        } else if (
          (s.activeColor === 'both' || s.activeColor === piece.color) &&
          s.hands.handMap.get(piece.color)?.get(piece.role)
        ) {
          if (e.cancelable !== false) e.preventDefault();
          drag.dragNewPiece(s, piece, e);
        }
      }
    }
  };
}
