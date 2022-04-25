import { State } from './state.js';
import * as util from './util.js';
import * as sg from './types.js';

export type Mutation<A> = (state: State) => A;

// 0,1 animation goal
// 2,3 animation current status
export type AnimVector = sg.NumberQuad;

export type AnimVectors = Map<sg.Key, AnimVector>;

export type AnimFadings = Map<sg.Key, sg.Piece>;

export type AnimPromotions = Map<sg.Key, sg.Piece>;

export interface AnimPlan {
  anims: AnimVectors;
  fadings: AnimFadings;
  promotions: AnimPromotions;
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
  key?: sg.Key;
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

function computePlan(prevPieces: sg.Pieces, prevHands: sg.Hands, current: State): AnimPlan {
  const anims: AnimVectors = new Map(),
    animedOrigs: sg.Key[] = [],
    fadings: AnimFadings = new Map(),
    promotions: AnimPromotions = new Map(),
    missings: AnimPiece[] = [],
    news: AnimPiece[] = [],
    prePieces: AnimPieces = new Map();

  for (const [k, p] of prevPieces) {
    prePieces.set(k, makePiece(k, p));
  }
  for (const key of util.allKeys) {
    const curP = current.pieces.get(key),
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
  if (current.animation.hands) {
    for (const color of sg.colors) {
      const curH = current.hands.handMap.get(color),
        preH = prevHands.get(color);
      if (preH && curH) {
        for (const [role, n] of curH) {
          const piece: sg.Piece = { role, color },
            preN = preH.get(role);
          if (preN && preN > n) {
            const handPieceOffset = current.dom.hands.pieceBounds().get(util.pieceNameOf(piece));
            if (handPieceOffset)
              missings.push({
                pos: util.posOfOutsideEl(
                  handPieceOffset.left,
                  handPieceOffset.top,
                  util.sentePov(current.orientation),
                  current.dimensions,
                  current.dom.board.bounds()
                ),
                piece: piece,
              });
          }
        }
      }
    }
  }
  for (const newP of news) {
    const preP = closer(
      newP,
      missings.filter(p => {
        if (util.samePiece(newP.piece, p.piece)) return true;
        // checking whether promoted pieces are the same
        const pRole = current.promotion.promotesTo(p.piece.role),
          pPiece = pRole && { color: p.piece.color, role: pRole };
        const nRole = current.promotion.promotesTo(newP.piece.role),
          nPiece = nRole && { color: newP.piece.color, role: nRole };
        return (!!pPiece && util.samePiece(newP.piece, pPiece)) || (!!nPiece && util.samePiece(nPiece, p.piece));
      })
    );
    if (preP) {
      const vector = [preP.pos[0] - newP.pos[0], preP.pos[1] - newP.pos[1]];
      anims.set(newP.key!, vector.concat(vector) as AnimVector);
      if (preP.key) animedOrigs.push(preP.key);
      if (!util.samePiece(newP.piece, preP.piece) && newP.key) promotions.set(newP.key, preP.piece);
    }
  }
  for (const p of missings) {
    if (p.key && !animedOrigs.includes(p.key)) fadings.set(p.key, p.piece);
  }

  return {
    anims: anims,
    fadings: fadings,
    promotions: promotions,
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
  const prevPieces: sg.Pieces = new Map(state.pieces),
    prevHands: sg.Hands = new Map([
      ['sente', new Map(state.hands.handMap.get('sente'))],
      ['gote', new Map(state.hands.handMap.get('gote'))],
    ]);

  const result = mutation(state),
    plan = computePlan(prevPieces, prevHands, state);
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
