import { HeadlessState } from './state';
import { setVisible, createEl } from './util';
import { colors, Notation, Elements } from './types';
import { createElement as createSVG, setAttributes } from './svg';

export function renderWrap(element: HTMLElement, s: HeadlessState, relative: boolean): Elements {
  // .sg-wrap (element passed to Shogiground)
  //     sg-container
  //       sg-hand
  //       sg-board
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
    if (s.notation === Notation.WESTERN || s.notation === Notation.KAWASAKI) {
      container.appendChild(
        renderCoords(['9', '8', '7', '6', '5', '4', '3', '2', '1'], 'ranks' + orientClass, s.dimensions.ranks)
      );
    } else if (s.notation === Notation.WESTERN2) {
      container.appendChild(
        renderCoords(['i', 'h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'], 'ranks' + orientClass, s.dimensions.ranks)
      );
    } else {
      container.appendChild(
        renderCoords(['九', '八', '七', '六', '五', '四', '三', '二', '一'], 'ranks' + orientClass, s.dimensions.ranks)
      );
    }
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
