import { State } from './state'
import { setCheck, setSelected } from './board'
import { read as fenRead } from './fen'
import { DrawShape, DrawBrush } from './draw'
import * as cg from './types'

export interface Config {
  fen?: cg.FEN; // chess position in Forsyth notation
  orientation?: cg.Color; // board orientation. white | black
  turnColor?: cg.Color; // turn to play. white | black
  check?: cg.Color | boolean; // true for current color, false to unset
  lastMove?: cg.Key[]; // squares part of the last move ["c3", "c4"]
  selected?: cg.Key; // square currently selected "a1"
  coordinates?: boolean; // include coords attributes
  autoCastle?: boolean; // immediately complete the castle by moving the rook after king move
  viewOnly?: boolean; // don't bind events: the user will never be able to move pieces around
  disableContextMenu?: boolean; // because who needs a context menu on a chessboard
  resizable?: boolean; // listens to chessground.resize on document.body to clear bounds cache
  addPieceZIndex?: boolean; // adds z-index values to pieces (for 3D)
  // pieceKey: boolean; // add a data-key attribute to piece elements
  highlight?: {
    lastMove?: boolean; // add last-move class to squares
    check?: boolean; // add check class to squares
  };
  animation?: {
    enabled?: boolean;
    duration?: number;
  };
  movable?: {
    free?: boolean; // all moves are valid - board editor
    color?: cg.Color | 'both'; // color that can move. white | black | both | undefined
    dests?: {
      [key: string]: cg.Key[]
    }; // valid moves. {"a2" ["a3" "a4"] "b1" ["a3" "c3"]}
    dropOff?: 'revert' | 'trash'; // when a piece is dropped outside the board. "revert" | "trash"
    showDests?: boolean; // whether to add the move-dest class on squares
    events?: {
      after?: (orig: cg.Key, dest: cg.Key, metadata: cg.MoveMetadata) => void; // called after the move has been played
      afterNewPiece?: (role: cg.Role, pos: cg.Pos) => void; // called after a new piece is dropped on the board
    };
    rookCastle?: boolean // castle by moving the king to the rook
  };
  premovable?: {
    enabled?: boolean; // allow premoves for color that can not move
    showDests?: boolean; // whether to add the premove-dest class on squares
    castle?: boolean; // whether to allow king castle premoves
    dests?: cg.Key[]; // premove destinations for the current selection
    events?: {
      set?: (orig: cg.Key, dest: cg.Key) => void; // called after the premove has been set
      unset?: () => void;  // called after the premove has been unset
    }
  };
  predroppable?: {
    enabled?: boolean; // allow predrops for color that can not move
    events?: {
      set?: (role: cg.Role, key: cg.Key) => void; // called after the predrop has been set
      unset?: () => void; // called after the predrop has been unset
    }
  };
  draggable?: {
    enabled?: boolean; // allow moves & premoves to use drag'n drop
    distance?: number; // minimum distance to initiate a drag; in pixels
    autoDistance?: boolean; // lets chessground set distance to zero when user drags pieces
    centerPiece?: boolean; // center the piece on cursor at drag start
    showGhost?: boolean; // show ghost of piece being dragged
  };
  selectable?: {
    // disable to enforce dragging over click-click move
    enabled?: boolean
  };
  events?: {
    change?: () => void; // called after the situation changes on the board
    // called after a piece has been moved.
    // capturedPiece is undefined or like {color: 'white'; 'role': 'queen'}
    move?: (orig: cg.Key, dest: cg.Key, capturedPiece?: cg.Piece) => void;
    dropNewPiece?: (role: cg.Role, pos: cg.Pos) => void;
    select?: (key: cg.Key) => void // called when a square is selected
  };
  items?: (pos: cg.Pos, key: cg.Key) => any | undefined; // items on the board { render: key -> vdom }
  drawable?: {
    enabled?: boolean;
    eraseOnClick?: boolean;
    shapes?: DrawShape[];
    autoShapes?: DrawShape[];
    brushes?: DrawBrush[];
    pieces?: {
      baseUrl?: string;
    }
  },
  editable?: {
    enabled?: boolean;
    selected?: cg.Piece | 'pointer' | 'trash';
  }
}

export function configure(state: State, config: Config) {

  // don't merge destinations. Just override.
  if (config.movable && config.movable.dests) state.movable.dests = undefined;

  let configCheck: cg.Color | boolean | undefined = config.check;

  delete config.check;

  merge(state, config);

  // if a fen was provided, replace the pieces
  if (config.fen) {
    state.pieces = fenRead(config.fen);
    state.drawable.shapes = [];
  }

  if (configCheck !== undefined) setCheck(state, configCheck);

  // fix move/premove dests
  if (state.selected) setSelected(state, state.selected);

  // no need for such short animations
  if (!state.animation.duration || state.animation.duration < 40) state.animation.enabled = false;

  if (!state.movable.rookCastle && state.movable.dests) {
    const rank = state.movable.color === 'white' ? 1 : 8;
    const kingStartPos = 'e' + rank;
    const dests = state.movable.dests[kingStartPos];
    if (!dests || state.pieces[kingStartPos].role !== 'king') return;
    state.movable.dests[kingStartPos] = dests.filter(d => {
      if ((d === 'a' + rank) && dests.indexOf('c' + rank as cg.Key) !== -1) return false;
      if ((d === 'h' + rank) && dests.indexOf('g' + rank as cg.Key) !== -1) return false;
      return true;
    });
  }
};

function merge(base: any, extend: any) {
  for (var key in extend) {
    if (isObject(base[key]) && isObject(extend[key])) merge(base[key], extend[key]);
    else base[key] = extend[key];
  }
}

function isObject(o: any): boolean {
  return typeof o === 'object';
}