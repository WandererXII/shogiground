import { State } from './state.js';
import { createEl, key2pos, pieceNameOf, posToTranslateRel, translateRel } from './util.js';
import { Drawable, DrawShape, DrawShapePiece, DrawBrush, DrawBrushes, DrawModifiers } from './draw.js';
import * as sg from './types.js';
import { sentePov } from './board.js';

export function createSVGElement(tagName: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}

interface Shape {
  shape: DrawShape;
  hash: Hash;
  current?: boolean;
}

type CustomBrushes = Map<string, DrawBrush>; // by hash

type ArrowDests = Map<sg.Key, number>; // how many arrows land on a square

type Hash = string;

export function renderShapes(state: State, svg: SVGElement, customSvg: SVGElement, freePieces: HTMLElement): void {
  const d = state.drawable,
    curD = d.current,
    cur = curD && curD.mouseSq ? (curD as DrawShape) : undefined,
    arrowDests: ArrowDests = new Map(),
    pieceMap: Map<sg.Key, DrawShape> = new Map();

  for (const s of d.shapes.concat(d.autoShapes).concat(cur ? [cur] : [])) {
    if (s.dest) arrowDests.set(s.dest, (arrowDests.get(s.dest) || 0) + 1);
  }

  for (const s of d.shapes.concat(cur ? [cur] : []).concat(d.autoShapes)) {
    if (s.piece) pieceMap.set(s.orig, s);
  }
  const pieceShapes = [...pieceMap.values()].map(s => {
    return {
      shape: s,
      hash: shapeHash(s, arrowDests, false),
    };
  });

  const shapes: Shape[] = d.shapes.concat(d.autoShapes).map((s: DrawShape) => {
    return {
      shape: s,
      current: false,
      hash: shapeHash(s, arrowDests, false),
    };
  });
  if (cur)
    shapes.push({
      shape: cur,
      current: true,
      hash: shapeHash(cur, arrowDests, true),
    });

  const fullHash = shapes.map(sc => sc.hash).join(';');
  if (fullHash === state.drawable.prevSvgHash) return;
  state.drawable.prevSvgHash = fullHash;

  /*
    -- DOM hierarchy --
    <svg class="sg-shapes"> (<= svg)
      <defs>
        ...(for brushes)...
      </defs>
      <g>
        ...(for arrows and circles)...
      </g>
    </svg>
    <svg class="sg-custom-svgs"> (<= customSvg)
      <g>
        ...(for custom svgs)...
      </g>
    <sg-free-pieces> (<= freePieces)
      ...(for pieces)...
    </sg-free-pieces>
    </svg>
  */
  const defsEl = svg.querySelector('defs') as SVGElement;
  const shapesEl = svg.querySelector('g') as SVGElement;
  const customSvgsEl = customSvg.querySelector('g') as SVGElement;

  syncDefs(d, shapes, defsEl);
  syncShapes(
    shapes.filter(s => !s.shape.customSvg),
    shapesEl,
    shape => renderSVGShape(state, shape, d.brushes, arrowDests)
  );
  syncShapes(
    shapes.filter(s => s.shape.customSvg),
    customSvgsEl,
    shape => renderSVGShape(state, shape, d.brushes, arrowDests)
  );
  syncShapes(pieceShapes, freePieces, shape => renderPiece(state, shape));
}

// append only. Don't try to update/remove.
function syncDefs(d: Drawable, shapes: Shape[], defsEl: SVGElement) {
  const brushes: CustomBrushes = new Map();
  let brush: DrawBrush;
  for (const s of shapes) {
    if (s.shape.dest) {
      brush = d.brushes[s.shape.brush];
      if (s.shape.modifiers) brush = makeCustomBrush(brush, s.shape.modifiers);
      brushes.set(brush.key, brush);
    }
  }
  const keysInDom = new Set();
  let el: SVGElement | undefined = defsEl.firstElementChild as SVGElement;
  while (el) {
    keysInDom.add(el.getAttribute('sgKey'));
    el = el.nextElementSibling as SVGElement | undefined;
  }
  for (const [key, brush] of brushes.entries()) {
    if (!keysInDom.has(key)) defsEl.appendChild(renderMarker(brush));
  }
}

