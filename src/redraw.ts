import type { State } from './state.js';
import { render } from './render.js';
import { renderHand } from './hands.js';
import { renderShapes } from './shapes.js';

export function redrawShapesNow(state: State): void {
  if (state.dom.elements.board?.shapes)
    renderShapes(
      state,
      state.dom.elements.board.shapes.svg,
      state.dom.elements.board.shapes.customSvg,
      state.dom.elements.board.shapes.freePieces,
    );
}

export function redrawNow(state: State, skipShapes?: boolean): void {
  const boardEls = state.dom.elements.board;
  if (boardEls) {
    render(state, boardEls);
    if (!skipShapes) redrawShapesNow(state);
  }

  const handEls = state.dom.elements.hands;
  if (handEls) {
    if (handEls.top) renderHand(state, handEls.top);
    if (handEls.bottom) renderHand(state, handEls.bottom);
  }
}
