import { AnimCurrent } from './anim.js';
import { DragCurrent } from './drag.js';
import { Drawable } from './draw.js';
import * as sfen from './sfen.js';
import * as sg from './types.js';

export interface HeadlessState {
  pieces: sg.Pieces;
  orientation: sg.Color; // board orientation. sente | gote
  dimensions: sg.Dimensions; // board dimensions. at least 1x1 and at most 9x9
  turnColor: sg.Color; // turn to play. sente | gote
  activeColor?: sg.Color | 'both'; // color that can move or drop. sente | gote | both | undefined
  check?: sg.Key; // square currently in check "5a"
  lastDests?: sg.Key[]; // squares part of the last move or drop ["2b"; "8h"]
  selected?: sg.Key; // square currently selected "1a"
  selectedPiece?: sg.Piece; // piece in hand currently selected
  viewOnly: boolean; // don't bind events: the user will never be able to move pieces around
  disableContextMenu: boolean; // because who needs a context menu on a shogi board
  blockTouchScroll: boolean; // block scrolling via touch dragging on the board, e.g. for coordinate training
  scaleDownPieces: boolean;
  coordinates: {
    enabled: boolean; // include coords attributes
    notation: sg.Notation;
  };
  highlight: {
    lastDests: boolean; // add last-dest class to squares
    check: boolean; // add check class to squares
  };
  animation: {
    enabled: boolean;
    hands: boolean;
    duration: number;
    current?: AnimCurrent;
  };
  hands: {
    inlined: boolean; // attaches sg-hands directly to sg-wrap, ignores HTMLElements passed to Shogiground
    handMap: sg.Hands;
    roles: sg.Role[]; // roles to render in sg-hand
  };
  movable: {
    free: boolean; // all moves are valid - board editor
    dests?: sg.Dests; // valid moves. {"7g" ["7f"] "5i" ["4h" "5h" "6h"]}
    showDests: boolean; // whether to add the dest class on squares
    events: {
      after?: (orig: sg.Key, dest: sg.Key, metadata: sg.MoveMetadata) => void; // called after the move has been played
    };
  };
  droppable: {
    free: boolean; // all drops are valid - board editor
    dests?: sg.DropDests; // valid drops. {"pawn" ["3a" "4a"] "lance" ["3a" "3c"]}
    showDests: boolean; // whether to add the dest class on squares
    spare: boolean; // whether to remove dropped piece from hand after drop - board editor
    events: {
      after?: (role: sg.Piece, key: sg.Key, metadata: sg.MoveMetadata) => void; // called after the drop has been played
    };
  };
  premovable: {
    enabled: boolean; // allow premoves for color that can not move
    showDests: boolean; // whether to add the pre-dest class on squares
    dests?: sg.Key[]; // premove destinations for the current selection
    current?: sg.KeyPair; // keys of the current saved premove ["5f" "5d"]
    events: {
      set?: (orig: sg.Key, dest: sg.Key) => void; // called after the premove has been set
      unset?: () => void; // called after the premove has been unset
    };
  };
  predroppable: {
    enabled: boolean; // allow predrops for color that can not move
    showDests: boolean; // whether to add the pre-dest class on squares
    dests?: sg.Key[]; // premove destinations for the drop selection
    current?: {
      piece: sg.Piece;
      key: sg.Key;
    };
    events: {
      set?: (role: sg.Piece, key: sg.Key) => void; // called after the predrop has been set
      unset?: () => void; // called after the predrop has been unset
    };
  };
  draggable: {
    enabled: boolean; // allow moves & premoves to use drag'n drop
    distance: number; // minimum distance to initiate a drag; in pixels
    autoDistance: boolean; // lets shogiground set distance to zero when user drags pieces
    showGhost: boolean; // show ghost of piece being dragged
    showTouchSquareOverlay: boolean; // show square overlay on the square that is currently being hovered, touch only
    deleteOnDropOff: boolean; // delete a piece when it is dropped off the board - board editor
    addToHandOnDropOff: boolean; // add a piece to hand when it is dropped on it, requires deleteOnDropOff - board editor
    current?: DragCurrent;
  };
  selectable: {
    enabled: boolean; // disable to enforce dragging over click-click move
    deleteOnTouch: boolean; // selecting a piece on the board or in hand will remove it - board editor
  };
  promotion: {
    active: boolean;
    key?: sg.Key; // key at which promotion will occur
    pieces?: sg.Piece[]; // piece options
    after?: (piece: sg.Piece) => void; // called after user selects a piece
    cancel?: () => void; // called after user cancels the selection
  };
  events: {
    change?: () => void; // called after the situation changes on the board
    move?: (orig: sg.Key, dest: sg.Key, capturedPiece?: sg.Piece) => void;
    drop?: (piece: sg.Piece, key: sg.Key) => void;
    select?: (key: sg.Key) => void; // called when a square is selected
    pieceSelect?: (piece: sg.Piece) => void; // called when a piece in hand is selected
    insert?: (boardElements: sg.DomBoardElements, handElements: sg.DomHandsElements) => void; // when the board (and hands) DOM has been (re)inserted
  };
  drawable: Drawable;
}
export interface State extends HeadlessState {
  dom: sg.Dom;
}

