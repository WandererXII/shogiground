import type { State } from './state.js';
import type { WrapElements, WrapElementsBoolean } from './types.js';
import { wrapBoard, wrapHand } from './wrap.js';
import * as events from './events.js';
import { renderHand } from './hands.js';
import { render } from './render.js';

function attachBoard(state: State, boardWrap: HTMLElement): void {
  const elements = wrapBoard(boardWrap, state);

  // in case of inlined hands
  if (elements.hands) attachHands(state, elements.hands.top, elements.hands.bottom);

  state.dom.wrapElements.board = boardWrap;
  state.dom.elements.board = elements;
  state.dom.bounds.board.bounds.clear();

  events.bindBoard(state, elements);

  state.drawable.prevSvgHash = '';
  state.promotion.prevPromotionHash = '';

  render(state, elements);
}

function attachHands(state: State, handTopWrap?: HTMLElement, handBottomWrap?: HTMLElement): void {
  if (!state.dom.elements.hands) state.dom.elements.hands = {};
  if (!state.dom.wrapElements.hands) state.dom.wrapElements.hands = {};

  if (handTopWrap) {
    const handTop = wrapHand(handTopWrap, 'top', state);
    state.dom.wrapElements.hands.top = handTopWrap;
    state.dom.elements.hands.top = handTop;
    events.bindHand(state, handTop);
    renderHand(state, handTop);
  }
  if (handBottomWrap) {
    const handBottom = wrapHand(handBottomWrap, 'bottom', state);
    state.dom.wrapElements.hands.bottom = handBottomWrap;
    state.dom.elements.hands.bottom = handBottom;
    events.bindHand(state, handBottom);
    renderHand(state, handBottom);
  }

  if (handTopWrap || handBottomWrap) {
    state.dom.bounds.hands.bounds.clear();
    state.dom.bounds.hands.pieceBounds.clear();
  }
}

export function redrawAll(wrapElements: WrapElements, state: State): void {
  if (wrapElements.board) attachBoard(state, wrapElements.board);
  if (wrapElements.hands && !state.hands.inlined)
    attachHands(state, wrapElements.hands.top, wrapElements.hands.bottom);

  // shapes might depend both on board and hands - redraw only after both are done
  state.dom.redrawShapes();

  if (state.events.insert)
    state.events.insert(wrapElements.board && state.dom.elements.board, {
      top: wrapElements.hands?.top && state.dom.elements.hands?.top,
      bottom: wrapElements.hands?.bottom && state.dom.elements.hands?.bottom,
    });
}

export function detachElements(web: WrapElementsBoolean, state: State): void {
  if (web.board) {
    state.dom.wrapElements.board = undefined;
    state.dom.elements.board = undefined;
    state.dom.bounds.board.bounds.clear();
  }
  if (state.dom.elements.hands && state.dom.wrapElements.hands) {
    if (web.hands?.top) {
      state.dom.wrapElements.hands.top = undefined;
      state.dom.elements.hands.top = undefined;
    }
    if (web.hands?.bottom) {
      state.dom.wrapElements.hands.bottom = undefined;
      state.dom.elements.hands.bottom = undefined;
    }
    if (web.hands?.top || web.hands?.bottom) {
      state.dom.bounds.hands.bounds.clear();
      state.dom.bounds.hands.pieceBounds.clear();
    }
  }
}
