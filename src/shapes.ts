import type { State } from './state.js';
import type { DrawShape, DrawShapePiece, DrawCurrent } from './draw.js';
import * as sg from './types.js';
import {
  createEl,
  key2pos,
  pieceNameOf,
  posToTranslateRel,
  samePiece,
  translateRel,
  posOfOutsideEl,
  sentePov,
} from './util.js';

export function createSVGElement(tagName: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}

interface Shape {
  shape: DrawShape;
  hash: Hash;
  current?: boolean;
}

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
    const bounds = state.dom.bounds.board.bounds();
    return (bounds && bounds.width.toString() + bounds.height) || '';
  };

  for (const s of d.shapes.concat(d.autoShapes).concat(cur ? [cur] : [])) {
    const destName = isPiece(s.dest) ? pieceNameOf(s.dest) : s.dest;
    if (!samePieceOrKey(s.dest, s.orig)) arrowDests.set(destName, (arrowDests.get(destName) || 0) + 1);
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

  syncDefs(shapes, outsideArrow ? curD : undefined, defsEl);
  syncShapes(
    shapes.filter(s => !s.shape.customSvg && (!s.shape.piece || s.current)),
    shapesEl,
    shape => renderSVGShape(state, shape, arrowDests),
    outsideArrow
  );
  syncShapes(
    shapes.filter(s => s.shape.customSvg),
    customSvgsEl,
    shape => renderSVGShape(state, shape, arrowDests)
  );
  syncShapes(pieceShapes, freePieces, shape => renderPiece(state, shape));

  if (!outsideArrow && curD) curD.arrow = undefined;

  if (outsideArrow && !curD.arrow) {
    const orig = pieceOrKeyToPos(curD.orig, state);
    if (orig) {
      const g = setAttributes(createSVGElement('g'), {
          class: shapeClass(curD.brush, true, true),
          sgHash: outsideArrowHash,
        }),
        el = renderArrow(curD.brush, orig, orig, state.squareRatio, true, false);
      g.appendChild(el);
      curD.arrow = el;
      shapesEl.appendChild(g);
    }
  }
}

// append only. Don't try to update/remove.
function syncDefs(shapes: Shape[], outsideShape: DrawCurrent | undefined, defsEl: SVGElement): void {
  const brushes: Set<string> = new Set();
  for (const s of shapes) {
    if (!samePieceOrKey(s.shape.dest, s.shape.orig)) brushes.add(s.shape.brush);
  }
  if (outsideShape) brushes.add(outsideShape.brush);
  const keysInDom = new Set();
  let el: SVGElement | undefined = defsEl.firstElementChild as SVGElement;
  while (el) {
    keysInDom.add(el.getAttribute('sgKey'));
    el = el.nextElementSibling as SVGElement | undefined;
  }
  for (const key of brushes) {
    if (!keysInDom.has(key)) defsEl.appendChild(renderMarker(key));
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
  { orig, dest, brush, piece, customSvg, description }: DrawShape,
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
    customSvg && customSvgHash(customSvg),
    description,
  ]
    .filter(x => x)
    .join(',');
}

function pieceHash(piece: DrawShapePiece): Hash {
  return [piece.color, piece.role, piece.scale].filter(x => x).join(',');
}

function customSvgHash(s: string): Hash {
  // Rolling hash with base 31 (cf. https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript)
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) >>> 0;
  }
  return 'custom-' + h.toString();
}

