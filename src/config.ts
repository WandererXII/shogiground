import { HeadlessState } from './state.js';
import { setCheck, setSelected, setSelectedPiece } from './board.js';
import { inferDimensions, readBoard as sfenRead, readHands } from './sfen.js';
import { DrawShape, DrawBrushes } from './draw.js';
import * as sg from './types.js';

export interface Config {
  sfen?: {
    board?: sg.BoardSfen; // pieces on the board in Forsyth notation
    hands?: sg.HandsSfen; // pieces in hand in Forsyth notation
  };
  orientation?: sg.Color; // board orientation. sente | gote
  turnColor?: sg.Color; // turn to play. sente | gote
  activeColor?: sg.Color | 'both'; // color that can move or drop. sente | gote | both | undefined
  check?: sg.Color | boolean; // true for current color, false to unset
  lastDests?: sg.Key[]; // squares part of the last move or drop ["3c", "4c"]
  selected?: sg.Key; // square currently selected "1a"
  selectedPiece?: sg.Piece; // piece in hand currently selected
  viewOnly?: boolean; // don't bind events: the user will never be able to move pieces around
  disableContextMenu?: boolean; // because who needs a context menu on a board, only without viewOnly
  blockTouchScroll?: boolean; // block scrolling via touch dragging on the board, e.g. for coordinate training
  scaleDownPieces?: boolean; // helpful for pgns - https://ctidd.com/2015/svg-background-scaling
  coordinates?: {
    enabled?: boolean; // include coords attributes
    notation?: sg.Notation;
  };
  highlight?: {
    lastDests?: boolean; // add last-dest class to squares
    check?: boolean; // add check class to squares
  };
  animation?: {
    enabled?: boolean;
    hands?: boolean;
    duration?: number;
  };
  hands?: {
    inlined?: boolean; // attaches sg-hands directly to sg-wrap, ignores HTMLElements passed to Shogiground
    roles?: sg.Role[]; // roles to render in sg-hand
  };
  spares?: {
    roles?: sg.Role[]; // roles to be rendered in sg-spares
    deleteOnTouch?: boolean; // clicking a piece will remove it
    active?: boolean; // activate spare drop mode - won't remove the piece from hand
  };
  movable?: {
    free?: boolean; // all moves are valid - board editor
    dests?: sg.Dests; // valid moves. {"2a" ["3a" "4a"] "1b" ["3a" "3c"]}
    showDests?: boolean; // whether to add the dest class on squares
    events?: {
      after?: (orig: sg.Key, dest: sg.Key, metadata: sg.MoveMetadata) => void; // called after the move has been played
    };
  };
  droppable?: {
    free?: boolean; // all drops are valid - board editor
    dests?: sg.DropDests; // valid drops. {"pawn" ["3a" "4a"] "lance" ["3a" "3c"]}
    showDests?: boolean; // whether to add the dest class on squares
    events?: {
      after?: (role: sg.Piece, key: sg.Key, metadata: sg.MoveMetadata) => void; // called after the drop has been played
    };
  };
  premovable?: {
    enabled?: boolean; // allow premoves for color that can not move
    showDests?: boolean; // whether to add the pre-dest class on squares
    dests?: sg.Key[]; // premove destinations for the current selection
    events?: {
      set?: (orig: sg.Key, dest: sg.Key) => void; // called after the premove has been set
      unset?: () => void; // called after the premove has been unset
    };
  };
  predroppable?: {
    enabled?: boolean; // allow predrops for color that can not move
    showDests?: boolean; // whether to add the pre-dest class on squares for drops
    dests?: sg.Key[]; // premove destinations for the drop selection
    events?: {
      set?: (piece: sg.Piece, key: sg.Key) => void; // called after the predrop has been set
      unset?: () => void; // called after the predrop has been unset
    };
  };
  draggable?: {
    enabled?: boolean; // allow moves & premoves to use drag'n drop
    distance?: number; // minimum distance to initiate a drag; in pixels
    autoDistance?: boolean; // lets shogiground set distance to zero when user drags pieces
    showGhost?: boolean; // show ghost of piece being dragged
    showTouchSquareOverlay?: boolean; // show square overlay on the square that is currently being hovered, touch only
    deleteOnDropOff?: boolean; // delete a piece when it is dropped off the board
    addToHandOnDropOff?: boolean; // add a piece to hand when it is dropped on it, requires deleteOnDropOff
  };
  selectable?: {
    // disable to enforce dragging over click-click move
    enabled?: boolean;
  };
  events?: {
    change?: () => void; // called after the situation changes on the board
    move?: (orig: sg.Key, dest: sg.Key, capturedPiece?: sg.Piece) => void;
    drop?: (piece: sg.Piece, key: sg.Key) => void;
    select?: (key: sg.Key) => void; // called when a square is selected
    insert?: (elements: sg.Elements) => void; // when the board DOM has been (re)inserted
  };
  drawable?: {
    enabled?: boolean; // can draw
    visible?: boolean; // can view
    eraseOnClick?: boolean;
    shapes?: DrawShape[];
    autoShapes?: DrawShape[];
    brushes?: DrawBrushes;
    pieces?: {
      baseUrl?: string;
    };
    onChange?: (shapes: DrawShape[]) => void; // called after drawable shapes change
  };
  promotion?: {
    active?: boolean;
    key?: sg.Key; // key at which promotion will occur
    pieces?: sg.Piece[]; // piece options
    after?: (piece: sg.Piece) => void; // called after user selects a piece
    cancel?: () => void; // called after user cancels the selection
  };
}

export function applyAnimation(state: HeadlessState, config: Config): void {
  if (config.animation) {
    deepMerge(state.animation, config.animation);
    // no need for such short animations
    if ((state.animation.duration || 0) < 70) state.animation.enabled = false;
  }
}

export function configure(state: HeadlessState, config: Config): void {
  // don't merge destinations and autoShapes. Just override.
  if (config.movable?.dests) state.movable.dests = undefined;
  if (config.droppable?.dests) state.droppable.dests = undefined;
  if (config.drawable?.autoShapes) state.drawable.autoShapes = [];

  deepMerge(state, config);

  // if a sfen was provided, replace the pieces, except the currently dragged one
  if (config.sfen?.board) {
    state.dimensions = inferDimensions(config.sfen.board);
    state.pieces = sfenRead(config.sfen.board, state.dimensions);
    state.drawable.shapes = [];
  }

  if (config.sfen?.hands) {
    state.hands.handMap = readHands(config.sfen.hands);
  }

  // apply config values that could be undefined yet meaningful
  if ('check' in config) setCheck(state, config.check || false);
  if ('lastDests' in config && !config.lastDests) state.lastDests = undefined;
  // in case of drop last move, there's a single square.
  // if the previous last move had two squares,
  // the merge algorithm will incorrectly keep the second square.
  else if (config.lastDests) state.lastDests = config.lastDests;

  // fix move/premove dests
  if (state.selected) setSelected(state, state.selected);
  if (state.selectedPiece) setSelectedPiece(state, state.selectedPiece);

  applyAnimation(state, config);
}

function deepMerge(base: any, extend: any): void {
  for (const key in extend) {
    if (isObject(base[key]) && isObject(extend[key])) deepMerge(base[key], extend[key]);
    else base[key] = extend[key];
  }
}

function isObject(o: unknown): boolean {
  return typeof o === 'object';
}
