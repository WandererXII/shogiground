import { HeadlessState } from './state';
import { setVisible, createEl, dimensions } from './util';
import { colors, Notation, Elements, Dimensions } from './types';
import { createElement as createSVG, setAttributes } from './svg';

export function renderWrap(element: HTMLElement, s: HeadlessState, relative: boolean): Elements {
  // .sg-wrap (element passed to Shogiground)
  //     sg-container
  //       sg-hand
  //       sg-board
  //       sg-grid
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
  element.classList.add('sg-wrap', `v-${s.variant}`);

  for (const c of colors) element.classList.toggle('orientation-' + c, s.orientation === c);
  element.classList.toggle('manipulable', !s.viewOnly);

  const container = createEl('sg-container');
  element.appendChild(container);

  const board = createEl('sg-board');
  container.appendChild(board);

  let handTop, handBot;
  if (s.renderHands) {
    handTop = createEl('sg-hand', 'hand-top');
    handBot = createEl('sg-hand', 'hand-bot');
    container.insertBefore(handTop, board);
    container.insertBefore(handBot, board.nextSibling);
  }

  if (s.grid) {
    const grid = createEl('sg-grid');
    grid.innerHTML = createGridSvg(dimensions(s.variant));

    container.insertBefore(grid, board.nextSibling);
  }

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

  if (s.coordinates) {
    const orientClass = s.orientation === 'gote' ? ' gote' : '';
    const dims = dimensions(s.variant);
    if (s.notation === Notation.WESTERN || s.notation === Notation.KAWASAKI) {
      container.appendChild(
        renderCoords(['9', '8', '7', '6', '5', '4', '3', '2', '1'], 'ranks' + orientClass, dims.ranks)
      );
    } else if (s.notation === Notation.WESTERN2) {
      container.appendChild(
        renderCoords(['i', 'h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'], 'ranks' + orientClass, dims.ranks)
      );
    } else {
      container.appendChild(
        renderCoords(['九', '八', '七', '六', '五', '四', '三', '二', '一'], 'ranks' + orientClass, dims.ranks)
      );
    }
    container.appendChild(
      renderCoords(['9', '8', '7', '6', '5', '4', '3', '2', '1'], 'files' + orientClass, dims.files)
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

function createGridSvg(dims: Dimensions): string {
  const multiplier = 90;
  const width = dims.files * multiplier;
  const height = dims.ranks * multiplier;
  const openingTag = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">`;
  const closingTag = '</svg>';

  const hLines: string[] = [];
  for (let i = 0; i <= dims.ranks; i++)
    hLines.push(`<line x1="0" y1="${multiplier * i}" x2="${width}" y2="${multiplier * i}" />`);

  const vLines: string[] = [];
  for (let i = 0; i <= dims.files; i++)
    vLines.push(`<line x1="${multiplier * i}" y1="0" x2="${multiplier * i}" y2="${height}" />`);

  const circles: string[] = [];
  const radius = Math.floor((width + height) / 2 / multiplier);
  const offsetX = Math.floor(dims.files / 3);
  const offsetY = Math.floor(dims.ranks / 3);
  circles.push(`<circle cx="${offsetX * multiplier}" cy="${offsetY * multiplier}" r="${radius}" stroke="none" />`);
  circles.push(
    `<circle cx="${offsetX * multiplier}" cy="${height - offsetY * multiplier}" r="${radius}" stroke="none" />`
  );
  circles.push(
    `<circle cx="${width - offsetX * multiplier}" cy="${offsetY * multiplier}" r="${radius}" stroke="none" />`
  );
  circles.push(
    `<circle cx="${width - offsetX * multiplier}" cy="${height - offsetY * multiplier}" r="${radius}" stroke="none" />`
  );

  return openingTag + hLines.join('') + vLines.join('') + circles.join('') + closingTag;
}
