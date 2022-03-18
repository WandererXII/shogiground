import { Api, start } from './api.js';
import { Config, configure } from './config.js';
import { HeadlessState, State, defaults } from './state.js';
import { wrapBoard, wrapHands } from './wrap.js';
import * as events from './events.js';
import { render } from './render.js';
import * as shapes from './shapes.js';
import * as util from './util.js';
import { renderPromotions } from './promotion.js';
import { PieceNode, WrapElements } from './types.js';

export function Shogiground(wrapElements: WrapElements, config?: Config): Api {
  const maybeState: State | HeadlessState = defaults();

  configure(maybeState, config || {});

  function redrawAll(): State {
    const prevUnbind = 'dom' in maybeState ? maybeState.dom.unbind : undefined;
    const boardElements = wrapBoard(wrapElements, maybeState),
      handElements = wrapHands(wrapElements, maybeState),
      boardBounds = util.memo(() => {
        console.log('getBoundingClientRect');

        return boardElements.pieces.getBoundingClientRect();
      }),
      handsBounds = util.memo(() => {
        console.log('getBoundingClientRect2');

        const handsRects = new Map();
        if (handElements.top) handsRects.set('top', handElements.top.getBoundingClientRect());
        if (handElements.bottom) handsRects.set('bottom', handElements.bottom.getBoundingClientRect());
        return handsRects;
      }),
      handPiecesBounds = util.memo(() => {
        console.log('getBoundingClientRect3');

        const handPiecesRects = new Map();
        if (handElements.top) {
          let el = handElements.top.firstElementChild as PieceNode | undefined;
          while (el) {
            const role = el.sgRole;
            const color = el.sgColor;
            const piece = { role, color };
            handPiecesRects.set(util.pieceNameOf(piece), el.getBoundingClientRect());
            el = el.nextElementSibling as PieceNode | undefined;
          }
        }
        if (handElements.bottom) {
          let el = handElements.bottom.firstElementChild as PieceNode | undefined;
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
        if (!skipShapes && boardElements.svg && boardElements.customSvg && boardElements.freePieces)
          shapes.renderShapes(state, boardElements.svg, boardElements.customSvg, boardElements.freePieces);
      },
      boundsUpdated = (): void => {
        boardBounds.clear();
        handsBounds.clear();
        handPiecesBounds.clear();
      };
    const state = maybeState as State;
    state.dom = {
      board: {
        elements: boardElements,
        bounds: boardBounds,
      },
      hands: {
        elements: handElements,
        pieceBounds: handPiecesBounds,
        bounds: handsBounds,
      },
      redraw: debounceRedraw(redrawNow),
      redrawNow,
      unbind: prevUnbind,
    };
    state.drawable.prevSvgHash = '';
    redrawNow(false);
    events.bindBoard(state, boundsUpdated);
    events.bindHands(state);
    if (!prevUnbind) state.dom.unbind = events.bindDocument(state, boundsUpdated);
    state.events.insert && state.events.insert(boardElements, handElements);
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
