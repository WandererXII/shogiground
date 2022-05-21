import type { PieceNode, WrapElements } from './types.js';
import { Api, start } from './api.js';
import { Config, configure } from './config.js';
import { defaults, State } from './state.js';
import * as util from './util.js';
import { redrawAll } from './dom.js';
import { bindDocument } from './events.js';

export function Shogiground(config?: Config, wrapElements?: WrapElements): Api {
  const state = defaults() as State;
  configure(state, config || {});

  state.dom = {
    wrapElements: wrapElements || {},
    elements: {},
    bounds: {
      board: {
        bounds: util.memo(() => state.dom.elements.board?.pieces.getBoundingClientRect()),
      },
      hands: {
        bounds: util.memo(() => {
          const handsRects = new Map(),
            handEls = state.dom.elements.hands;
          if (handEls?.top) handsRects.set('top', handEls.top.getBoundingClientRect());
          if (handEls?.bottom) handsRects.set('bottom', handEls.bottom.getBoundingClientRect());
          return handsRects;
        }),
        pieceBounds: util.memo(() => {
          const handPiecesRects = new Map(),
            handEls = state.dom.elements.hands;

          if (handEls?.top) {
            let wrapEl = handEls.top.firstElementChild as HTMLElement | undefined;
            while (wrapEl) {
              const pieceEl = wrapEl.firstElementChild as PieceNode,
                piece = { role: pieceEl.sgRole, color: pieceEl.sgColor };
              handPiecesRects.set(util.pieceNameOf(piece), pieceEl.getBoundingClientRect());
              wrapEl = wrapEl.nextElementSibling as HTMLElement | undefined;
            }
          }
          if (handEls?.bottom) {
            let wrapEl = handEls.bottom.firstElementChild as HTMLElement | undefined;
            while (wrapEl) {
              const pieceEl = wrapEl.firstElementChild as PieceNode,
                piece = { role: pieceEl.sgRole, color: pieceEl.sgColor };
              handPiecesRects.set(util.pieceNameOf(piece), pieceEl.getBoundingClientRect());
              wrapEl = wrapEl.nextElementSibling as HTMLElement | undefined;
            }
          }
          return handPiecesRects;
        }),
      },
    },
    unbind: bindDocument(state),
    destroyed: false,
  };

  if (wrapElements) redrawAll(wrapElements, state);

  return start(state);
}
