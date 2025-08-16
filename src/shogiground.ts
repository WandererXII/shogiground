import type { Api } from './api.js';
import { start } from './api.js';
import type { Config } from './config.js';
import { configure } from './config.js';
import { redrawAll } from './dom.js';
import { bindDocument } from './events.js';
import { redrawNow, redrawShapesNow } from './redraw.js';
import type { State } from './state.js';
import { defaults } from './state.js';
import type { DOMRectMap, PieceName, PieceNode, WrapElements } from './types.js';
import * as util from './util.js';

export function Shogiground(config?: Config, wrapElements?: WrapElements): Api {
  const state = defaults() as State;
  configure(state, config || {});

  const redrawStateNow = (skipShapes?: boolean) => {
    redrawNow(state, skipShapes);
  };

  state.dom = {
    wrapElements: wrapElements || {},
    elements: {},
    bounds: {
      board: {
        bounds: util.memo(() => state.dom.elements.board?.pieces.getBoundingClientRect()),
      },
      hands: {
        bounds: util.memo(() => {
          const handsRects: DOMRectMap<'top' | 'bottom'> = new Map();
          const handEls = state.dom.elements.hands;
          if (handEls?.top) handsRects.set('top', handEls.top.getBoundingClientRect());
          if (handEls?.bottom) handsRects.set('bottom', handEls.bottom.getBoundingClientRect());
          return handsRects;
        }),
        pieceBounds: util.memo(() => {
          const handPiecesRects: DOMRectMap<PieceName> = new Map();
          const handEls = state.dom.elements.hands;

          if (handEls?.top) {
            let wrapEl = handEls.top.firstElementChild as HTMLElement | undefined;
            while (wrapEl) {
              const pieceEl = wrapEl.firstElementChild as PieceNode;
              const piece = { role: pieceEl.sgRole, color: pieceEl.sgColor };
              handPiecesRects.set(util.pieceNameOf(piece), pieceEl.getBoundingClientRect());
              wrapEl = wrapEl.nextElementSibling as HTMLElement | undefined;
            }
          }
          if (handEls?.bottom) {
            let wrapEl = handEls.bottom.firstElementChild as HTMLElement | undefined;
            while (wrapEl) {
              const pieceEl = wrapEl.firstElementChild as PieceNode;
              const piece = { role: pieceEl.sgRole, color: pieceEl.sgColor };
              handPiecesRects.set(util.pieceNameOf(piece), pieceEl.getBoundingClientRect());
              wrapEl = wrapEl.nextElementSibling as HTMLElement | undefined;
            }
          }
          return handPiecesRects;
        }),
      },
    },
    redrawNow: redrawStateNow,
    redraw: debounceRedraw(redrawStateNow),
    redrawShapes: debounceRedraw(() => redrawShapesNow(state)),
    unbind: bindDocument(state),
    destroyed: false,
  };

  if (wrapElements) redrawAll(wrapElements, state);

  return start(state);
}

function debounceRedraw(f: (...args: any[]) => void): (...args: any[]) => void {
  let redrawing = false;
  return (...args: any[]) => {
    if (redrawing) return;
    redrawing = true;
    requestAnimationFrame(() => {
      f(...args);
      redrawing = false;
    });
  };
}
