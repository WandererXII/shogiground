import { State } from './state.js';
import { createEl, key2pos, pieceNameOf, posToTranslateRel, samePiece, translateRel, posOfOutsideEl } from './util.js';
import { Drawable, DrawShape, DrawShapePiece, DrawBrush, DrawBrushes, DrawModifiers, DrawCurrent } from './draw.js';
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

type ArrowDests = Map<sg.Key | sg.PieceName, number>; // how many arrows land on a square

type Hash = string;

const outsideArrowHash = 'outsideArrow';

export function renderShapes(state: State, svg: SVGElement, customSvg: SVGElement, freePieces: HTMLElement): void {
  const d = state.drawable,
    curD = d.current,
    cur = curD?.dest ? (curD as DrawShape) : undefined,
    outsideArrow = !!curD && !cur,
    arrowDests: ArrowDests = new Map(),
    pieceMap: Map<sg.Key, DrawShape> = new Map();

  const hashBounds = () => {
    // todo also possible piece bounds
    const bounds = state.dom.board.bounds();
    return bounds.width.toString() + bounds.height;
  };

  for (const s of d.shapes.concat(d.autoShapes).concat(cur ? [cur] : [])) {
    const destName = isPiece(s.dest) ? pieceNameOf(s.dest) : s.dest;
    if (destName && !samePieceOrKey(s.dest, s.orig)) arrowDests.set(destName, (arrowDests.get(destName) || 0) + 1);
  }

  for (const s of d.shapes.concat(cur ? [cur] : []).concat(d.autoShapes)) {
    if (s.piece && !isPiece(s.orig)) pieceMap.set(s.orig, s);
  }
  const pieceShapes = [...pieceMap.values()].map(s => {
    return {
      shape: s,
      hash: shapeHash(s, arrowDests, false, hashBounds),
    };
  });

  const shapes: Shape[] = d.shapes.concat(d.autoShapes).map((s: DrawShape) => {
    return {
      shape: s,
      hash: shapeHash(s, arrowDests, false, hashBounds),
    };
  });
  if (cur)
    shapes.push({
      shape: cur,
      hash: shapeHash(cur, arrowDests, true, hashBounds),
      current: true,
    });

  const fullHash = shapes.map(sc => sc.hash).join(';') + (outsideArrow ? outsideArrowHash : '');
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

  syncDefs(d, shapes, outsideArrow ? curD : undefined, defsEl);
  syncShapes(
    shapes.filter(s => !s.shape.customSvg && (!s.shape.piece || s.current)),
    shapesEl,
    shape => renderSVGShape(state, shape, d.brushes, arrowDests),
    outsideArrow
  );
  syncShapes(
    shapes.filter(s => s.shape.customSvg),
    customSvgsEl,
    shape => renderSVGShape(state, shape, d.brushes, arrowDests)
  );
  syncShapes(pieceShapes, freePieces, shape => renderPiece(state, shape));

  if (!outsideArrow && curD) curD.arrow = undefined;

  if (outsideArrow && !curD.arrow) {
    const orig = pieceOrKeyToPos(curD.orig, state);
    if (orig) {
      const el = renderArrow(d.brushes[curD.brush], orig, orig, true, false, true);
      el.setAttribute('sgHash', outsideArrowHash);
      curD.arrow = el;
      shapesEl.appendChild(el);
    }
  }
}

