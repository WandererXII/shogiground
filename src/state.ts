import type { AnimCurrent } from './anim.js';
import type { DragCurrent } from './drag.js';
import type { Drawable } from './draw.js';
import * as sg from './types.js';

export interface HeadlessState {
  pieces: sg.Pieces;
  orientation: sg.Color; // board orientation. sente | gote
  dimensions: sg.Dimensions; // board dimensions - max 16x16
  turnColor: sg.Color; // turn to play. sente | gote
  activeColor?: sg.Color | 'both'; // color that can move or drop. sente | gote | both | undefined
  checks?: sg.Key[]; // squares currently in check ["5a"]
  lastDests?: sg.Key[]; // squares part of the last move or drop ["2b"; "8h"]
  selected?: sg.Key; // square currently selected "1a"
  selectedPiece?: sg.Piece; // piece in hand currently selected
  hovered?: sg.Key; // square currently being hovered
  viewOnly: boolean; // don't bind events: the user will never be able to move pieces around
  squareRatio: sg.NumberPair; // ratio of the board [width, height]
  disableContextMenu: boolean; // because who needs a context menu on a shogi board
  blockTouchScroll: boolean; // block scrolling via touch dragging on the board, e.g. for coordinate training
  scaleDownPieces: boolean;
  coordinates: {
    enabled: boolean; // include coords attributes
    files: sg.Notation;
    ranks: sg.Notation;
  };
  highlight: {
    lastDests: boolean; // add last-dest class to squares
    check: boolean; // add check class to squares
    checkRoles: sg.RoleString[]; // roles to be highlighted when check is boolean is passed from config
    hovered: boolean; // add hover class to hovered squares
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
    roles: sg.RoleString[]; // roles to render in sg-hand
  };
  movable: {
    free: boolean; // all moves are valid - board editor
    dests?: sg.MoveDests; // valid moves. {"7g" ["7f"] "5i" ["4h" "5h" "6h"]}
    showDests: boolean; // whether to add the dest class on squares
    events: {
      after?: (orig: sg.Key, dest: sg.Key, prom: boolean, metadata: sg.MoveMetadata) => void; // called after the move has been played
    };
  };
  droppable: {
    free: boolean; // all drops are valid - board editor
    dests?: sg.DropDests; // valid drops. {"sente pawn" ["3a" "4a"] "sente lance" ["3a" "3c"]}
    showDests: boolean; // whether to add the dest class on squares
    spare: boolean; // whether to remove dropped piece from hand after drop - board editor
    events: {
      after?: (role: sg.Piece, key: sg.Key, prom: boolean, metadata: sg.MoveMetadata) => void; // called after the drop has been played
    };
  };
  premovable: {
    enabled: boolean; // allow premoves for color that can not move
    showDests: boolean; // whether to add the pre-dest class on squares
    dests?: sg.Key[]; // premove destinations for the current selection
    current?: {
      orig: sg.Key;
      dest: sg.Key;
      prom: boolean;
    };
    generate?: (key: sg.Key, pieces: sg.Pieces) => sg.Key[];
    events: {
      set?: (orig: sg.Key, dest: sg.Key, prom: boolean) => void; // called after the premove has been set
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
      prom: boolean;
    };
    generate?: (piece: sg.Piece, pieces: sg.Pieces) => sg.Key[];
    events: {
      set?: (piece: sg.Piece, key: sg.Key, prom: boolean) => void; // called after the predrop has been set
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
    promotesTo: (role: sg.RoleString) => sg.RoleString | undefined;
    movePromotionDialog: (orig: sg.Key, dest: sg.Key) => boolean;
    forceMovePromotion: (orig: sg.Key, dest: sg.Key) => boolean;
    dropPromotionDialog: (piece: sg.Piece, key: sg.Key) => boolean;
    forceDropPromotion: (piece: sg.Piece, key: sg.Key) => boolean;
    current?: {
      piece: sg.Piece;
      promotedPiece: sg.Piece;
      key: sg.Key;
      dragged: boolean; // no animations with drag
    };
    events: {
      initiated?: () => void; // called when promotion dialog is started
      after?: (piece: sg.Piece) => void; // called after user selects a piece
      cancel?: () => void; // called after user cancels the selection
    };
    prevPromotionHash: string;
  };
  forsyth: {
    toForsyth?: (role: sg.RoleString) => string | undefined;
    fromForsyth?: (str: string) => sg.RoleString | undefined;
  };
  events: {
    change?: () => void; // called after the situation changes on the board
    move?: (orig: sg.Key, dest: sg.Key, prom: boolean, capturedPiece?: sg.Piece) => void;
    drop?: (piece: sg.Piece, key: sg.Key, prom: boolean) => void;
    select?: (key: sg.Key) => void; // called when a square is selected
    unselect?: (key: sg.Key) => void; // called when a selected square is directly unselected - dropped back or clicked on the original square
    pieceSelect?: (piece: sg.Piece) => void; // called when a piece in hand is selected
    pieceUnselect?: (piece: sg.Piece) => void; // called when a selected piece is directly unselected - dropped back or clicked on the same piece
    insert?: (boardElements?: sg.BoardElements, handElements?: sg.HandElements) => void; // when the board or hands DOM has been (re)inserted
  };
  drawable: Drawable;
}
export interface State extends HeadlessState {
  dom: sg.Dom;
}

export function defaults(): HeadlessState {
  return {
    pieces: new Map(),
    dimensions: { files: 9, ranks: 9 },
    orientation: 'sente',
    turnColor: 'sente',
    activeColor: 'both',
    viewOnly: false,
    squareRatio: [11, 12],
    disableContextMenu: true,
    blockTouchScroll: false,
    scaleDownPieces: true,
    coordinates: {
      enabled: true,
      files: sg.Notation.NUMERIC,
      ranks: sg.Notation.NUMERIC,
    },
    highlight: {
      lastDests: true,
      check: true,
      checkRoles: ['king'],
      hovered: false,
    },
    animation: {
      enabled: true,
      hands: true,
      duration: 250,
    },
    hands: {
      inlined: false,
      handMap: new Map([
        ['sente', new Map()],
        ['gote', new Map()],
      ]),
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
      movePromotionDialog: () => false,
      forceMovePromotion: () => false,
      dropPromotionDialog: () => false,
      forceDropPromotion: () => false,
      promotesTo: () => undefined,
      events: {},
      prevPromotionHash: '',
    },
    forsyth: {},
    events: {},
    drawable: {
      enabled: true, // can draw
      visible: true, // can view
      eraseOnClick: true,
      shapes: [],
      autoShapes: [],
      squares: [],
      prevSvgHash: '',
    },
  };
}
