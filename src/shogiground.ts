import { Api, start } from './api.js';
import { Config, configure } from './config.js';
import { HeadlessState, State, defaults } from './state.js';
import { wrapBoard, wrapHands } from './wrap.js';
import * as events from './events.js';
import { render } from './render.js';
import * as shapes from './shapes.js';
import * as util from './util.js';
import { renderPromotion } from './promotion.js';
import { PieceNode, WrapElements } from './types.js';

export function Shogiground(wrapElements: WrapElements, config?: Config): Api {
  const maybeState: State | HeadlessState = defaults();

  configure(maybeState, config || {});

  function redrawAll(): State {
    const prevUnbind = 'dom' in maybeState ? maybeState.dom.unbind : undefined;
    const boardElements = wrapBoard(wrapElements, maybeState),
      handElements = wrapHands(wrapElements, maybeState),
      boardBounds = util.memo(() => boardElements.pieces.getBoundingClientRect()),
      handsBounds = util.memo(() => {
        const handsRects = new Map();
        if (handElements.top) handsRects.set('top', handElements.top.getBoundingClientRect());
        if (handElements.bottom) handsRects.set('bottom', handElements.bottom.getBoundingClientRect());
        return handsRects;
      }),
      handPiecesBounds = util.memo(() => {
        const handPiecesRects = new Map();
        if (handElements.top) {
          let el = handElements.top.firstElementChild as PieceNode | undefined;
          while (el) {
            const piece = { role: el.sgRole, color: el.sgColor };
            handPiecesRects.set(util.pieceNameOf(piece), el.getBoundingClientRect());
            el = el.nextElementSibling as PieceNode | undefined;
          }
        }
        if (handElements.bottom) {
          let el = handElements.bottom.firstElementChild as PieceNode | undefined;
          while (el) {
            const piece = { role: el.sgRole, color: el.sgColor };
            handPiecesRects.set(util.pieceNameOf(piece), el.getBoundingClientRect());
            el = el.nextElementSibling as PieceNode | undefined;
          }
        }
        return handPiecesRects;
      }),
      redrawNow = (skipShapes?: boolean): void => {
        render(state);
        renderPromotion(state);
        if (!skipShapes && boardElements.svg)
          shapes.renderShapes(state, boardElements.svg, boardElements.customSvg!, boardElements.freePieces!);
      },
      onResize = (): void => {
        boardBounds.clear();
        handsBounds.clear();
        handPiecesBounds.clear();

        if (maybeState.drawable.shapes.some(s => shapes.isPiece(s.orig) || shapes.isPiece(s.dest)) && boardElements.svg)
          shapes.renderShapes(state, boardElements.svg, boardElements.customSvg!, boardElements.freePieces!);
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
      wrapElements,
      redraw: debounceRedraw(redrawNow),
      redrawNow,
      unbind: prevUnbind,
    };
    state.drawable.prevSvgHash = '';
    redrawNow(false);
    events.bindBoard(state, onResize);
    events.bindHands(state, onResize);
    if (!prevUnbind) state.dom.unbind = events.bindDocument(state, onResize);
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
