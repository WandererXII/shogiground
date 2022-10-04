import type { HeadlessState } from './state.js';
import type { DrawShape, SquareHighlight } from './draw.js';
import * as sg from './types.js';
import { setPreDests } from './board.js';
import { inferDimensions, sfenToBoard, sfenToHands } from './sfen.js';

export interface Config {
  sfen?: {
    board?: sg.BoardSfen; // pieces on the board in Forsyth notation
    hands?: sg.HandsSfen; // pieces in hand in Forsyth notation
  };
  orientation?: sg.Color; // board orientation. sente | gote
  turnColor?: sg.Color; // turn to play. sente | gote
  activeColor?: sg.Color | 'both'; // color that can move or drop. sente | gote | both | undefined
  checks?: sg.Key[]; // squares currently in check ["5a"]
  lastDests?: sg.Key[]; // squares part of the last move or drop ["3c", "4c"]
  selected?: sg.Key; // square currently selected "1a"
  selectedPiece?: sg.Piece; // piece in hand currently selected
  hovered?: sg.Key; // square currently being hovered
  viewOnly?: boolean; // don't bind events: the user will never be able to move pieces around
  squareRatio?: sg.NumberPair; // ratio of a single square [width, height]
  disableContextMenu?: boolean; // because who needs a context menu on a board, only without viewOnly
  blockTouchScroll?: boolean; // block scrolling via touch dragging on the board, e.g. for coordinate training
  scaleDownPieces?: boolean; // helpful for pngs - https://ctidd.com/2015/svg-background-scaling
  coordinates?: {
    enabled?: boolean; // include coords attributes
    files?: sg.Notation;
    ranks?: sg.Notation;
  };
  highlight?: {
    lastDests?: boolean; // add last-dest class to squares
    check?: boolean; // add check class to squares
    hovered?: boolean; // add hover class to hovered squares
  };
  animation?: {
    enabled?: boolean;
    hands?: boolean;
    duration?: number;
  };
  hands?: {
    inlined?: boolean; // attaches sg-hands directly to sg-wrap, ignores HTMLElements passed to Shogiground
    roles?: sg.RoleString[]; // roles to render in sg-hand
  };
  movable?: {
    free?: boolean; // all moves are valid - board editor
    dests?: sg.Dests; // valid moves. {"2a" ["3a" "4a"] "1b" ["3a" "3c"]}
    showDests?: boolean; // whether to add the dest class on squares
    events?: {
      after?: (orig: sg.Key, dest: sg.Key, prom: boolean, metadata: sg.MoveMetadata) => void; // called after the move has been played
    };
  };
  droppable?: {
    free?: boolean; // all drops are valid - board editor
    dests?: sg.DropDests; // valid drops. {"sente pawn" ["3a" "4a"] "sente lance" ["3a" "3c"]}
    showDests?: boolean; // whether to add the dest class on squares
    spare?: boolean; // whether to remove dropped piece from hand after drop - board editor
    events?: {
      after?: (role: sg.Piece, key: sg.Key, prom: boolean, metadata: sg.MoveMetadata) => void; // called after the drop has been played
    };
  };
  premovable?: {
    enabled?: boolean; // allow premoves for color that can not move
    showDests?: boolean; // whether to add the pre-dest class on squares
    dests?: sg.Key[]; // premove destinations for the current selection
    generate?: (key: sg.Key, pieces: sg.Pieces) => sg.Key[]; // function to generate destinations that user can premove to
    events?: {
      set?: (orig: sg.Key, dest: sg.Key, prom: boolean) => void; // called after the premove has been set
      unset?: () => void; // called after the premove has been unset
    };
  };
  predroppable?: {
    enabled?: boolean; // allow predrops for color that can not move
    showDests?: boolean; // whether to add the pre-dest class on squares for drops
    dests?: sg.Key[]; // premove destinations for the drop selection
    generate?: (piece: sg.Piece, pieces: sg.Pieces) => sg.Key[]; // function to generate destinations that user can predrop on
    events?: {
      set?: (piece: sg.Piece, key: sg.Key, prom: boolean) => void; // called after the predrop has been set
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
    enabled?: boolean; // disable to enforce dragging over click-click move
    deleteOnTouch?: boolean; // selecting a piece on the board or in hand will remove it - board editor
  };
  events?: {
    change?: () => void; // called after the situation changes on the board
    move?: (orig: sg.Key, dest: sg.Key, prom: boolean, capturedPiece?: sg.Piece) => void;
    drop?: (piece: sg.Piece, key: sg.Key, prom: boolean) => void;
    select?: (key: sg.Key) => void; // called when a square is selected
    unselect?: (key: sg.Key) => void; // called when a selected square is directly unselected - dropped back or clicked on the original square
    pieceSelect?: (piece: sg.Piece) => void; // called when a piece in hand is selected
    pieceUnselect?: (piece: sg.Piece) => void; // called when a selected piece is directly unselected - dropped back or clicked on the same piece
    insert?: (boardElements?: sg.BoardElements, handElements?: sg.HandElements) => void; // when the board/hands DOM has been (re)inserted
  };
  drawable?: {
    enabled?: boolean; // can draw
    visible?: boolean; // can view
    eraseOnClick?: boolean;
    shapes?: DrawShape[];
    autoShapes?: DrawShape[];
    squares?: SquareHighlight[];
    onChange?: (shapes: DrawShape[]) => void; // called after drawable shapes change
  };
  forsyth?: {
    toForsyth?: (role: sg.RoleString) => string | undefined;
    fromForsyth?: (str: string) => sg.RoleString | undefined;
  };
  promotion?: {
    promotesTo?: (role: sg.RoleString) => sg.RoleString | undefined;
    movePromotionDialog?: (orig: sg.Key, dest: sg.Key) => boolean; // activate promotion dialog
    forceMovePromotion?: (orig: sg.Key, dest: sg.Key) => boolean; // auto promote after move
    dropPromotionDialog?: (piece: sg.Piece, key: sg.Key) => boolean; // activate promotion dialog
    forceDropPromotion?: (piece: sg.Piece, key: sg.Key) => boolean; // auto promote after drop
    events?: {
      initiated?: () => void; // called when promotion dialog is started
      after?: (piece: sg.Piece) => void; // called after user selects a piece
      cancel?: () => void; // called after user cancels the selection
    };
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
  // don't merge, just override.
  if (config.movable?.dests) state.movable.dests = undefined;
  if (config.droppable?.dests) state.droppable.dests = undefined;
  if (config.drawable?.shapes) state.drawable.shapes = [];
  if (config.drawable?.autoShapes) state.drawable.autoShapes = [];
  if (config.drawable?.squares) state.drawable.squares = [];
  if (config.hands?.roles) state.hands.roles = [];

  deepMerge(state, config);

  // if a sfen was provided, replace the pieces, except the currently dragged one
  if (config.sfen?.board) {
    state.dimensions = inferDimensions(config.sfen.board);
    state.pieces = sfenToBoard(config.sfen.board, state.dimensions, state.forsyth.fromForsyth);
    state.drawable.shapes = config.drawable?.shapes || [];
  }

  if (config.sfen?.hands) {
    state.hands.handMap = sfenToHands(config.sfen.hands, state.forsyth.fromForsyth);
  }

  // apply config values that could be undefined yet meaningful
  if ('lastDests' in config && !config.lastDests) state.lastDests = undefined;
  // in case of drop last move, there's a single square.
  // if the previous last move had two squares,
  // the merge algorithm will incorrectly keep the second square.
  else if (config.lastDests) state.lastDests = config.lastDests;

  // fix move/premove dests
  setPreDests(state);

  applyAnimation(state, config);
}

function deepMerge(base: any, extend: any): void {
  for (const key in extend) {
    if (Object.prototype.hasOwnProperty.call(extend, key)) {
      if (Object.prototype.hasOwnProperty.call(base, key) && isPlainObject(base[key]) && isPlainObject(extend[key]))
        deepMerge(base[key], extend[key]);
      else base[key] = extend[key];
    }
  }
}

function isPlainObject(o: unknown): boolean {
  if (typeof o !== 'object' || o === null) return false;
  const proto = Object.getPrototypeOf(o);
  return proto === Object.prototype || proto === null;
}
