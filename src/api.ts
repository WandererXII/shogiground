import { State } from './state';
import * as board from './board';
import { writeBoard as sfenWrite } from './sfen';
import { Config, configure } from './config';
import { anim, render } from './anim';
import { cancel as dragCancel, dragNewPiece } from './drag';
import { DrawShape } from './draw';
import { dimensions } from './util';
import * as sg from './types';

export interface Api {
  // reconfigure the instance. Accepts all config options, except for viewOnly & drawable.visible.
  // board will be animated accordingly, if animations are enabled.
  set(config: Config): void;

  // read shogiground state; write at your own risks.
  state: State;

  // get the position as a Sfen string of board
  getSfen(): sg.BoardSfen;

  // change the view angle
  toggleOrientation(): void;

  // perform a move programmatically
  move(orig: sg.Key, dest: sg.Key): void;

  // add and/or remove arbitrary pieces on the board
  setPieces(pieces: sg.PiecesDiff): void;

  // click a square programmatically
  selectSquare(key: sg.Key | null, force?: boolean): void;

  // put a new piece on the board
  newPiece(piece: sg.Piece, key: sg.Key): void;

  // play the current premove, if any; returns true if premove was played
  playPremove(): boolean;

  // cancel the current premove, if any
  cancelPremove(): void;

  // play the current predrop, if any; returns true if premove was played
  playPredrop(): boolean;

  // cancel the current predrop, if any
  cancelPredrop(): void;

  // cancel the current move being made
  cancelMove(): void;

  // cancel current move and prevent further ones
  stop(): void;

  // programmatically draw user shapes
  setShapes(shapes: DrawShape[]): void;

  // programmatically draw auto shapes
  setAutoShapes(shapes: DrawShape[]): void;

  // square name at this DOM position (like "e4")
  getKeyAtDomPos(pos: sg.NumberPair): sg.Key | undefined;

  // only useful when CSS changes the board width/height ratio (for ratio change)
  redrawAll: sg.Redraw;

  // for piece dropping and board editors
  dragNewPiece(piece: sg.Piece, event: sg.MouchEvent, force?: boolean): void;

  // unbinds all events
  // (important for document-wide events like scroll and mousemove)
  destroy: sg.Unbind;
}

// see API types and documentations in dts/api.d.ts
export function start(state: State, redrawAll: sg.Redraw): Api {
  function toggleOrientation(): void {
    board.toggleOrientation(state);
    redrawAll();
  }

  return {
    set(config): void {
      if (config.orientation && config.orientation !== state.orientation) toggleOrientation();
      (config.sfen ? anim : render)(state => configure(state, config), state);
    },

    state,

    // todo - getBoardSfen, getHandsSfen
    getSfen: () => sfenWrite(state.pieces),

    toggleOrientation,

    setPieces(pieces): void {
      anim(state => board.setPieces(state, pieces), state);
    },

    selectSquare(key, force): void {
      if (key) anim(state => board.selectSquare(state, key, force), state);
      else if (state.selected) {
        board.unselect(state);
        state.dom.redraw();
      }
    },

    move(orig, dest): void {
      anim(state => board.baseMove(state, orig, dest), state);
    },

    newPiece(piece, key): void {
      anim(state => board.baseNewPiece(state, piece, key), state);
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
        const result = board.playPredrop(state);
        state.dom.redraw();
        return result;
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
        board.cancelMove(state);
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

    getKeyAtDomPos(pos): sg.Key | undefined {
      return board.getKeyAtDomPos(pos, board.sentePov(state), dimensions(state.variant), state.dom.bounds());
    },

    redrawAll,

    dragNewPiece(piece, event, force): void {
      dragNewPiece(state, piece, event, force);
    },

    destroy(): void {
      board.stop(state);
      state.dom.unbind && state.dom.unbind();
      state.dom.destroyed = true;
    },
  };
}
