export type Color = typeof colors[number];
export function isColor(x: any): x is Color {
  return colors.includes(x);
}
export type Role = typeof roles[number];
export function isRole(x: any): x is Role {
  return roles.includes(x);
}
export type Key = '00' | `${File}${Rank}`;
export type File = typeof files[number];
export type Rank = typeof ranks[number];
export type BoardSfen = string;
export type HandsSfen = string;
// coordinate system starts at top right
export type Pos = [number, number];
export interface Piece {
  role: Role;
  color: Color;
  promoted?: boolean;
}
export type Pieces = Map<Key, Piece>;

export type Hands = Map<Color, Hand>;
export type Hand = Map<Role, number>;

export type PiecesDiff = Map<Key, Piece | undefined>;

export type KeyPair = [Key, Key];

export type NumberPair = [number, number];

export type NumberQuad = [number, number, number, number];

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type Dests = Map<Key, Key[]>;
export type DropDests = Map<Role, Key[]>;

export interface Elements {
  squares: HTMLElement;
  pieces: HTMLElement;
  board: HTMLElement;
  ghost?: HTMLElement;
  svg?: SVGElement;
  customSvg?: SVGElement;
  handTop?: HTMLElement;
  handBot?: HTMLElement;
}
export interface Dom {
  elements: Elements;
  bounds: Memo<ClientRect>;
  redraw: () => void;
  redrawNow: (skipSvg?: boolean) => void;
  unbind?: Unbind;
  destroyed?: boolean;
  relative?: boolean; // don't compute bounds, use relative % to place pieces
}

export interface MoveMetadata {
  premove: boolean;
  ctrlKey?: boolean;
  holdTime?: number;
  captured?: Piece;
  predrop?: boolean;
}
export interface SetPremoveMetadata {
  ctrlKey?: boolean;
}

export type MouchEvent = Event & Partial<MouseEvent & TouchEvent>;

export interface KeyedNode extends HTMLElement {
  sgKey: Key;
}
export interface PieceNode extends KeyedNode {
  tagName: 'PIECE';
  sgPiece: string;
  sgAnimating?: boolean;
  sgFading?: boolean;
  sgDragging?: boolean;
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

export interface Timer {
  start: () => void;
  cancel: () => void;
  stop: () => number;
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
export const files = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
export const ranks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] as const;

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
