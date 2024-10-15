import type { colors, files, ranks } from './constants.js';

export type Color = (typeof colors)[number];
export type File = (typeof files)[number];
export type Rank = (typeof ranks)[number];
export type Key = `${File}${Rank}`;
export type BoardSfen = string;
export type HandsSfen = string;
// coordinate system starts at top right
export type Pos = [number, number];
export type RoleString = string;
export interface Piece {
  role: RoleString;
  color: Color;
}
export type PieceName = `${Color} ${RoleString}`;
export type Pieces = Map<Key, Piece>;

export type Hands = Map<Color, Hand>;
export type Hand = Map<RoleString, number>;

export type PiecesDiff = Map<Key, Piece | undefined>;

export interface Dimensions {
  files: number;
  ranks: number;
}

export type KeyPair = [Key, Key];

export type NumberPair = [number, number];

export type NumberQuad = [number, number, number, number];

export type DOMRectMap<T extends string> = Map<T, DOMRect>;

export type MoveDests = Map<Key, Key[]>;
export type DropDests = Map<PieceName, Key[]>;

export interface WrapElements {
  board?: HTMLElement;
  hands?: {
    top?: HTMLElement;
    bottom?: HTMLElement;
  };
}

export interface WrapElementsBoolean {
  board?: boolean;
  hands?: {
    top?: boolean;
    bottom?: boolean;
  };
}

export interface BoardElements {
  board: HTMLElement;
  squares: HTMLElement;
  pieces: HTMLElement;
  dragged?: PieceNode;
  promotion?: HTMLElement;
  squareOver?: HTMLElement;
  shapes?: ShapesElements;
  hands?: HandElements; // for inlined hands
}

export interface HandElements {
  top?: HTMLElement;
  bottom?: HTMLElement;
}

export interface Elements {
  board?: BoardElements;
  hands?: HandElements;
}

export interface Bounds {
  board: {
    bounds: Memo<DOMRect | undefined>;
  };
  hands: {
    bounds: Memo<DOMRectMap<'top' | 'bottom'>>;
    pieceBounds: Memo<DOMRectMap<PieceName>>;
  };
}

export interface Dom {
  wrapElements: WrapElements;
  elements: Elements;
  bounds: Bounds;
  redrawNow: (skipShapes?: boolean) => void;
  redraw: () => void;
  redrawShapes: () => void;
  unbind: Unbind;
  destroyed: boolean;
}

export interface MoveMetadata {
  premade: boolean;
  captured?: Piece;
}

export type MouchEvent = Event & Partial<MouseEvent & TouchEvent>;

export interface ShapesElements {
  svg: SVGElement;
  customSvg: SVGElement;
  freePieces: HTMLElement;
}

export interface KeyedNode extends HTMLElement {
  sgKey: Key;
}
export interface PieceNode extends KeyedNode {
  tagName: 'PIECE';
  sgRole: RoleString;
  sgColor: Color;
  sgAnimating?: boolean;
  sgFading?: boolean;
  sgGhost?: boolean;
  sgDragging?: boolean;
  sgScale?: number;
}
export interface SquareNode extends KeyedNode {
  tagName: 'SQ';
}

export interface Memo<A> {
  (): A;
  clear: () => void;
}

export type Unbind = () => void;
export type KHz = number;
