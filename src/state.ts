import * as sfen from './sfen';
import { AnimCurrent } from './anim';
import { DragCurrent } from './drag';
import { Drawable } from './draw';
import { timer } from './util';
import * as sg from './types';

export interface HeadlessState {
  variant: sg.Variant;
  pieces: sg.Pieces;
  orientation: sg.Color; // board orientation. sente | gote
  turnColor: sg.Color; // turn to play. sente | gote
  hands: sg.Hands;
  check?: sg.Key; // square currently in check "5a"
  lastMove?: sg.Key[]; // squares part of the last move ["2b"; "8h"]
  selected?: sg.Key; // square currently selected "1a"
  coordinates: boolean; // include coords attributes
  grid: boolean; // include grid svg element
  renderHands: boolean; // include hands elements
  viewOnly: boolean; // don't bind events: the user will never be able to move pieces around
  disableContextMenu: boolean; // because who needs a context menu on a shogi board
  resizable: boolean; // listens to shogiground.resize on document.body to clear bounds cache
  blockTouchScroll: boolean; // block scrolling via touch dragging on the board, e.g. for coordinate training
  highlight: {
    lastMove: boolean; // add last-move class to squares
    check: boolean; // add check class to squares
  };
  animation: {
    enabled: boolean;
    duration: number;
    current?: AnimCurrent;
  };
  movable: {
    free: boolean; // all moves are valid - board editor
    color?: sg.Color | 'both'; // color that can move. sente | gote | both
    dests?: sg.Dests; // valid moves. {"7g" ["7f"] "5i" ["4h" "5h" "6h"]}
    showDests: boolean; // whether to add the move-dest class on squares
    events: {
      after?: (orig: sg.Key, dest: sg.Key, metadata: sg.MoveMetadata) => void; // called after the move has been played
      afterNewPiece?: (role: sg.Role, key: sg.Key, metadata: sg.MoveMetadata) => void; // called after a new piece is dropped on the board
    };
  };
  premovable: {
    enabled: boolean; // allow premoves for color that can not move
    showDests: boolean; // whether to add the premove-dest class on squares
    dests?: sg.Key[]; // premove destinations for the current selection
    current?: sg.KeyPair; // keys of the current saved premove ["5f" "5d"]
    events: {
      set?: (orig: sg.Key, dest: sg.Key, metadata?: sg.SetPremoveMetadata) => void; // called after the premove has been set
      unset?: () => void; // called after the premove has been unset
    };
  };
  predroppable: {
    enabled: boolean; // allow predrops for color that can not move
    showDropDests: boolean; // whether to add the premove-dest class on squares
    dropDests?: sg.Key[]; // premove destinations for the drop selection
    current?: {
      // current saved predrop {role: 'knight'; key: '5e'}
      role: sg.Role;
      key: sg.Key;
    };
    events: {
      set?: (role: sg.Role, key: sg.Key) => void; // called after the predrop has been set
      unset?: () => void; // called after the predrop has been unset
    };
  };
  draggable: {
    enabled: boolean; // allow moves & premoves to use drag'n drop
    distance: number; // minimum distance to initiate a drag; in pixels
    autoDistance: boolean; // lets shogiground set distance to zero when user drags pieces
    showGhost: boolean; // show ghost of piece being dragged
    deleteOnDropOff: boolean; // delete a piece when it is dropped off the board
    lastDropOff?: DragCurrent; // last piece that was dropped off
    current?: DragCurrent;
  };
  dropmode: {
    active: boolean;
    showDropDests: boolean;
    piece?: sg.Piece;
    dropDests?: sg.DropDests;
  };
  selectable: {
    // disable to enforce dragging over click-click move
    enabled: boolean;
  };
  stats: {
    // was last piece dragged or clicked?
    // needs default to false for touch
    dragged: boolean;
    ctrlKey?: boolean;
  };
  events: {
    change?: () => void; // called after the situation changes on the board
    // called after a piece has been moved.
    // capturedPiece is undefined or like {color: 'sente'; 'role': 'lance'}
    move?: (orig: sg.Key, dest: sg.Key, capturedPiece?: sg.Piece) => void;
    dropNewPiece?: (piece: sg.Piece, key: sg.Key) => void;
    select?: (key: sg.Key) => void; // called when a square is selected
    insert?: (elements: sg.Elements) => void; // when the board DOM has been (re)inserted
  };
  drawable: Drawable;
  hold: sg.Timer;
  notation: sg.Notation;
}
export interface State extends HeadlessState {
  dom: sg.Dom;
}

export function defaults(): HeadlessState {
  return {
    variant: 'shogi',
    pieces: sfen.readBoard(sfen.initial, 'shogi'),
    orientation: 'sente',
    turnColor: 'sente',
    hands: new Map(),
    coordinates: true,
    grid: false,
    renderHands: false,
    viewOnly: false,
    disableContextMenu: false,
    resizable: true,
    blockTouchScroll: false,
    highlight: {
      lastMove: true,
      check: true,
    },
    animation: {
      enabled: true,
      duration: 200,
    },
    movable: {
      free: true,
      color: 'both',
      showDests: true,
      events: {},
    },
    premovable: {
      enabled: true,
      showDests: true,
      events: {},
    },
    predroppable: {
      enabled: true,
      showDropDests: true,
      events: {},
    },
    draggable: {
      enabled: true,
      distance: 3,
      autoDistance: true,
      showGhost: true,
      deleteOnDropOff: false,
    },
    dropmode: {
      active: false,
      showDropDests: true,
    },
    selectable: {
      enabled: true,
    },
    stats: {
      // on touchscreen, default to "tap-tap" moves
      // instead of drag
      dragged: !('ontouchstart' in window),
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
    hold: timer(),
    notation: sg.Notation.WESTERN,
  };
}
