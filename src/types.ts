export type Color = (typeof colors)[number];
export type Key = `${File}${Rank}`;
export type File = (typeof files)[number];
export type Rank = (typeof ranks)[number];
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

export type KeyPair = [Key, Key];

export type NumberPair = [number, number];

export type NumberQuad = [number, number, number, number];

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
  svg?: SVGElement;
  customSvg?: SVGElement;
  freePieces?: HTMLElement;
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
    bounds: Memo<Map<'top' | 'bottom', DOMRect>>;
    pieceBounds: Memo<Map<PieceName, DOMRect>>;
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

export function isPieceNode(el: HTMLElement): el is PieceNode {
  return el.tagName === 'PIECE';
}
export function isSquareNode(el: HTMLElement): el is SquareNode {
  return el.tagName === 'SQ';
}

export interface Memo<A> {
  (): A;
  clear: () => void;
}

export type Unbind = () => void;
export type KHz = number;

export const colors = ['sente', 'gote'] as const;
export const files = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'] as const;
export const ranks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'] as const;

export const enum Notation {
  NUMERIC,
  JAPANESE,
  ENGINE,
  HEX,
}

export type Dimensions = {
  files: number;
  ranks: number;
};