// append and remove only. No updates.
export function syncShapes(
  shapes: Shape[],
  root: HTMLElement | SVGElement,
  renderShape: (shape: Shape) => HTMLElement | SVGElement | undefined
): void {
  const hashesInDom = new Map(), // by hash
    toRemove: SVGElement[] = [];
  for (const sc of shapes) hashesInDom.set(sc.hash, false);
  let el: SVGElement | undefined = root.firstElementChild as SVGElement,
    elHash: Hash;
  while (el) {
    elHash = el.getAttribute('sgHash') as Hash;
    // found a shape element that's here to stay
    if (hashesInDom.has(elHash)) hashesInDom.set(elHash, true);
    // or remove it
    else toRemove.push(el);
    el = el.nextElementSibling as SVGElement | undefined;
  }
  // remove old shapes
  for (const el of toRemove) root.removeChild(el);
  // insert shapes that are not yet in dom
  for (const sc of shapes) {
    if (!hashesInDom.get(sc.hash)) {
      const shapeEl = renderShape(sc);
      if (shapeEl) root.appendChild(shapeEl);
    }
  }
}

function shapeHash(
  { orig, dest, brush, piece, modifiers, customSvg }: DrawShape,
  arrowDests: ArrowDests,
  current: boolean
): Hash {
  return [
    current,
    orig,
    dest,
    brush,
    dest && (arrowDests.get(dest) || 0) > 1,
    piece && pieceHash(piece),
    modifiers && modifiersHash(modifiers),
    customSvg && customSvgHash(customSvg),
  ]
    .filter(x => x)
    .join(',');
}

function pieceHash(piece: DrawShapePiece): Hash {
  return [piece.color, piece.role, piece.scale].filter(x => x).join(',');
}

function modifiersHash(m: DrawModifiers): Hash {
  return '' + (m.lineWidth || '');
}

function customSvgHash(s: string): Hash {
  // Rolling hash with base 31 (cf. https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript)
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) >>> 0;
  }
  return 'custom-' + h.toString();
}

function renderSVGShape(
  state: State,
  { shape, current, hash }: Shape,
  brushes: DrawBrushes,
  arrowDests: ArrowDests
): SVGElement {
  const dims = state.dimensions;
  let el: SVGElement;
  if (shape.customSvg) {
    const orig = orient(key2pos(shape.orig), state.orientation, dims);
    el = renderCustomSvg(shape.customSvg, orig, dims);
  } else {
    const orig = orient(key2pos(shape.orig), state.orientation, dims);
    if (shape.dest) {
      let brush: DrawBrush = brushes[shape.brush];
      if (shape.modifiers) brush = makeCustomBrush(brush, shape.modifiers);
      el = renderArrow(
        brush,
        orig,
        orient(key2pos(shape.dest), state.orientation, dims),
        !!current,
        (arrowDests.get(shape.dest) || 0) > 1,
        dims
      );
    } else el = renderCircle(brushes[shape.brush], orig, !!current, dims);
  }
  el.setAttribute('sgHash', hash);
  return el;
}

function renderCustomSvg(customSvg: string, pos: sg.Pos, dims: sg.Dimensions): SVGElement {
  const [x, y] = pos2user(pos, dims);

  // Translate to top-left of `orig` square
  const g = setAttributes(createSVGElement('g'), { transform: `translate(${x},${y})` });

  // Give 100x100 coordinate system to the user for `orig` square
  const svg = setAttributes(createSVGElement('svg'), { width: 1, height: 1, viewBox: '0 0 100 100' });

  g.appendChild(svg);
  svg.innerHTML = customSvg;

  return g;
}

