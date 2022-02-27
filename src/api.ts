import { State } from './state.js';
import * as board from './board.js';
import { writeBoard, writeHands } from './sfen.js';
import { applyAnimation, Config, configure } from './config.js';
import { anim, render } from './anim.js';
import { cancel as dragCancel, dragNewPiece } from './drag.js';
import { DrawShape } from './draw.js';
import * as sg from './types.js';
import { cancelPromotion, setPromotion } from './promotion.js';

export interface Api {
  // reconfigure the instance. Accepts all config options, except for viewOnly & drawable.visible.
  // board will be animated accordingly, if animations are enabled.
  set(config: Config): void;

  // read shogiground state; write at your own risks.
  state: State;

  // get the position on the board in Forsyth notation
  getBoardSfen(): sg.BoardSfen;

  // get the pieces in hand in Forsyth notation
  getHandsSfen(): sg.HandsSfen;

  // change the view angle
  toggleOrientation(): void;

  // perform a move programmatically
  move(orig: sg.Key, dest: sg.Key): void;

  // perform a drop programmatically
  drop(piece: sg.Piece, key: sg.Key): void;

  // add and/or remove arbitrary pieces on the board
  setPieces(pieces: sg.PiecesDiff): void;

  // add piece.role to hand of piece.color
  addToHand(piece: sg.Piece, count?: number): void;

  // remove piece.role from hand of piece.color
  removeFromHand(piece: sg.Piece, count?: number): void;

  // places pieces on separate layer, selected piece will be placed on key
  startPromotion(key: sg.Key, pieces: sg.Piece[]): void;

  // stops the current promotion, if promotion is active
  stopPromotion(): void;

  // click a square programmatically
  selectSquare(key: sg.Key | null, force?: boolean): void;

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

  // square name at this DOM position (like "e4")
  getKeyAtDomPos(pos: sg.NumberPair): sg.Key | undefined;

  // only useful when CSS changes the board width/height ratio (for ratio change)
  redrawAll: sg.Redraw;

  // for piece dropping and board editors
  dragNewPiece(piece: sg.Piece, event: sg.MouchEvent, hand: boolean, force: boolean): void;

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
      applyAnimation(state, config);
      (config.sfen ? anim : render)(state => configure(state, config), state);
    },

    state,

    getBoardSfen: () => writeBoard(state.pieces, state.dimensions),

    getHandsSfen: () => writeHands(state.hands.handMap, state.hands.handRoles),

    toggleOrientation,

    move(orig, dest): void {
      anim(state => board.baseMove(state, orig, dest), state);
    },

    drop(piece, key): void {
      anim(state => board.baseDrop(state, piece, key), state);
    },

    setPieces(pieces): void {
      anim(state => board.setPieces(state, pieces), state);
    },

    addToHand(piece: sg.Piece, count: number): void {
      render(state => board.addToHand(state, piece, count), state);
    },

    removeFromHand(piece: sg.Piece, count: number): void {
      render(state => board.removeFromHand(state, piece, count), state);
    },

    startPromotion(key: sg.Key, pieces: sg.Piece[]): void {
      render(state => setPromotion(state, key, pieces), state);
    },

    stopPromotion(): void {
      render(state => cancelPromotion(state), state);
    },

    selectSquare(key, force): void {
      if (key) anim(state => board.selectSquare(state, key, force), state);
      else if (state.selected) {
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

    getKeyAtDomPos(pos): sg.Key | undefined {
      return board.getKeyAtDomPos(pos, board.sentePov(state), state.dimensions, state.dom.bounds());
    },

    redrawAll,

    dragNewPiece(piece, event, hand, force): void {
      dragNewPiece(state, piece, event, hand, force);
    },

    destroy(): void {
      board.stop(state);
      state.dom.unbind && state.dom.unbind();
      state.dom.destroyed = true;
    },
  };
}
