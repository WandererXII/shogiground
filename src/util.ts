import * as sg from './types.js';

// 1a, 2a, 3a ...
export const allKeys: readonly sg.Key[] = Array.prototype.concat(...sg.ranks.map(r => sg.files.map(f => f + r)));

export const pos2key = (pos: sg.Pos): sg.Key => allKeys[pos[0] + 9 * pos[1]];

export const key2pos = (k: sg.Key): sg.Pos => [k.charCodeAt(0) - 49, k.charCodeAt(1) - 97];

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

export const timer = (): sg.Timer => {
  let startAt: number | undefined;
  return {
    start() {
      startAt = performance.now();
    },
    cancel() {
      startAt = undefined;
    },
    stop() {
      if (!startAt) return 0;
      const time = performance.now() - startAt;
      startAt = undefined;
      return time;
    },
  };
};

export const opposite = (c: sg.Color): sg.Color => (c === 'sente' ? 'gote' : 'sente');

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
  bounds: ClientRect
): ((pos: sg.Pos, asSente: boolean) => sg.NumberPair) => {
  const xFactor = bounds.width / dims.files,
    yFactor = bounds.height / dims.ranks;
  return (pos, asSente) => posToTranslateBase(pos, dims, asSente, xFactor, yFactor);
};

export const posToTranslateRel =
  (dims: sg.Dimensions): ((pos: sg.Pos, asSente: boolean) => sg.NumberPair) =>
  (pos, asSente) =>
    posToTranslateBase(pos, dims, asSente, 50, 50);

// scale, because https://ctidd.com/2015/svg-background-scaling, but for pgn
export const translateAbs = (el: HTMLElement, pos: sg.NumberPair): void => {
  el.style.transform = `translate(${pos[0]}px,${pos[1]}px) scale(0.5)`;
};

export const translateRel = (el: HTMLElement, percents: sg.NumberPair): void => {
  el.style.transform = `translate(${percents[0]}%,${percents[1]}%) scale(0.5)`;
};

export const setVisible = (el: HTMLElement, v: boolean): void => {
  el.style.visibility = v ? 'visible' : 'hidden';
};

export const eventPosition = (e: sg.MouchEvent): sg.NumberPair | undefined => {
  if (e.clientX || e.clientX === 0) return [e.clientX, e.clientY!];
  if (e.targetTouches?.[0]) return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
  return; // touchend has no position!
};

export const isRightButton = (e: sg.MouchEvent): boolean => e.buttons === 2 || e.button === 2;

export const createEl = (tagName: string, className?: string): HTMLElement => {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  return el;
};

export function computeSquareCenter(
  key: sg.Key,
  asSente: boolean,
  dims: sg.Dimensions,
  bounds: ClientRect
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