function renderSVGShape(state: State, { shape, current, hash }: Shape, arrowDests: ArrowDests): SVGElement | undefined {
  const orig = pieceOrKeyToPos(shape.orig, state);
  if (!orig) return;
  if (shape.customSvg) {
    return renderCustomSvg(shape.customSvg, orig, state.squareRatio);
  } else {
    let el: SVGElement | undefined;
    const dest = !samePieceOrKey(shape.orig, shape.dest) && pieceOrKeyToPos(shape.dest, state);
    if (dest) {
      el = renderArrow(
        shape.brush,
        orig,
        dest,
        state.squareRatio,
        !!current,
        (arrowDests.get((isPiece(shape.dest) ? pieceNameOf(shape.dest) : shape.dest)!) || 0) > 1
      );
    } else if (samePieceOrKey(shape.dest, shape.orig)) {
      let ratio: sg.NumberPair = state.squareRatio;
      if (isPiece(shape.orig)) {
        const pieceBounds = state.dom.bounds.hands.pieceBounds().get(pieceNameOf(shape.orig)),
          bounds = state.dom.bounds.board.bounds();
        if (pieceBounds && bounds) {
          const heightBase = pieceBounds.height / (bounds.height / state.dimensions.files);
          // we want to keep the ratio that is on the board
          ratio = [heightBase * state.squareRatio[0], heightBase * state.squareRatio[1]];
        }
      }
      el = renderEllipse(orig, ratio, !!current);
    }
    if (el) {
      const g = setAttributes(createSVGElement('g'), {
        class: shapeClass(shape.brush, !!current, false),
        sgHash: hash,
      });
      g.appendChild(el);
      const descEl = shape.description && renderDescription(state, shape, arrowDests);
      if (descEl) g.appendChild(descEl);
      return g;
    } else return;
  }
}

function renderCustomSvg(customSvg: string, pos: sg.Pos, ratio: sg.NumberPair): SVGElement {
  const [x, y] = pos;

  // Translate to top-left of `orig` square
  const g = setAttributes(createSVGElement('g'), { transform: `translate(${x},${y})` });

  const svg = setAttributes(createSVGElement('svg'), {
    width: ratio[0],
    height: ratio[1],
    viewBox: `0 0 ${ratio[0] * 10} ${ratio[1] * 10}`,
  });

  g.appendChild(svg);
  svg.innerHTML = customSvg;

  return g;
}

function renderEllipse(pos: sg.Pos, ratio: sg.NumberPair, current: boolean): SVGElement {
  const o = pos,
    widths = ellipseWidth(ratio);
  return setAttributes(createSVGElement('ellipse'), {
    'stroke-width': widths[current ? 0 : 1],
    fill: 'none',
    cx: o[0],
    cy: o[1],
    rx: ratio[0] / 2 - widths[1] / 2,
    ry: ratio[1] / 2 - widths[1] / 2,
  });
}

function renderArrow(
  brush: string,
  orig: sg.Pos,
  dest: sg.Pos,
  ratio: sg.NumberPair,
  current: boolean,
  shorten: boolean
): SVGElement {
  const m = arrowMargin(shorten && !current, ratio),
    a = orig,
    b = dest,
    dx = b[0] - a[0],
    dy = b[1] - a[1],
    angle = Math.atan2(dy, dx),
    xo = Math.cos(angle) * m,
    yo = Math.sin(angle) * m;
  return setAttributes(createSVGElement('line'), {
    'stroke-width': lineWidth(current, ratio),
    'stroke-linecap': 'round',
    'marker-end': 'url(#arrowhead-' + brush + ')',
    x1: a[0],
    y1: a[1],
    x2: b[0] - xo,
    y2: b[1] - yo,
  });
}

export function renderPiece(state: State, { shape }: Shape): sg.PieceNode | undefined {
  if (!shape.piece || isPiece(shape.orig)) return;

  const orig = shape.orig,
    scale = (shape.piece.scale || 1) * (state.scaleDownPieces ? 0.5 : 1);

  const pieceEl = createEl('piece', pieceNameOf(shape.piece)) as sg.PieceNode;
  pieceEl.sgKey = orig;
  pieceEl.sgScale = scale;
  translateRel(
    pieceEl,
    posToTranslateRel(state.dimensions)(key2pos(orig), sentePov(state.orientation)),
    state.scaleDownPieces ? 0.5 : 1,
    scale
  );

  return pieceEl;
}

