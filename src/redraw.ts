import type { State } from './state.js';
import { render } from './render.js';
import { renderHand } from './hands.js';
import { renderShapes } from './shapes.js';

export function redrawShapesNow(state: State): void {
  if (state.dom.elements.board?.svg)
    renderShapes(
      state,
      state.dom.elements.board.svg,
      state.dom.elements.board.customSvg!,
      state.dom.elements.board.freePieces!
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
