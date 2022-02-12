import { State } from './state';
import * as util from './util';
import * as sg from './types';

export type Mutation<A> = (state: State) => A;

// 0,1 animation goal
// 2,3 animation current status
export type AnimVector = sg.NumberQuad;

export type AnimVectors = Map<sg.Key, AnimVector>;

export type AnimFadings = Map<sg.Key, sg.Piece>;

export interface AnimPlan {
  anims: AnimVectors;
  fadings: AnimFadings;
}

export interface AnimCurrent {
  start: DOMHighResTimeStamp;
  frequency: sg.KHz;
  plan: AnimPlan;
}

export function anim<A>(mutation: Mutation<A>, state: State): A {
  return state.animation.enabled ? animate(mutation, state) : render(mutation, state);
}

export function render<A>(mutation: Mutation<A>, state: State): A {
  const result = mutation(state);
  state.dom.redraw();
  return result;
}

interface AnimPiece {
  key: sg.Key;
  pos: sg.Pos;
  piece: sg.Piece;
}
type AnimPieces = Map<sg.Key, AnimPiece>;

function makePiece(key: sg.Key, piece: sg.Piece): AnimPiece {
  return {
    key: key,
    pos: util.key2pos(key),
    piece: piece,
  };
}

function closer(piece: AnimPiece, pieces: AnimPiece[]): AnimPiece | undefined {
  return pieces.sort((p1, p2) => {
    return util.distanceSq(piece.pos, p1.pos) - util.distanceSq(piece.pos, p2.pos);
  })[0];
}

function computePlan(prevPieces: sg.Pieces, current: State): AnimPlan {
  const anims: AnimVectors = new Map(),
    animedOrigs: sg.Key[] = [],
    fadings: AnimFadings = new Map(),
    missings: AnimPiece[] = [],
    news: AnimPiece[] = [],
    prePieces: AnimPieces = new Map();
  let curP: sg.Piece | undefined, preP: AnimPiece | undefined, vector: sg.NumberPair;
  for (const [k, p] of prevPieces) {
    prePieces.set(k, makePiece(k, p));
  }
  for (const key of util.allKeys) {
    curP = current.pieces.get(key);
    preP = prePieces.get(key);
    if (curP) {
      if (preP) {
        if (!util.samePiece(curP, preP.piece)) {
          missings.push(preP);
          news.push(makePiece(key, curP));
        }
      } else news.push(makePiece(key, curP));
    } else if (preP) missings.push(preP);
  }
  for (const newP of news) {
    preP = closer(
      newP,
      missings.filter(p => util.samePiece(newP.piece, p.piece))
    );
    if (preP) {
      vector = [preP.pos[0] - newP.pos[0], preP.pos[1] - newP.pos[1]];
      anims.set(newP.key, vector.concat(vector) as AnimVector);
      animedOrigs.push(preP.key);
    }
  }
  for (const p of missings) {
    if (!animedOrigs.includes(p.key)) fadings.set(p.key, p.piece);
  }

  return {
    anims: anims,
    fadings: fadings,
  };
}

function step(state: State, now: DOMHighResTimeStamp): void {
  const cur = state.animation.current;
  if (cur === undefined) {
    // animation was canceled :(
    if (!state.dom.destroyed) state.dom.redrawNow();
    return;
  }
  const rest = 1 - (now - cur.start) * cur.frequency;
  if (rest <= 0) {
    state.animation.current = undefined;
    state.dom.redrawNow();
  } else {
    const ease = easing(rest);
    for (const cfg of cur.plan.anims.values()) {
      cfg[2] = cfg[0] * ease;
      cfg[3] = cfg[1] * ease;
    }
    state.dom.redrawNow(true); // optimisation: don't render SVG changes during animations
    requestAnimationFrame((now = performance.now()) => step(state, now));
  }
}

function animate<A>(mutation: Mutation<A>, state: State): A {
  // clone state before mutating it
  const prevPieces: sg.Pieces = new Map(state.pieces);

  const result = mutation(state);
  const plan = computePlan(prevPieces, state);
  if (plan.anims.size || plan.fadings.size) {
    const alreadyRunning = state.animation.current && state.animation.current.start;
    state.animation.current = {
      start: performance.now(),
      frequency: 1 / state.animation.duration,
      plan: plan,
    };
    if (!alreadyRunning) step(state, performance.now());
  } else {
    // don't animate, just render right away
    state.dom.redraw();
  }
  return result;
}

// https://gist.github.com/gre/1650294
function easing(t: number): number {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}
