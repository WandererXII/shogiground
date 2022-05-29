import * as sg from './types.js';

// 1a, 2a, 3a ...
export const allKeys: readonly sg.Key[] = Array.prototype.concat(...sg.ranks.map(r => sg.files.map(f => f + r)));

export const pos2key = (pos: sg.Pos): sg.Key => allKeys[pos[0] + 12 * pos[1]];

export const key2pos = (k: sg.Key): sg.Pos => {
  if (k.length > 2) return [k.charCodeAt(1) - 39, k.charCodeAt(2) - 97];
  else return [k.charCodeAt(0) - 49, k.charCodeAt(1) - 97];
};

export function memo<A>(f: () => A): sg.Memo<A> {
  let v: A | undefined;
  const ret = (): A => {
    if (v === undefined) v = f();
    return v;
  };
  ret.clear = () => {
    v = undefined;
  };
  return ret;
}

export function callUserFunction<T extends (...args: any[]) => void>(f: T | undefined, ...args: Parameters<T>): void {
  if (f) setTimeout(() => f(...args), 1);
}

export const opposite = (c: sg.Color): sg.Color => (c === 'sente' ? 'gote' : 'sente');

export const sentePov = (o: sg.Color): boolean => o === 'sente';

export const distanceSq = (pos1: sg.Pos, pos2: sg.Pos): number => {
  const dx = pos1[0] - pos2[0],
    dy = pos1[1] - pos2[1];
  return dx * dx + dy * dy;
};

export const samePiece = (p1: sg.Piece, p2: sg.Piece): boolean => p1.role === p2.role && p1.color === p2.color;

const posToTranslateBase = (
  pos: sg.Pos,
  dims: sg.Dimensions,
  asSente: boolean,
  xFactor: number,
  yFactor: number
): sg.NumberPair => [
  (asSente ? dims.files - 1 - pos[0] : pos[0]) * xFactor,
  (asSente ? pos[1] : dims.ranks - 1 - pos[1]) * yFactor,
];

export const posToTranslateAbs = (
  dims: sg.Dimensions,
  bounds: DOMRect
): ((pos: sg.Pos, asSente: boolean) => sg.NumberPair) => {
  const xFactor = bounds.width / dims.files,
    yFactor = bounds.height / dims.ranks;
  return (pos, asSente) => posToTranslateBase(pos, dims, asSente, xFactor, yFactor);
};

export const posToTranslateRel =
  (dims: sg.Dimensions): ((pos: sg.Pos, asSente: boolean) => sg.NumberPair) =>
  (pos, asSente) =>
    posToTranslateBase(pos, dims, asSente, 100, 100);

export const translateAbs = (el: HTMLElement, pos: sg.NumberPair, scale: number): void => {
  el.style.transform = `translate(${pos[0]}px,${pos[1]}px) scale(${scale}`;
};

export const translateRel = (el: HTMLElement, percents: sg.NumberPair, scaleFactor: number, scale?: number): void => {
  el.style.transform = `translate(${percents[0] * scaleFactor}%,${percents[1] * scaleFactor}%) scale(${
    scale || scaleFactor
  })`;
};

export const setDisplay = (el: HTMLElement, v: boolean): void => {
  el.style.display = v ? '' : 'none';
};

export const eventPosition = (e: sg.MouchEvent): sg.NumberPair | undefined => {
  if (e.clientX || e.clientX === 0) return [e.clientX, e.clientY!];
  if (e.targetTouches?.[0]) return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
  return; // touchend has no position!
};

export const isRightButton = (e: sg.MouchEvent): boolean => e.buttons === 2 || e.button === 2;

export const isMiddleButton = (e: sg.MouchEvent): boolean => e.buttons === 4 || e.button === 1;

export const createEl = (tagName: string, className?: string): HTMLElement => {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  return el;
};

export function pieceNameOf(piece: sg.Piece): sg.PieceName {
  return `${piece.color} ${piece.role}`;
}

export function computeSquareCenter(
  key: sg.Key,
  asSente: boolean,
  dims: sg.Dimensions,
  bounds: DOMRect
): sg.NumberPair {
  const pos = key2pos(key);
  if (asSente) {
    pos[0] = dims.files - 1 - pos[0];
    pos[1] = dims.ranks - 1 - pos[1];
  }
  return [
    bounds.left + (bounds.width * pos[0]) / dims.files + bounds.width / (dims.files * 2),
    bounds.top + (bounds.height * (dims.ranks - 1 - pos[1])) / dims.ranks + bounds.height / (dims.ranks * 2),
  ];
}

export function domSquareIndexOfKey(key: sg.Key, asSente: boolean, dims: sg.Dimensions): number {
  const pos = key2pos(key);
  let index = dims.files - 1 - pos[0] + pos[1] * dims.files;
  if (!asSente) index = dims.files * dims.ranks - 1 - index;

  return index;
}

export function isInsideRect(rect: DOMRect, pos: sg.Pos): boolean {
  return (
    rect.left <= pos[0] && rect.top <= pos[1] && rect.left + rect.width > pos[0] && rect.top + rect.height > pos[1]
  );
}

export function getKeyAtDomPos(
  pos: sg.NumberPair,
  asSente: boolean,
  dims: sg.Dimensions,
  bounds: DOMRect
): sg.Key | undefined {
  let file = Math.floor((dims.files * (pos[0] - bounds.left)) / bounds.width);
  if (asSente) file = dims.files - 1 - file;
  let rank = Math.floor((dims.ranks * (pos[1] - bounds.top)) / bounds.height);
  if (!asSente) rank = dims.ranks - 1 - rank;
  return file >= 0 && file < dims.files && rank >= 0 && rank < dims.ranks ? pos2key([file, rank]) : undefined;
}

export function getHandPieceAtDomPos(
  pos: sg.NumberPair,
  roles: sg.Role[],
  bounds: Map<sg.PieceName, DOMRect>
): sg.Piece | undefined {
  for (const color of sg.colors) {
    for (const role of roles) {
      const piece = { color, role },
        pieceRect = bounds.get(pieceNameOf(piece));
      if (pieceRect && isInsideRect(pieceRect, pos)) return piece;
    }
  }
  return;
}

export function posOfOutsideEl(
  left: number,
  top: number,
  asSente: boolean,
  dims: sg.Dimensions,
  boardBounds: DOMRect
): sg.Pos {
  const sqW = boardBounds.width / dims.files,
    sqH = boardBounds.height / dims.ranks;
  let xOff = (left - boardBounds.left) / sqW;
  if (asSente) xOff = dims.files - 1 - xOff;
  let yOff = (top - boardBounds.top) / sqH;
  if (!asSente) yOff = dims.ranks - 1 - yOff;
  return [xOff, yOff];
}