function renderDescription(state: State, shape: DrawShape, arrowDests: ArrowDests): SVGElement | undefined {
  const orig = pieceOrKeyToPos(shape.orig, state);
  if (!orig || !shape.description) return;
  const dest = !samePieceOrKey(shape.orig, shape.dest) && pieceOrKeyToPos(shape.dest, state),
    diff = dest ? [dest[0] - orig[0], dest[1] - orig[1]] : [0, 0],
    offset = (arrowDests.get(isPiece(shape.dest) ? pieceNameOf(shape.dest) : shape.dest) || 0) > 1 ? 0.3 : 0.15,
    close =
      (diff[0] === 0 || Math.abs(diff[0]) === state.squareRatio[0]) &&
      (diff[1] === 0 || Math.abs(diff[1]) === state.squareRatio[1]),
    ratio = dest ? 0.55 - (close ? offset : 0) : 0,
    mid: sg.Pos = [orig[0] + diff[0] * ratio, orig[1] + diff[1] * ratio],
    textLength = shape.description.length;
  const g = setAttributes(createSVGElement('g'), { class: 'description' }),
    circle = setAttributes(createSVGElement('ellipse'), {
      cx: mid[0],
      cy: mid[1],
      rx: textLength + 1.5,
      ry: 2.5,
    }),
    text = setAttributes(createSVGElement('text'), {
      x: mid[0],
      y: mid[1],
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
    });
  g.appendChild(circle);
  text.appendChild(document.createTextNode(shape.description));
  g.appendChild(text);
  return g;
}

function renderMarker(brush: string): SVGElement {
  const marker = setAttributes(createSVGElement('marker'), {
    id: 'arrowhead-' + brush,
    orient: 'auto',
    markerWidth: 4,
    markerHeight: 8,
    refX: 2.05,
    refY: 2.01,
  });
  marker.appendChild(
    setAttributes(createSVGElement('path'), {
      d: 'M0,0 V4 L3,2 Z',
    })
  );
  marker.setAttribute('sgKey', brush);
  return marker;
}

export function setAttributes(el: SVGElement, attrs: { [key: string]: any }): SVGElement {
  for (const key in attrs) {
    if (Object.prototype.hasOwnProperty.call(attrs, key)) el.setAttribute(key, attrs[key]);
  }
  return el;
}

export function pos2user(pos: sg.Pos, color: sg.Color, dims: sg.Dimensions, ratio: sg.NumberPair): sg.NumberPair {
  return color === 'sente'
    ? [(dims.files - 1 - pos[0]) * ratio[0], pos[1] * ratio[1]]
    : [pos[0] * ratio[0], (dims.ranks - 1 - pos[1]) * ratio[1]];
}

export function isPiece(x: sg.Key | sg.Piece): x is sg.Piece {
  return typeof x === 'object';
}

export function samePieceOrKey(kp1: sg.Key | sg.Piece, kp2: sg.Key | sg.Piece): boolean {
  return (isPiece(kp1) && isPiece(kp2) && samePiece(kp1, kp2)) || kp1 === kp2;
}

export function usesBounds(shapes: DrawShape[]): boolean {
  return shapes.some(s => isPiece(s.orig) || isPiece(s.dest));
}

function shapeClass(brush: string, current: boolean, outside: boolean = false): string {
  return brush + (current ? ' current' : '') + (outside ? ' outside' : '');
}

function ratioAverage(ratio: sg.NumberPair): number {
  return (ratio[0] + ratio[1]) / 2;
}

function ellipseWidth(ratio: sg.NumberPair): [number, number] {
  return [(3 / 64) * ratioAverage(ratio), (4 / 64) * ratioAverage(ratio)];
}

function lineWidth(current: boolean, ratio: sg.NumberPair): number {
  return ((current ? 8.5 : 10) / 64) * ratioAverage(ratio);
}

function arrowMargin(shorten: boolean, ratio: sg.NumberPair): number {
  return ((shorten ? 20 : 10) / 64) * ratioAverage(ratio);
}

function pieceOrKeyToPos(kp: sg.Key | sg.Piece, state: State): sg.Pos | undefined {
  if (isPiece(kp)) {
    const pieceBounds = state.dom.bounds.hands.pieceBounds().get(pieceNameOf(kp)),
      bounds = state.dom.bounds.board.bounds(),
      offset = sentePov(state.orientation) ? [0.5, -0.5] : [-0.5, 0.5],
      pos =
        pieceBounds &&
        bounds &&
        posOfOutsideEl(
          pieceBounds.left + pieceBounds.width / 2,
          pieceBounds.top + pieceBounds.height / 2,
          sentePov(state.orientation),
          state.dimensions,
          bounds
        );
    return (
      pos && pos2user([pos[0] + offset[0], pos[1] + offset[1]], state.orientation, state.dimensions, state.squareRatio)
    );
  } else return pos2user(key2pos(kp), state.orientation, state.dimensions, state.squareRatio);
}
