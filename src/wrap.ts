import { HeadlessState } from './state';
import { setVisible, createEl, dimensions } from './util';
import { colors, Notation, Elements, Variant } from './types';
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

  let handTop, handBot;
  if (s.renderHands) {
    handTop = createEl('sg-hand', 'hand-top');
    handBot = createEl('sg-hand', 'hand-bot');
    container.appendChild(handTop);
    container.appendChild(board);
    container.appendChild(handBot);
  } else {
    container.appendChild(board);
  }

  if (s.grid) {
    const grid = createEl('sg-grid');
    grid.innerHTML = gridSvg('shogi');
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

function gridSvg(variant: Variant): string {
  switch (variant) {
    case 'minishogi':
      return `<svg viewBox="0 0 250 250" preserveAspectRatio="none"><path d="M0 0h250M0 50h250M0 100h250M0 150h250M0 200h250M0 250h250M0 0v250M50 0v250M100 0v250M150 0v250M200 0v250M250 0v250"/><circle cx="50" cy="50" r="4"/><circle cx="50" cy="200" r="4"/><circle cx="200" cy="50" r="4"/><circle cx="200" cy="200" r="4"/></svg>`;
    default:
      return `<svg viewBox="0 0 810 810" preserveAspectRatio="none"><path d="M0 0h810M0 90h810M0 180h810M0 270h810M0 360h810M0 450h810M0 540h810M0 630h810M0 720h810M0 810h810M0 0v810M90 0v810M180 0v810M270 0v810M360 0v810M450 0v810M540 0v810M630 0v810M720 0v810M810 0v810"/><circle cx="270" cy="270" r="8"/><circle cx="540" cy="270" r="8"/><circle cx="270" cy="540" r="8"/><circle cx="540" cy="540" r="8"/></svg>`;
  }
}