function renderCircle(brush: DrawBrush, pos: sg.Pos, current: boolean, dims: sg.Dimensions): SVGElement {
  const o = pos2user(pos, dims),
    widths = circleWidth(),
    radius = 0.5;
  return setAttributes(createSVGElement('circle'), {
    stroke: brush.color,
    'stroke-width': widths[current ? 0 : 1],
    fill: 'none',
    opacity: opacity(brush, current),
    cx: o[0],
    cy: o[1],
    r: radius - widths[1] / 2,
  });
}

function renderArrow(
  brush: DrawBrush,
  orig: sg.Pos,
  dest: sg.Pos,
  current: boolean,
  shorten: boolean,
  dims: sg.Dimensions
): SVGElement {
  const m = arrowMargin(shorten && !current),
    a = pos2user(orig, dims),
    b = pos2user(dest, dims),
    dx = b[0] - a[0],
    dy = b[1] - a[1],
    angle = Math.atan2(dy, dx),
    xo = Math.cos(angle) * m,
    yo = Math.sin(angle) * m;
  return setAttributes(createSVGElement('line'), {
    stroke: brush.color,
    'stroke-width': lineWidth(brush, current),
    'stroke-linecap': 'round',
    'marker-end': 'url(#arrowhead-' + brush.key + ')',
    opacity: opacity(brush, current),
    x1: a[0],
    y1: a[1],
    x2: b[0] - xo,
    y2: b[1] - yo,
  });
}

export function renderPiece(state: State, { shape, hash }: Shape): sg.PieceNode | undefined {
  if (!shape.piece) return;

  const orig = shape.orig;
  const scale = (shape.piece?.scale || 1) * (state.scaleDownPieces ? 0.5 : 1);

  const pieceEl = createEl('piece', pieceNameOf(shape.piece)) as sg.PieceNode;
  pieceEl.setAttribute('sgHash', hash);
  pieceEl.sgKey = orig;
  pieceEl.sgScale = scale;
  translateRel(pieceEl, posToTranslateRel(state.dimensions)(key2pos(orig), sentePov(state)), scale);

  return pieceEl;
}

function renderMarker(brush: DrawBrush): SVGElement {
  const marker = setAttributes(createSVGElement('marker'), {
    id: 'arrowhead-' + brush.key,
    orient: 'auto',
    markerWidth: 4,
    markerHeight: 8,
    refX: 2.05,
    refY: 2.01,
  });
  marker.appendChild(
    setAttributes(createSVGElement('path'), {
      d: 'M0,0 V4 L3,2 Z',
      fill: brush.color,
    })
  );
  marker.setAttribute('sgKey', brush.key);
  return marker;
}

export function setAttributes(el: SVGElement, attrs: { [key: string]: any }): SVGElement {
  for (const key in attrs) el.setAttribute(key, attrs[key]);
  return el;
}

function orient(pos: sg.Pos, color: sg.Color, dims: sg.Dimensions): sg.Pos {
  return color === 'sente' ? [dims.files - 1 - pos[0], dims.ranks - 1 - pos[1]] : pos;
}

function makeCustomBrush(base: DrawBrush, modifiers: DrawModifiers): DrawBrush {
  return {
    color: base.color,
    opacity: Math.round(base.opacity * 10) / 10,
    lineWidth: Math.round(modifiers.lineWidth || base.lineWidth),
    key: [base.key, modifiers.lineWidth].filter(x => x).join(''),
  };
}

function circleWidth(): [number, number] {
  return [3 / 64, 4 / 64];
}

function lineWidth(brush: DrawBrush, current: boolean): number {
  return ((brush.lineWidth || 10) * (current ? 0.85 : 1)) / 64;
}

function opacity(brush: DrawBrush, current: boolean): number {
  return (brush.opacity || 1) * (current ? 0.9 : 1);
}

function arrowMargin(shorten: boolean): number {
  return (shorten ? 20 : 10) / 64;
}

function pos2user(pos: sg.Pos, dims: sg.Dimensions): sg.NumberPair {
  return [pos[0], dims.ranks - 1 - pos[1]];
}
