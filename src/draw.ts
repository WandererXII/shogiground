import type { State } from './state.js';
import type * as sg from './types.js';
import { unselect, cancelMoveOrDrop } from './board.js';
import {
  eventPosition,
  isRightButton,
  posOfOutsideEl,
  samePiece,
  getHandPieceAtDomPos,
  getKeyAtDomPos,
  sentePov,
} from './util.js';
import { isPiece, pos2user, samePieceOrKey, setAttributes } from './shapes.js';

export interface DrawShape {
  orig: sg.Key | sg.Piece;
  dest: sg.Key | sg.Piece;
  piece?: DrawShapePiece;
  customSvg?: string; // svg
  description?: string;
  brush: string; // css class to be appended
}

export interface SquareHighlight {
  key: sg.Key;
  className: string;
}

export interface DrawShapePiece {
  role: sg.RoleString;
  color: sg.Color;
  scale?: number;
}

export interface Drawable {
  enabled: boolean; // can draw
  visible: boolean; // can view
  forced: boolean; // can only draw
  eraseOnClick: boolean;
  onChange?: (shapes: DrawShape[]) => void;
  shapes: DrawShape[]; // user shapes
  autoShapes: DrawShape[]; // computer shapes
  squares: SquareHighlight[];
  current?: DrawCurrent;
  prevSvgHash: string;
  piece?: sg.Piece;
}

export interface DrawCurrent {
  orig: sg.Key | sg.Piece;
  dest?: sg.Key | sg.Piece; // undefined if outside board/hands
  arrow?: SVGElement;
  piece?: sg.Piece;
  pos: sg.NumberPair;
  brush: string; // brush name for shape
}

const brushes = ['primary', 'alternative0', 'alternative1', 'alternative2'];

export function start(state: State, e: sg.MouchEvent): void {
  // support one finger touch only
  if (e.touches && e.touches.length > 1) return;
  e.stopPropagation();
  e.preventDefault();

  if (e.ctrlKey) unselect(state);
  else cancelMoveOrDrop(state);

  const pos = eventPosition(e),
    bounds = state.dom.bounds.board.bounds(),
    orig = pos && bounds && getKeyAtDomPos(pos, sentePov(state.orientation), state.dimensions, bounds),
    piece = state.drawable.piece;
  if (!orig) return;
  state.drawable.current = {
    orig,
    dest: undefined,
    pos,
    piece,
    brush: eventBrush(e, isRightButton(e) || state.drawable.forced),
  };
  processDraw(state);
}

export function startFromHand(state: State, piece: sg.Piece, e: sg.MouchEvent): void {
  // support one finger touch only
  if (e.touches && e.touches.length > 1) return;
  e.stopPropagation();
  e.preventDefault();

  if (e.ctrlKey) unselect(state);
  else cancelMoveOrDrop(state);

  const pos = eventPosition(e);
  if (!pos) return;
  state.drawable.current = {
    orig: piece,
    dest: undefined,
    pos,
    brush: eventBrush(e, isRightButton(e) || state.drawable.forced),
  };
  processDraw(state);
}

function processDraw(state: State): void {
  requestAnimationFrame(() => {
    const cur = state.drawable.current,
      bounds = state.dom.bounds.board.bounds();
    if (cur && bounds) {
      const dest =
        getKeyAtDomPos(cur.pos, sentePov(state.orientation), state.dimensions, bounds) ||
        getHandPieceAtDomPos(cur.pos, state.hands.roles, state.dom.bounds.hands.pieceBounds());
      if (cur.dest !== dest && !(cur.dest && dest && samePieceOrKey(dest, cur.dest))) {
        cur.dest = dest;
        state.dom.redrawNow();
      }
      const outPos = posOfOutsideEl(cur.pos[0], cur.pos[1], sentePov(state.orientation), state.dimensions, bounds);
      if (!cur.dest && cur.arrow && outPos) {
        const dest = pos2user(outPos, state.orientation, state.dimensions, state.squareRatio);

        setAttributes(cur.arrow, { x2: dest[0] - state.squareRatio[0] / 2, y2: dest[1] - state.squareRatio[1] / 2 });
      }
      processDraw(state);
    }
  });
}

export function move(state: State, e: sg.MouchEvent): void {
  if (state.drawable.current) state.drawable.current.pos = eventPosition(e)!;
}

export function end(state: State, _: sg.MouchEvent): void {
  const cur = state.drawable.current;
  if (cur) {
    addShape(state.drawable, cur);
    cancel(state);
  }
}

export function cancel(state: State): void {
  if (state.drawable.current) {
    state.drawable.current = undefined;
    state.dom.redraw();
  }
}

export function clear(state: State): void {
  const drawableLength = state.drawable.shapes.length;
  if (drawableLength || state.drawable.piece) {
    state.drawable.shapes = [];
    state.drawable.piece = undefined;
    state.dom.redraw();
    if (drawableLength) onChange(state.drawable);
  }
}

export function setDrawPiece(state: State, piece: sg.Piece): void {
  if (state.drawable.piece && samePiece(state.drawable.piece, piece)) state.drawable.piece = undefined;
  else state.drawable.piece = piece;
  state.dom.redraw();
}

function eventBrush(e: sg.MouchEvent, allowFirstModifier: boolean): string {
  const modA = allowFirstModifier && (e.shiftKey || e.ctrlKey),
    modB = e.altKey || e.metaKey || e.getModifierState?.('AltGraph');
  return brushes[(modA ? 1 : 0) + (modB ? 2 : 0)];
}

function addShape(drawable: Drawable, cur: DrawCurrent): void {
  if (!cur.dest) return;

  const similarShape = (s: DrawShape) =>
    cur.dest && samePieceOrKey(cur.orig, s.orig) && samePieceOrKey(cur.dest, s.dest);

  // separate shape for pieces
  const piece = cur.piece;
  cur.piece = undefined;

  const similar = drawable.shapes.find(similarShape),
    removePiece = drawable.shapes.find(s => similarShape(s) && piece && s.piece && samePiece(piece, s.piece)),
    diffPiece = drawable.shapes.find(s => similarShape(s) && piece && s.piece && !samePiece(piece, s.piece));

  // remove every similar shape
  if (similar) drawable.shapes = drawable.shapes.filter(s => !similarShape(s));

  if (!isPiece(cur.orig) && piece && !removePiece) {
    drawable.shapes.push({ orig: cur.orig, dest: cur.orig, piece: piece, brush: cur.brush });
    // force circle around drawn pieces
    if (!samePieceOrKey(cur.orig, cur.dest)) drawable.shapes.push({ orig: cur.orig, dest: cur.orig, brush: cur.brush });
  }

  if (!similar || diffPiece || similar.brush !== cur.brush) drawable.shapes.push(cur as DrawShape);
  onChange(drawable);
}

function onChange(drawable: Drawable): void {
  if (drawable.onChange) drawable.onChange(drawable.shapes);
}
