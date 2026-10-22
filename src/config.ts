import { setChecks, setPreDests } from './board.js';
import { inferDimensions, sfenToBoard, sfenToHands } from './sfen.js';
import type { HeadlessState } from './state.js';
import type * as sg from './types.js';

type DeepPartial<T, Atomic = never> = T extends
  | Atomic
  | ((...args: never[]) => unknown)
  | readonly unknown[]
  | ReadonlyMap<unknown, unknown>
  | ReadonlySet<unknown>
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K], Atomic> }
    : T;

// Keep internal fields out of config, including those nested alongside options.
type ConfigurableState = Omit<
  HeadlessState,
  | 'pieces'
  | 'dimensions'
  | 'checks'
  | 'hovered'
  | 'animation'
  | 'hands'
  | 'premovable'
  | 'predroppable'
  | 'draggable'
  | 'promotion'
  | 'drawable'
> & {
  animation: Omit<HeadlessState['animation'], 'current'>;
  hands: Omit<HeadlessState['hands'], 'handMap'>;
  premovable: Omit<HeadlessState['premovable'], 'current' | 'dests'>;
  predroppable: Omit<HeadlessState['predroppable'], 'current' | 'dests'>;
  draggable: Omit<HeadlessState['draggable'], 'current'>;
  promotion: Omit<HeadlessState['promotion'], 'current' | 'prevPromotionHash'>;
  drawable: Omit<HeadlessState['drawable'], 'current' | 'prevSvgHash' | 'piece'>;
};

export interface Config extends DeepPartial<ConfigurableState, sg.Piece> {
  sfen?: {
    board?: sg.BoardSfen; // pieces on the board in Forsyth notation
    hands?: sg.HandsSfen; // pieces in hand in Forsyth notation
  };
  checks?: sg.Key[] | sg.Color | boolean; // squares currently in check ["5a"], color in check (see highlight.checkRoles) or boolean for current turn color
}

export function applyAnimation(state: HeadlessState, config: Config): void {
  if (config.animation) {
    deepMerge(state.animation, config.animation);
    // no need for such short animations
    if ((state.animation.duration || 0) < 70) state.animation.enabled = false;
  }
}

export function configure(state: HeadlessState, config: Config): void {
  // don't merge, just override.
  if (config.movable?.dests) state.movable.dests = undefined;
  if (config.droppable?.dests) state.droppable.dests = undefined;
  if (config.drawable?.shapes) state.drawable.shapes = [];
  if (config.drawable?.autoShapes) state.drawable.autoShapes = [];
  if (config.drawable?.squares) state.drawable.squares = [];
  if (config.hands?.roles) state.hands.roles = [];

  deepMerge(state, config);

  // if a sfen was provided, replace the pieces, except the currently dragged one
  if (config.sfen?.board) {
    state.dimensions = inferDimensions(config.sfen.board);
    state.pieces = sfenToBoard(config.sfen.board, state.dimensions, state.forsyth.fromForsyth);
    state.drawable.shapes = config.drawable?.shapes || [];
  }

  if (config.sfen?.hands) {
    state.hands.handMap = sfenToHands(config.sfen.hands, state.forsyth.fromForsyth);
  }

  // apply config values that could be undefined yet meaningful
  if ('checks' in config) setChecks(state, config.checks || false);
  if ('lastPiece' in config && !config.lastPiece) state.lastPiece = undefined;

  // in case of drop last move, there's a single square.
  // if the previous last move had two squares,
  // the merge algorithm will incorrectly keep the second square.
  if ('lastDests' in config && !config.lastDests) state.lastDests = undefined;
  else if (config.lastDests) state.lastDests = config.lastDests;

  // fix move/premove dests
  setPreDests(state);

  applyAnimation(state, config);
}

function deepMerge(base: any, extend: any): void {
  for (const key in extend) {
    if (Object.prototype.hasOwnProperty.call(extend, key)) {
      if (
        Object.prototype.hasOwnProperty.call(base, key) &&
        isPlainObject(base[key]) &&
        isPlainObject(extend[key])
      )
        deepMerge(base[key], extend[key]);
      else base[key] = extend[key];
    }
  }
}

function isPlainObject(o: unknown): boolean {
  if (typeof o !== 'object' || o === null) return false;
  const proto = Object.getPrototypeOf(o);
  return proto === Object.prototype || proto === null;
}
