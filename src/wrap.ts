import { HeadlessState } from './state.js';
import { setVisible, createEl } from './util.js';
import { colors, Notation, Elements, Dimensions } from './types.js';
import { createElement as createSVG, setAttributes } from './svg.js';

export function renderWrap(element: HTMLElement, s: HeadlessState, relative: boolean): Elements {
  // .sg-wrap (element passed to Shogiground)
  //     sg-container
  //       sg-hand
  //       sg-board
  //       svg.sg-grid
  //       sg-hand
  //       svg.sg-shapes
  //         defs
  //         g
  //       svg.sg-custom-svgs
  //         g
  //       coords.ranks
  //       coords.files
  //       piece.ghost

  element.innerHTML = '';

  // ensure the sg-wrap class is set
  // so bounds calculation can use the CSS width/height values
  // add that class yourself to the element before calling shogiground
  // for a slight performance improvement! (avoids recomputing style)
  element.classList.add('sg-wrap', `d-${s.dimensions.files}x${s.dimensions.ranks}`);

  for (const c of colors) element.classList.toggle('orientation-' + c, s.orientation === c);
  element.classList.toggle('manipulable', !s.viewOnly);

  const container = createEl('sg-container');
  element.appendChild(container);

  const board = createEl('sg-board');
  container.appendChild(board);

  let handTop, handBot;
  if (s.hands.enabled) {
    handTop = createEl('sg-hand', 'hand-top');
    handBot = createEl('sg-hand', 'hand-bot');
    container.insertBefore(handTop, board);
    container.insertBefore(handBot, board.nextSibling);
  }

  if (s.grid) container.insertBefore(makeGridSVG(s.dimensions), board.nextSibling);

  let svg: SVGElement | undefined;
  let customSvg: SVGElement | undefined;
  if (s.drawable.visible && !relative) {
    svg = setAttributes(createSVG('svg'), { class: 'sg-shapes' });
    svg.appendChild(createSVG('defs'));
    svg.appendChild(createSVG('g'));
    customSvg = setAttributes(createSVG('svg'), { class: 'sg-custom-svgs' });
    customSvg.appendChild(createSVG('g'));
    container.appendChild(svg);
    container.appendChild(customSvg);
  }

  if (s.coordinates.enabled) {
    const orientClass = s.orientation === 'gote' ? ' gote' : '';
    const ranks = ranksByNotation(s.coordinates.notation);
    container.appendChild(renderCoords(ranks, 'ranks' + orientClass, s.dimensions.ranks));
    container.appendChild(
      renderCoords(['9', '8', '7', '6', '5', '4', '3', '2', '1'], 'files' + orientClass, s.dimensions.files)
    );
  }

  let ghost: HTMLElement | undefined;
  if (s.draggable.showGhost && !relative) {
    ghost = createEl('piece', 'ghost');
    setVisible(ghost, false);
    container.appendChild(ghost);
  }

  return {
    board,
    handTop,
    handBot,
    container,
    ghost,
    svg,
    customSvg,
  };
}

function ranksByNotation(notation: Notation): string[] {
  switch (notation) {
    case Notation.JAPANESE:
      return ['九', '八', '七', '六', '五', '四', '三', '二', '一'];
    case Notation.WESTERN2:
      return ['i', 'h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
    default:
      return ['9', '8', '7', '6', '5', '4', '3', '2', '1'];
  }
}

function renderCoords(elems: readonly string[], className: string, trim: number): HTMLElement {
  const el = createEl('coords', className);
  let f: HTMLElement;
  for (const elem of elems.slice(-trim)) {
    f = createEl('coord');
    f.textContent = elem;
    el.appendChild(f);
  }
  return el;
}

function makeGridSVG(dims: Dimensions): SVGElement {
  const multiplier = 100;
  const svg = setAttributes(createSVG('svg'), {
    class: 'sg-grid',
    viewBox: `0 0 ${dims.files * multiplier} ${dims.ranks * multiplier}`,
    preserveAspectRatio: 'none',
  });

  const lines = setAttributes(createSVG('g'), {
    class: 'lines',
    'stroke-linecap': 'square',
  });
  for (let i = 0; i <= dims.ranks; i++) {
    lines.appendChild(
      setAttributes(createSVG('line'), {
        x1: 0,
        x2: dims.files * multiplier,
        y1: i * multiplier,
        y2: i * multiplier,
      })
    );
  }
  for (let i = 0; i <= dims.files; i++) {
    lines.appendChild(
      setAttributes(createSVG('line'), {
        x1: i * multiplier,
        x2: i * multiplier,
        y1: 0,
        y2: dims.ranks * multiplier,
      })
    );
  }
  const circles = setAttributes(createSVG('g'), {
    class: 'circles',
    'stroke-linecap': 'round',
  });

  // we use line instead of circle, so the radius stays the same on non square boards
  const offsetX = Math.floor(dims.files / 3);
  const offsetY = Math.floor(dims.ranks / 3);
  for (const x of [false, true])
    for (const y of [false, true])
      circles.appendChild(
        setAttributes(createSVG('line'), {
          x1: (x ? dims.files - offsetX : offsetX) * multiplier,
          x2: (x ? dims.files - offsetX : offsetX) * multiplier,
          y1: (y ? dims.ranks - offsetY : offsetY) * multiplier,
          y2: (y ? dims.ranks - offsetY : offsetY) * multiplier,
        })
      );

  svg.appendChild(lines);
  svg.appendChild(circles);
  return svg;
}
