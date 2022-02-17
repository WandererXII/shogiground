import { HeadlessState } from './state';
import { setCheck, setSelected } from './board';
import { inferDimensions, readBoard as sfenRead, readHands } from './sfen';
import { DrawShape, DrawBrushes } from './draw';
import * as sg from './types';

export interface Config {
  sfen?: {
    board?: sg.BoardSfen; // pieces on the board in Forsyth notation
    hands?: sg.HandsSfen; // pieces in hand in Forsyth notation
  };
  orientation?: sg.Color; // board orientation. sente | gote
  turnColor?: sg.Color; // turn to play. sente | gote
  activeColor?: sg.Color | 'both'; // color that can move or drop. sente | gote | both | undefined
  check?: sg.Color | boolean; // true for current color, false to unset
  lastMove?: sg.Key[]; // squares part of the last move ["3c", "4c"]
  selected?: sg.Key; // square currently selected "1a"
  grid?: boolean; // include grid svg element
  renderHands?: boolean; // include hands elements
  viewOnly?: boolean; // don't bind events: the user will never be able to move pieces around
  disableContextMenu?: boolean; // because who needs a context menu on a board
  blockTouchScroll?: boolean; // block scrolling via touch dragging on the board, e.g. for coordinate training
  resizable?: boolean; // listens to shogiground.resize on document.body to clear bounds cache
  coordinates?: {
    enabled?: boolean; // include coords attributes
    notation?: sg.Notation;
  };
  highlight?: {
    lastMove?: boolean; // add last-move class to squares
    check?: boolean; // add check class to squares
  };
  animation?: {
    enabled?: boolean;
    duration?: number;
  };
  hands?: {
    enabled?: boolean; // true if shogiground should render sg-hand, bind events to it and manage it
    handRoles?: sg.Role[]; // roles to render in sg-hand
    captureProcessing?: (role: sg.Role) => sg.Role | undefined; // what to do with captured role, before storing it in hand, e.g. unpromoting
  };
  movable?: {
    free?: boolean; // all moves are valid - board editor
    dests?: sg.Dests; // valid moves. {"2a" ["3a" "4a"] "1b" ["3a" "3c"]}
    showDests?: boolean; // whether to add the move-dest class on squares
    events?: {
      after?: (orig: sg.Key, dest: sg.Key, metadata: sg.MoveMetadata) => void; // called after the move has been played
    };
  };
  droppable?: {
    free?: boolean; // all drops are valid - board editor
    dests?: sg.DropDests; // valid drops. {"pawn" ["3a" "4a"] "lance" ["3a" "3c"]}
    showDests?: boolean; // whether to add the move-dest class on squares
    events?: {
      after?: (role: sg.Piece, key: sg.Key, metadata: sg.MoveMetadata) => void; // called after the drop has been played
    };
  };
  premovable?: {
    enabled?: boolean; // allow premoves for color that can not move
    showDests?: boolean; // whether to add the premove-dest class on squares
    dests?: sg.Key[]; // premove destinations for the current selection
    events?: {
      set?: (orig: sg.Key, dest: sg.Key, metadata?: sg.SetPremoveMetadata) => void; // called after the premove has been set
      unset?: () => void; // called after the premove has been unset
    };
  };
  predroppable?: {
    enabled?: boolean; // allow predrops for color that can not move
    showDropDests?: boolean; // whether to add the premove-dest class on squares for drops
    dropDests?: sg.Key[]; // premove destinations for the drop selection
    events?: {
      set?: (role: sg.Role, key: sg.Key) => void; // called after the predrop has been set
      unset?: () => void; // called after the predrop has been unset
    };
  };
  draggable?: {
    enabled?: boolean; // allow moves & premoves to use drag'n drop
    distance?: number; // minimum distance to initiate a drag; in pixels
    autoDistance?: boolean; // lets shogiground set distance to zero when user drags pieces
    showGhost?: boolean; // show ghost of piece being dragged
    deleteOnDropOff?: boolean; // delete a piece when it is dropped off the board
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
  dropmode?: {
    active?: boolean;
    piece?: sg.Piece;
    fromHand?: boolean; // deactivates dropmode after the drop and removes piece from hand if allowed
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
}

export function configure(state: HeadlessState, config: Config): void {
  // don't merge destinations and autoShapes. Just override.
  if (config.movable?.dests) state.movable.dests = undefined;
  if (config.droppable?.dests) state.droppable.dests = undefined;
  if (config.drawable?.autoShapes) state.drawable.autoShapes = [];

  merge(state, config);

  // if a sfen was provided, replace the pieces
  if (config.sfen?.board) {
    state.dimensions = inferDimensions(config.sfen.board);
    const pieceToDrop = state.pieces.get('00');
    state.pieces = sfenRead(config.sfen.board, state.dimensions);
    if (pieceToDrop) state.pieces.set('00', pieceToDrop);
    state.drawable.shapes = [];
  }

  if (config.sfen?.hands) {
    state.hands.handMap = readHands(config.sfen.hands);
  }

  // apply config values that could be undefined yet meaningful
  if ('check' in config) setCheck(state, config.check || false);
  if ('lastMove' in config && !config.lastMove) state.lastMove = undefined;
  // in case of drop last move, there's a single square.
  // if the previous last move had two squares,
  // the merge algorithm will incorrectly keep the second square.
  else if (config.lastMove) state.lastMove = config.lastMove;

  // fix move/premove dests
  if (state.selected) setSelected(state, state.selected);

  // no need for such short animations
  if (!state.animation.duration || state.animation.duration < 100) state.animation.enabled = false;
}

function merge(base: any, extend: any): void {
  for (const key in extend) {
    if (isObject(base[key]) && isObject(extend[key])) merge(base[key], extend[key]);
    else base[key] = extend[key];
  }
}

function isObject(o: unknown): boolean {
  return typeof o === 'object';
}