// append only. Don't try to update/remove.
function syncDefs(d: Drawable, shapes: Shape[], outsideShape: DrawCurrent | undefined, defsEl: SVGElement): void {
  const brushes: CustomBrushes = new Map();
  let brush: DrawBrush;
  const addBrush = (shape: DrawShape) => {
    brush = d.brushes[shape.brush];
    if (shape.modifiers) brush = makeCustomBrush(brush, shape.modifiers);
    brushes.set(brush.key, brush);
  };
  for (const s of shapes) {
    if (!samePieceOrKey(s.shape.dest, s.shape.orig)) addBrush(s.shape);
  }
  if (outsideShape) addBrush(outsideShape as DrawShape);
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
  renderShape: (shape: Shape) => HTMLElement | SVGElement | undefined,
  outsideArrow?: boolean
): void {
  const hashesInDom = new Map(), // by hash
    toRemove: SVGElement[] = [];
  for (const sc of shapes) hashesInDom.set(sc.hash, false);
  if (outsideArrow) hashesInDom.set(outsideArrowHash, true);
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
  current: boolean,
  boundHash: () => string
): Hash {
  return [
    current,
    (isPiece(orig) || isPiece(dest)) && boundHash(),
    isPiece(orig) ? pieceHash(orig) : orig,
    isPiece(dest) ? pieceHash(dest) : dest,
    brush,
    (arrowDests.get(isPiece(dest) ? pieceNameOf(dest) : dest) || 0) > 1,
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
): SVGElement | undefined {
  const orig = pieceOrKeyToPos(shape.orig, state);
  if (!orig) return;
  let el: SVGElement | undefined;
  if (shape.customSvg) {
    el = renderCustomSvg(shape.customSvg, orig);
  } else {
    const dest = !samePieceOrKey(shape.orig, shape.dest) && pieceOrKeyToPos(shape.dest, state);
    if (dest) {
      let brush: DrawBrush = brushes[shape.brush];
      if (shape.modifiers) brush = makeCustomBrush(brush, shape.modifiers);
      el = renderArrow(
        brush,
        orig,
        dest,
        !!current,
        (arrowDests.get((isPiece(shape.dest) ? pieceNameOf(shape.dest) : shape.dest)!) || 0) > 1,
        false
      );
    } else if (samePieceOrKey(shape.dest, shape.orig)) {
      const radius =
        isPiece(shape.orig) &&
        state.dom.hands.pieceBounds().get(pieceNameOf(shape.orig))!.height /
          (state.dom.board.bounds().height / state.dimensions.ranks) /
          2;

      el = renderCircle(brushes[shape.brush], orig, radius || 0.5, !!current);
    }
  }
  if (el) {
    el.setAttribute('sgHash', hash);
    return el;
  }
  return;
}

function renderCustomSvg(customSvg: string, pos: sg.Pos): SVGElement {
  const [x, y] = pos;

  // Translate to top-left of `orig` square
  const g = setAttributes(createSVGElement('g'), { transform: `translate(${x},${y})` });

  // Give 100x100 coordinate system to the user for `orig` square
  const svg = setAttributes(createSVGElement('svg'), { width: 1, height: 1, viewBox: '0 0 100 100' });

  g.appendChild(svg);
  svg.innerHTML = customSvg;

  return g;
}

function renderCircle(brush: DrawBrush, pos: sg.Pos, radius: number, current: boolean): SVGElement {
  const o = pos,
    widths = circleWidth();
  return setAttributes(createSVGElement('circle'), {
    stroke: brush.color,
    'stroke-width': widths[current ? 0 : 1],
    fill: 'none',
    opacity: opacity(brush, current, false),
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
  outside: boolean
): SVGElement {
  const m = arrowMargin(shorten && !current),
    a = orig,
    b = dest,
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
    opacity: opacity(brush, current, outside),
    x1: a[0],
    y1: a[1],
    x2: b[0] - xo,
    y2: b[1] - yo,
  });
}

export function renderPiece(state: State, { shape, hash }: Shape): sg.PieceNode | undefined {
  if (!shape.piece || isPiece(shape.orig)) return;

  const orig = shape.orig,
    scale = (shape.piece.scale || 1) * (state.scaleDownPieces ? 0.5 : 1);

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

export function pos2user(pos: sg.Pos, color: sg.Color, dims: sg.Dimensions): sg.NumberPair {
  return color === 'sente' ? [dims.files - 1 - pos[0], pos[1]] : [pos[0], dims.ranks - 1 - pos[1]];
}

export function isPiece(x: sg.Key | sg.Piece): x is sg.Piece {
  return typeof x === 'object';
}

export function samePieceOrKey(kp1: sg.Key | sg.Piece, kp2: sg.Key | sg.Piece): boolean {
  return (isPiece(kp1) && isPiece(kp2) && samePiece(kp1, kp2)) || kp1 === kp2;
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

function opacity(brush: DrawBrush, current: boolean, outside: boolean): number {
  return ((brush.opacity || 1) * (current ? 0.9 : 1)) / (outside ? 2 : 1);
}

function arrowMargin(shorten: boolean): number {
  return (shorten ? 20 : 10) / 64;
}

function pieceOrKeyToPos(kp: sg.Key | sg.Piece, state: State): sg.Pos | undefined {
  if (isPiece(kp)) {
    const pieceBounds = state.dom.hands.pieceBounds().get(pieceNameOf(kp)),
      offset = sentePov(state) ? [0.5, -0.5] : [-0.5, 0.5],
      pos =
        pieceBounds &&
        posOfOutsideEl(
          pieceBounds.left + pieceBounds.width / 2,
          pieceBounds.top + pieceBounds.height / 2,
          sentePov(state),
          state.dimensions,
          state.dom.board.bounds()
        );
    return pos && pos2user([pos[0] + offset[0], pos[1] + offset[1]], state.orientation, state.dimensions);
  } else return pos2user(key2pos(kp), state.orientation, state.dimensions);
}
