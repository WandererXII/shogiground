import { State } from './state.js';
import * as board from './board.js';
import { addToHand, removeFromHand } from './hands.js';
import { writeBoard, writeHands } from './sfen.js';
import { applyAnimation, Config, configure } from './config.js';
import { anim, render } from './anim.js';
import { cancel as dragCancel, dragNewPiece } from './drag.js';
import { DrawShape } from './draw.js';
import * as sg from './types.js';

export interface Api {
  // reconfigure the instance. Accepts all config options
  // board will be animated accordingly, if animations are enabled
  set(config: Config): void;

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
  selectPiece(piece: sg.Piece | null, spare?: boolean): void;

  // play the current premove, if any; returns true if premove was played
  playPremove(): boolean;

  // cancel the current premove, if any
  cancelPremove(): void;

  // play the current predrop, if any; returns true if premove was played
  playPredrop(): boolean;

  // cancel the current predrop, if any
  cancelPredrop(): void;

  // cancel the current move being made, premoves and predrops
  cancelMove(): void;

  // cancel current move and prevent further ones
  stop(): void;

  // programmatically draw user shapes
  setShapes(shapes: DrawShape[]): void;

  // programmatically draw auto shapes
  setAutoShapes(shapes: DrawShape[]): void;

  // only useful when CSS changes the board width/height ratio (for ratio change)
  redrawAll: sg.Redraw;

  // for piece dropping and board editors
  dragNewPiece(piece: sg.Piece, event: sg.MouchEvent, spare?: boolean): void;

  // unbinds all events
  // (important for document-wide events like scroll and mousemove)
  destroy: sg.Unbind;
}

// see API types and documentations in api.d.ts
export function start(state: State, redrawAll: sg.Redraw): Api {
  function toggleOrientation(): void {
    board.toggleOrientation(state);
    redrawAll();
  }

  return {
    set(config): void {
      let toRedraw = false;
      if (config.orientation && config.orientation !== state.orientation) {
        board.toggleOrientation(state);
        toRedraw = true;
      }
      if (config.viewOnly !== undefined && config.viewOnly !== state.viewOnly) {
        state.viewOnly = config.viewOnly;
        board.reset(state);
        toRedraw = true;
      }
      if (config.hands?.roles !== undefined && config.hands.roles !== state.hands.roles) {
        state.hands.roles = config.hands.roles;
        toRedraw = true;
      }

      if (toRedraw) redrawAll();
      applyAnimation(state, config);
      (config.sfen?.board ? anim : render)(state => configure(state, config), state);
    },

    state,

    getBoardSfen: () => writeBoard(state.pieces, state.dimensions),

    getHandsSfen: () => writeHands(state.hands.handMap, state.hands.roles),

    toggleOrientation,

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

    selectPiece(piece, spare): void {
      if (piece) render(state => board.selectPiece(state, piece, spare), state);
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

    cancelMove(): void {
      render(state => {
        board.cancelMoveOrDrop(state);
        dragCancel(state);
      }, state);
    },

    stop(): void {
      render(state => {
        board.stop(state);
        dragCancel(state);
      }, state);
    },

    setAutoShapes(shapes: DrawShape[]): void {
      render(state => (state.drawable.autoShapes = shapes), state);
    },

    setShapes(shapes: DrawShape[]): void {
      render(state => (state.drawable.shapes = shapes), state);
    },

    redrawAll,

    dragNewPiece(piece, event, spare): void {
      dragNewPiece(state, piece, event, spare);
    },

    destroy(): void {
      board.stop(state);
      state.dom.unbind && state.dom.unbind();
      state.dom.destroyed = true;
    },
  };
}
