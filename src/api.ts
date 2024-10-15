import type { Config } from './config.js';
import type { State } from './state.js';
import type { DrawShape, SquareHighlight } from './draw.js';
import type * as sg from './types.js';
import * as board from './board.js';
import { addToHand, removeFromHand } from './hands.js';
import { inferDimensions, boardToSfen, handsToSfen } from './sfen.js';
import { applyAnimation, configure } from './config.js';
import { anim, render } from './anim.js';
import { cancel as dragCancel, dragNewPiece } from './drag.js';
import { detachElements, redrawAll } from './dom.js';

export interface Api {
  // attach elements to current sg instance
  attach(wrapElements: sg.WrapElements): void;

  // detach elements from current sg instance
  detach(wrapElementsBoolean: sg.WrapElementsBoolean): void;

  // reconfigure the instance. Accepts all config options
  // board will be animated accordingly, if animations are enabled
  set(config: Config, skipAnimation?: boolean): void;

  // read shogiground state; write at your own risks
  state: State;

  // get the position on the board in Forsyth notation
  getBoardSfen(): sg.BoardSfen;

  // get the pieces in hand in Forsyth notation
  getHandsSfen(): sg.HandsSfen;

  // change the view angle
  toggleOrientation(): void;

  // perform a move programmatically
  move(orig: sg.Key, dest: sg.Key, prom?: boolean): void;

  // perform a drop programmatically, by default piece is taken from hand
  drop(piece: sg.Piece, key: sg.Key, prom?: boolean, spare?: boolean): void;

  // add and/or remove arbitrary pieces on the board
  setPieces(pieces: sg.PiecesDiff): void;

  // add piece.role to hand of piece.color
  addToHand(piece: sg.Piece, count?: number): void;

  // remove piece.role from hand of piece.color
  removeFromHand(piece: sg.Piece, count?: number): void;

  // click a square programmatically
  selectSquare(key: sg.Key | null, prom?: boolean, force?: boolean): void;

  // select a piece from hand to drop programatically, by default piece in hand is selected
  selectPiece(piece: sg.Piece | null, spare?: boolean, force?: boolean): void;

  // play the current premove, if any; returns true if premove was played
  playPremove(): boolean;

  // cancel the current premove, if any
  cancelPremove(): void;

  // play the current predrop, if any; returns true if premove was played
  playPredrop(): boolean;

  // cancel the current predrop, if any
  cancelPredrop(): void;

  // cancel the current move or drop being made, premoves and predrops
  cancelMoveOrDrop(): void;

  // cancel current move or drop and prevent further ones
  stop(): void;

  // programmatically draw user shapes
  setShapes(shapes: DrawShape[]): void;

  // programmatically draw auto shapes
  setAutoShapes(shapes: DrawShape[]): void;

  // programmatically highlight squares
  setSquareHighlights(squares: SquareHighlight[]): void;

  // for piece dropping and board editors
  dragNewPiece(piece: sg.Piece, event: sg.MouchEvent, spare?: boolean): void;

  // unbinds all events
  // (important for document-wide events like scroll and mousemove)
  destroy: sg.Unbind;
}

// see API types and documentations in api.d.ts
export function start(state: State): Api {
  return {
    attach(wrapElements: sg.WrapElements): void {
      redrawAll(wrapElements, state);
    },

    detach(wrapElementsBoolean: sg.WrapElementsBoolean): void {
      detachElements(wrapElementsBoolean, state);
    },

    set(config: Config, skipAnimation?: boolean): void {
      function getByPath(path: string, obj: any) {
        const properties = path.split('.');
        return properties.reduce((prev, curr) => prev && prev[curr], obj);
      }

      const forceRedrawProps: (`${keyof Config}` | `${keyof Config}.${string}`)[] = [
        'orientation',
        'viewOnly',
        'coordinates.enabled',
        'coordinates.notation',
        'drawable.visible',
        'hands.inlined',
      ];
      const newDims = config.sfen?.board && inferDimensions(config.sfen.board);
      const toRedraw =
        forceRedrawProps.some(p => {
          const cRes = getByPath(p, config);
          return cRes && cRes !== getByPath(p, state);
        }) ||
        !!(newDims && (newDims.files !== state.dimensions.files || newDims.ranks !== state.dimensions.ranks)) ||
        !!config.hands?.roles?.every((r, i) => r === state.hands.roles[i]);

      if (toRedraw) {
        board.reset(state);
        configure(state, config);
        redrawAll(state.dom.wrapElements, state);
      } else {
        applyAnimation(state, config);
        (config.sfen?.board && !skipAnimation ? anim : render)(state => configure(state, config), state);
      }
    },

    state,

    getBoardSfen: () => boardToSfen(state.pieces, state.dimensions, state.forsyth.toForsyth),

    getHandsSfen: () => handsToSfen(state.hands.handMap, state.hands.roles, state.forsyth.toForsyth),

    toggleOrientation(): void {
      board.toggleOrientation(state);
      redrawAll(state.dom.wrapElements, state);
    },

    move(orig, dest, prom): void {
      anim(state => board.baseMove(state, orig, dest, prom || state.promotion.forceMovePromotion(orig, dest)), state);
    },

    drop(piece, key, prom, spare): void {
      anim(state => {
        state.droppable.spare = !!spare;
        board.baseDrop(state, piece, key, prom || state.promotion.forceDropPromotion(piece, key));
      }, state);
    },

    setPieces(pieces): void {
      anim(state => board.setPieces(state, pieces), state);
    },

    addToHand(piece: sg.Piece, count: number): void {
      render(state => addToHand(state, piece, count), state);
    },

    removeFromHand(piece: sg.Piece, count: number): void {
      render(state => removeFromHand(state, piece, count), state);
    },

    selectSquare(key, prom, force): void {
      if (key) anim(state => board.selectSquare(state, key, prom, force), state);
      else if (state.selected) {
        board.unselect(state);
        state.dom.redraw();
      }
    },

    selectPiece(piece, spare, force): void {
      if (piece) render(state => board.selectPiece(state, piece, spare, force, true), state);
      else if (state.selectedPiece) {
        board.unselect(state);
        state.dom.redraw();
      }
    },

    playPremove(): boolean {
      if (state.premovable.current) {
        if (anim(board.playPremove, state)) return true;
        // if the premove couldn't be played, redraw to clear it up
        state.dom.redraw();
      }
      return false;
    },

    playPredrop(): boolean {
      if (state.predroppable.current) {
        if (anim(board.playPredrop, state)) return true;
        // if the predrop couldn't be played, redraw to clear it up
        state.dom.redraw();
      }
      return false;
    },

    cancelPremove(): void {
      render(board.unsetPremove, state);
    },

    cancelPredrop(): void {
      render(board.unsetPredrop, state);
    },

    cancelMoveOrDrop(): void {
      render(state => {
        board.cancelMoveOrDrop(state);
        dragCancel(state);
      }, state);
    },

    stop(): void {
      render(state => {
        board.stop(state);
      }, state);
    },

    setAutoShapes(shapes: DrawShape[]): void {
      render(state => (state.drawable.autoShapes = shapes), state);
    },

    setShapes(shapes: DrawShape[]): void {
      render(state => (state.drawable.shapes = shapes), state);
    },

    setSquareHighlights(squares: SquareHighlight[]): void {
      render(state => (state.drawable.squares = squares), state);
    },

    dragNewPiece(piece, event, spare): void {
      dragNewPiece(state, piece, event, spare);
    },

    destroy(): void {
      board.stop(state);
      state.dom.unbind();
      state.dom.destroyed = true;
    },
  };
}
