import type { PieceNode, WrapElements } from './types.js';
import { Api, start } from './api.js';
import { Config, configure } from './config.js';
import { defaults, State } from './state.js';
import * as util from './util.js';
import { redrawAll } from './dom.js';
import { bindDocument } from './events.js';

export function Shogiground(wrapElements?: WrapElements, config?: Config): Api {
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
            let el = handEls.top.firstElementChild as PieceNode | undefined;
            while (el) {
              const piece = { role: el.sgRole, color: el.sgColor };
              handPiecesRects.set(util.pieceNameOf(piece), el.getBoundingClientRect());
              el = el.nextElementSibling as PieceNode | undefined;
            }
          }
          if (handEls?.bottom) {
            let el = handEls.bottom.firstElementChild as PieceNode | undefined;
            while (el) {
              const piece = { role: el.sgRole, color: el.sgColor };
              handPiecesRects.set(util.pieceNameOf(piece), el.getBoundingClientRect());
              el = el.nextElementSibling as PieceNode | undefined;
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