export function defaults(): HeadlessState {
  return {
    pieces: sfen.readBoard('lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL', { files: 9, ranks: 9 }),
    dimensions: { files: 9, ranks: 9 },
    orientation: 'sente',
    turnColor: 'sente',
    activeColor: 'both',
    viewOnly: false,
    disableContextMenu: false,
    blockTouchScroll: false,
    scaleDownPieces: true,
    coordinates: {
      enabled: true,
      notation: sg.Notation.WESTERN,
    },
    highlight: {
      lastDests: true,
      check: true,
    },
    animation: {
      enabled: true,
      hands: true,
      duration: 250,
    },
    hands: {
      inlined: false,
      handMap: new Map(),
      roles: ['rook', 'bishop', 'gold', 'silver', 'knight', 'lance', 'pawn'],
    },
    movable: {
      free: true,
      showDests: true,
      events: {},
    },
    droppable: {
      free: true,
      showDests: true,
      spare: false,
      events: {},
    },
    premovable: {
      enabled: true,
      showDests: true,
      events: {},
    },
    predroppable: {
      enabled: true,
      showDests: true,
      events: {},
    },
    draggable: {
      enabled: true,
      distance: 3,
      autoDistance: true,
      showGhost: true,
      showTouchSquareOverlay: true,
      deleteOnDropOff: false,
      addToHandOnDropOff: false,
    },
    selectable: {
      enabled: true,
      deleteOnTouch: false,
    },
    promotion: {
      active: false,
    },
    events: {},
    drawable: {
      enabled: true, // can draw
      visible: true, // can view
      eraseOnClick: true,
      shapes: [],
      autoShapes: [],
      brushes: {
        green: { key: 'g', color: '#15781B', opacity: 1, lineWidth: 10 },
        red: { key: 'r', color: '#882020', opacity: 1, lineWidth: 10 },
        blue: { key: 'b', color: '#003088', opacity: 1, lineWidth: 10 },
        yellow: { key: 'y', color: '#e68f00', opacity: 1, lineWidth: 10 },
        paleBlue: { key: 'pb', color: '#003088', opacity: 0.4, lineWidth: 15 },
        paleGreen: { key: 'pg', color: '#15781B', opacity: 0.4, lineWidth: 15 },
        paleRed: { key: 'pr', color: '#882020', opacity: 0.4, lineWidth: 15 },
        paleGrey: {
          key: 'pgr',
          color: '#4a4a4a',
          opacity: 0.35,
          lineWidth: 15,
        },
      },
      prevSvgHash: '',
    },
  };
}
