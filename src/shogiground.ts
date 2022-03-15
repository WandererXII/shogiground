import { Api, start } from './api.js';
import { Config, configure } from './config.js';
import { HeadlessState, State, defaults } from './state.js';
import { renderWrap } from './wrap.js';
import * as events from './events.js';
import { render, updateBounds } from './render.js';
import * as shapes from './shapes.js';
import * as util from './util.js';
import { renderPromotions } from './promotion.js';
import { PieceNode, WrapElements } from './types.js';

export function Shogiground(wrapElements: WrapElements, config?: Config): Api {
  const maybeState: State | HeadlessState = defaults();

  configure(maybeState, config || {});

  function redrawAll(): State {
    const prevUnbind = 'dom' in maybeState ? maybeState.dom.unbind : undefined;
    const relative = maybeState.viewOnly && !maybeState.drawable.visible,
      elements = renderWrap(wrapElements, maybeState, relative),
      boardBounds = util.memo(() => elements.pieces.getBoundingClientRect()),
      handsBounds = util.memo(() => {
        const handsRects = new Map();
        if (elements.handTop) handsRects.set('top', elements.handTop.getBoundingClientRect());
        if (elements.handBottom) handsRects.set('bottom', elements.handBottom.getBoundingClientRect());
        return handsRects;
      }),
      handPiecesBounds = util.memo(() => {
        const handPiecesRects = new Map();
        if (elements.handTop) {
          let el = elements.handTop.firstElementChild as PieceNode | undefined;
          while (el) {
            const role = el.sgRole;
            const color = el.sgColor;
            const piece = { role, color };
            handPiecesRects.set(util.pieceNameOf(piece), el.getBoundingClientRect());
            el = el.nextElementSibling as PieceNode | undefined;
          }
        }
        if (elements.handBottom) {
          let el = elements.handBottom.firstElementChild as PieceNode | undefined;
          while (el) {
            const role = el.sgRole;
            const color = el.sgColor;
            const piece = { role, color };
            handPiecesRects.set(util.pieceNameOf(piece), el.getBoundingClientRect());
            el = el.nextElementSibling as PieceNode | undefined;
          }
        }
        return handPiecesRects;
      }),
      redrawNow = (skipShapes?: boolean): void => {
        render(state);
        renderPromotions(state);
        if (!skipShapes && elements.svg && elements.customSvg && elements.freePieces)
          shapes.renderShapes(state, elements.svg, elements.customSvg, elements.freePieces);
      },
      boundsUpdated = (): void => {
        boardBounds.clear();
        handsBounds.clear();
        handPiecesBounds.clear();
        updateBounds(state);
        renderPromotions(state);
        if (elements.svg && elements.customSvg && elements.freePieces)
          shapes.renderShapes(state, elements.svg, elements.customSvg, elements.freePieces);
      };
    const state = maybeState as State;
    state.dom = {
      elements,
      boardBounds,
      handsBounds,
      handPiecesBounds,
      redraw: debounceRedraw(redrawNow),
      redrawNow,
      unbind: prevUnbind,
      relative,
    };
    state.drawable.prevSvgHash = '';
    redrawNow(false);
    events.bindBoard(state, boundsUpdated);
    events.bindHands(state);
    if (!prevUnbind) state.dom.unbind = events.bindDocument(state, boundsUpdated);
    state.events.insert && state.events.insert(elements);
    return state;
  }

  return start(redrawAll(), redrawAll);
}

function debounceRedraw(redrawNow: (skipSvg?: boolean) => void): () => void {
  let redrawing = false;
  return () => {
    if (redrawing) return;
    redrawing = true;
    requestAnimationFrame(() => {
      redrawNow();
      redrawing = false;
    });
  };
}
