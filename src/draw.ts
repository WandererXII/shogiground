import { State } from './state.js';
import { unselect, cancelMoveOrDrop, getKeyAtDomPos, sentePov } from './board.js';
import { eventPosition, isRightButton, samePiece } from './util.js';
import * as sg from './types.js';

export interface DrawShape {
  orig: sg.Key;
  dest?: sg.Key;
  brush: string;
  modifiers?: DrawModifiers;
  piece?: DrawShapePiece;
  customSvg?: string;
}

export interface DrawShapePiece {
  role: sg.Role;
  color: sg.Color;
  scale?: number;
}

export interface DrawBrush {
  key: string;
  color: string;
  opacity: number;
  lineWidth: number;
}

export interface DrawBrushes {
  [name: string]: DrawBrush;
}

export interface DrawModifiers {
  lineWidth?: number;
}

export interface Drawable {
  enabled: boolean; // can draw
  visible: boolean; // can view
  eraseOnClick: boolean;
  onChange?: (shapes: DrawShape[]) => void;
  shapes: DrawShape[]; // user shapes
  autoShapes: DrawShape[]; // computer shapes
  current?: DrawCurrent;
  brushes: DrawBrushes;
  prevSvgHash: string;
  piece?: sg.Piece;
}

export interface DrawCurrent {
  orig: sg.Key; // orig key of drawing
  dest?: sg.Key; // shape dest, or undefined for circle
  piece?: sg.Piece;
  mouseSq?: sg.Key; // square being moused over
  pos: sg.NumberPair; // relative current position
  brush: string; // brush name for shape
}

const brushes = ['green', 'red', 'blue', 'yellow'];

export function start(state: State, e: sg.MouchEvent): void {
  // support one finger touch only
  if (e.touches && e.touches.length > 1) return;
  e.stopPropagation();
  e.preventDefault();
  e.ctrlKey ? unselect(state) : cancelMoveOrDrop(state);
  const pos = eventPosition(e)!,
    orig = getKeyAtDomPos(pos, sentePov(state), state.dimensions, state.dom.board.bounds()),
    piece = state.drawable.piece;
  if (!orig) return;
  state.drawable.current = {
    orig,
    pos,
    piece,
    brush: eventBrush(e),
  };
  processDraw(state);
}

export function processDraw(state: State): void {
  requestAnimationFrame(() => {
    const cur = state.drawable.current;
    if (cur) {
      const mouseSq = getKeyAtDomPos(cur.pos, sentePov(state), state.dimensions, state.dom.board.bounds());
      if (mouseSq !== cur.mouseSq) {
        cur.mouseSq = mouseSq;
        cur.dest = mouseSq !== cur.orig ? mouseSq : undefined;
        state.dom.redrawNow();
      }
      processDraw(state);
    }
  });
}

export function move(state: State, e: sg.MouchEvent): void {
  if (state.drawable.current) state.drawable.current.pos = eventPosition(e)!;
}

export function end(state: State): void {
  const cur = state.drawable.current;
  if (cur) {
    if (cur.mouseSq) addShape(state.drawable, cur);
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
  if (state.drawable.shapes.length) {
    state.drawable.shapes = [];
    state.dom.redraw();
    onChange(state.drawable);
  }
}

function eventBrush(e: sg.MouchEvent): string {
  const modA = (e.shiftKey || e.ctrlKey) && isRightButton(e);
  const modB = e.altKey || e.metaKey || e.getModifierState?.('AltGraph');
  return brushes[(modA ? 1 : 0) + (modB ? 2 : 0)];
}

function addShape(drawable: Drawable, cur: DrawCurrent): void {
  const similarShape = (s: DrawShape) => s.orig === cur.orig && s.dest === cur.dest;

  // have arrows be independent of pieces
  const piece = cur.piece;
  if (cur.dest) cur.piece = undefined;
  const similar = drawable.shapes.find(similarShape);
  const diffPiece = drawable.shapes.find(s => s.orig === cur.orig && s.piece && piece && !samePiece(s.piece, piece));

  if (similar) drawable.shapes = drawable.shapes.filter(s => !similarShape(s));
  if (!similar || similar.brush !== cur.brush || (!!similar.piece !== !!cur.piece && cur.piece))
    drawable.shapes.push(cur);
  if (!!piece !== !!cur.piece || diffPiece) drawable.shapes.push({ orig: cur.orig, brush: cur.brush, piece: piece });
  onChange(drawable);
}

function onChange(drawable: Drawable): void {
  if (drawable.onChange) drawable.onChange(drawable.shapes);
}
