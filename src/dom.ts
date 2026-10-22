import * as events from './events.js';
import { renderHand } from './hands.js';
import { render } from './render.js';
import type { State } from './state.js';
import type { WrapElements, WrapElementsBoolean } from './types.js';
import { wrapBoard, wrapHand } from './wrap.js';

function attachBoard(state: State, boardWrap: HTMLElement): void {
  detachElements({ board: true }, state, true);
  const elements = wrapBoard(boardWrap, state);

  // in case of inlined hands
  if (elements.hands) attachHands(state, elements.hands.top, elements.hands.bottom);

  state.dom.wrapElements.board = boardWrap;
  state.dom.elements.board = elements;
  state.dom.bounds.board.bounds.clear();

  state.dom.elementUnbinds.set(elements.board, events.bindBoard(state, elements));

  state.drawable.prevSvgHash = '';
  state.promotion.prevPromotionHash = '';

  render(state, elements);
}

function attachHands(state: State, handTopWrap?: HTMLElement, handBottomWrap?: HTMLElement): void {
  if (handTopWrap) state.dom.elements.hands?.top?.remove();
  if (handBottomWrap) state.dom.elements.hands?.bottom?.remove();
  detachElements({ hands: { top: !!handTopWrap, bottom: !!handBottomWrap } }, state, true);
  if (!state.dom.elements.hands) state.dom.elements.hands = {};

  if (handTopWrap) {
    const handTop = wrapHand(handTopWrap, 'top', state);
    state.dom.elements.hands.top = handTop;
    state.dom.elementUnbinds.set(handTop, events.bindHand(state, handTop));
    renderHand(state, handTop);
  }
  if (handBottomWrap) {
    const handBottom = wrapHand(handBottomWrap, 'bottom', state);
    state.dom.elements.hands.bottom = handBottom;
    state.dom.elementUnbinds.set(handBottom, events.bindHand(state, handBottom));
    renderHand(state, handBottom);
  }

  if (handTopWrap || handBottomWrap) {
    state.dom.bounds.hands.bounds.clear();
    state.dom.bounds.hands.pieceBounds.clear();
  }
}

export function redrawAll(wrapElements: WrapElements, state: State): void {
  if (state.dom.destroyed) return;
  if (wrapElements.hands) {
    if (!state.dom.wrapElements.hands) state.dom.wrapElements.hands = {};
    if (wrapElements.hands.top) state.dom.wrapElements.hands.top = wrapElements.hands.top;
    if (wrapElements.hands.bottom) state.dom.wrapElements.hands.bottom = wrapElements.hands.bottom;
  }
  if (wrapElements.board) attachBoard(state, wrapElements.board);
  if (wrapElements.hands && !state.hands.inlined)
    attachHands(state, wrapElements.hands.top, wrapElements.hands.bottom);
  else if (state.hands.inlined && !state.dom.elements.board) {
    state.dom.elements.hands?.top?.remove();
    state.dom.elements.hands?.bottom?.remove();
    detachElements({ hands: { top: true, bottom: true } }, state, true);
  }

  // shapes might depend both on board and hands - redraw only after both are done
  state.dom.redrawShapes();

  const hands =
    state.hands.inlined && wrapElements.board
      ? state.dom.elements.board?.hands
      : wrapElements.hands;
  if (state.events.insert)
    state.events.insert(wrapElements.board && state.dom.elements.board, {
      top: hands?.top && state.dom.elements.hands?.top,
      bottom: hands?.bottom && state.dom.elements.hands?.bottom,
    });
}

export function detachElements(
  web: WrapElementsBoolean,
  state: State,
  keepWrapElements = false,
): void {
  const inlineHands = web.board ? state.dom.elements.board?.hands : undefined;
  const detachTop =
    web.hands?.top ||
    (!!inlineHands?.top && inlineHands.top.firstElementChild === state.dom.elements.hands?.top);
  const detachBottom =
    web.hands?.bottom ||
    (!!inlineHands?.bottom &&
      inlineHands.bottom.firstElementChild === state.dom.elements.hands?.bottom);
  if (!keepWrapElements) {
    if (web.board) state.dom.wrapElements.board = undefined;
    if (web.hands?.top && state.dom.wrapElements.hands)
      state.dom.wrapElements.hands.top = undefined;
    if (web.hands?.bottom && state.dom.wrapElements.hands)
      state.dom.wrapElements.hands.bottom = undefined;
  }
  if (web.board) {
    if (state.dom.elements.board) unbindElement(state, state.dom.elements.board.board);
    state.dom.elements.board = undefined;
    state.dom.bounds.board.bounds.clear();
  }
  if (state.dom.elements.hands) {
    if (detachTop) {
      if (state.dom.elements.hands.top) unbindElement(state, state.dom.elements.hands.top);
      state.dom.elements.hands.top = undefined;
    }
    if (detachBottom) {
      if (state.dom.elements.hands.bottom) unbindElement(state, state.dom.elements.hands.bottom);
      state.dom.elements.hands.bottom = undefined;
    }
    if (detachTop || detachBottom) {
      state.dom.bounds.hands.bounds.clear();
      state.dom.bounds.hands.pieceBounds.clear();
    }
  }
}

function unbindElement(state: State, el: HTMLElement): void {
  state.dom.elementUnbinds.get(el)?.();
  state.dom.elementUnbinds.delete(el);
  state.dom.resizeObserver?.unobserve(el);
}
