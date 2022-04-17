export type Color = typeof colors[number];
export type Role = typeof roles[number];
export type Key = `${File}${Rank}`;
export type File = typeof files[number];
export type Rank = typeof ranks[number];
export type BoardSfen = string;
export type HandsSfen = string;
// coordinate system starts at top right
export type Pos = [number, number];
export interface Piece {
  role: Role;
  color: Color;
}
export type PieceName = string; // `$color $role`
export type Pieces = Map<Key, Piece>;

export type Hands = Map<Color, Hand>;
export type Hand = Map<Role, number>;

export type PiecesDiff = Map<Key, Piece | undefined>;

export type KeyPair = [Key, Key];

export type NumberPair = [number, number];

export type NumberQuad = [number, number, number, number];

export type Dests = Map<Key, Key[]>;
export type DropDests = Map<Role, Key[]>;

export interface WrapElements {
  board: HTMLElement;
  handTop?: HTMLElement;
  handBottom?: HTMLElement;
}

export interface DomBoardElements {
  board: HTMLElement;
  squares: HTMLElement;
  pieces: HTMLElement;
  dragged?: PieceNode;
  promotion?: HTMLElement;
  squareOver?: HTMLElement;
  svg?: SVGElement;
  customSvg?: SVGElement;
  freePieces?: HTMLElement;
}
export interface DomBoard {
  elements: DomBoardElements;
  bounds: Memo<DOMRect>;
}

export interface DomHandsElements {
  top?: HTMLElement;
  bottom?: HTMLElement;
}
export interface DomHands {
  elements: DomHandsElements;
  pieceBounds: Memo<Map<PieceName, DOMRect>>;
  bounds: Memo<Map<'top' | 'bottom', DOMRect>>;
}

export interface Dom {
  board: DomBoard;
  hands: DomHands;
  wrapElements: WrapElements;
  redraw: () => void;
  redrawNow: (skipSvg?: boolean) => void;
  unbind?: Unbind;
  destroyed?: boolean;
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
  sgRole: Role;
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

export type Redraw = () => void;
export type Unbind = () => void;
export type Milliseconds = number;
export type KHz = number;

export const colors = ['sente', 'gote'] as const;
export const roles = [
  'king',
  'rook',
  'bishop',
  'gold',
  'silver',
  'knight',
  'lance',
  'pawn',
  'dragon',
  'horse',
  'promotedsilver',
  'promotedknight',
  'promotedlance',
  'tokin',
] as const;
export const files = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const;
export const ranks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'] as const;

export const enum Notation {
  WESTERN,
  KAWASAKI,
  JAPANESE,
  WESTERN2,
}

export type Dimensions = {
  files: number;
  ranks: number;
};
