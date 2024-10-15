import type { State } from './state.js';
import type { Dimensions, SquareNode, Color, PieceNode, RoleString, HandElements, BoardElements } from './types.js';
import { colors } from './constants.js';
import { createEl, opposite, pieceNameOf, pos2key, setDisplay } from './util.js';
import { createSVGElement, setAttributes } from './shapes.js';
import { coords } from './notation.js';

export function wrapBoard(boardWrap: HTMLElement, s: State): BoardElements {
  // .sg-wrap (element passed to Shogiground)
  //     sg-hand-wrap
  //     sg-board
  //       sg-squares
  //       sg-pieces
  //       piece dragging
  //       sg-promotion
  //       sg-square-over
  //       svg.sg-shapes
  //         defs
  //         g
  //       svg.sg-custom-svgs
  //         g
  //     sg-hand-wrap
  //     sg-free-pieces
  //       coords.ranks
  //       coords.files

  const board = createEl('sg-board');

  const squares = renderSquares(s.dimensions, s.orientation);
  board.appendChild(squares);

  const pieces = createEl('sg-pieces');
  board.appendChild(pieces);

  let dragged, promotion, squareOver;
  if (!s.viewOnly) {
    dragged = createEl('piece') as PieceNode;
    setDisplay(dragged, false);
    board.appendChild(dragged);

    promotion = createEl('sg-promotion');
    setDisplay(promotion, false);
    board.appendChild(promotion);

    squareOver = createEl('sg-square-over');
    setDisplay(squareOver, false);
    board.appendChild(squareOver);
  }

  let shapes;
  if (s.drawable.visible) {
    const svg = setAttributes(createSVGElement('svg'), {
      class: 'sg-shapes',
      viewBox: `-${s.squareRatio[0] / 2} -${s.squareRatio[1] / 2} ${s.dimensions.files * s.squareRatio[0]} ${
        s.dimensions.ranks * s.squareRatio[1]
      }`,
    });
    svg.appendChild(createSVGElement('defs'));
    svg.appendChild(createSVGElement('g'));

    const customSvg = setAttributes(createSVGElement('svg'), {
      class: 'sg-custom-svgs',
      viewBox: `0 0 ${s.dimensions.files * s.squareRatio[0]} ${s.dimensions.ranks * s.squareRatio[1]}`,
    });
    customSvg.appendChild(createSVGElement('g'));

    const freePieces = createEl('sg-free-pieces');

    board.appendChild(svg);
    board.appendChild(customSvg);
    board.appendChild(freePieces);

    shapes = {
      svg,
      freePieces,
      customSvg,
    };
  }

  if (s.coordinates.enabled) {
    const orientClass = s.orientation === 'gote' ? ' gote' : '',
      ranks = coords(s.coordinates.ranks),
      files = coords(s.coordinates.files);
    board.appendChild(renderCoords(ranks, 'ranks' + orientClass, s.dimensions.ranks));
    board.appendChild(renderCoords(files, 'files' + orientClass, s.dimensions.files));
  }

  boardWrap.innerHTML = '';

  const dimCls = `d-${s.dimensions.files}x${s.dimensions.ranks}`;

  // remove all other dimension classes
  boardWrap.classList.forEach(c => {
    if (c.substring(0, 2) === 'd-' && c !== dimCls) boardWrap.classList.remove(c);
  });

  // ensure the sg-wrap class and dimensions class is set beforehand to avoid recomputing styles
  boardWrap.classList.add('sg-wrap', dimCls);

  for (const c of colors) boardWrap.classList.toggle('orientation-' + c, s.orientation === c);
  boardWrap.classList.toggle('manipulable', !s.viewOnly);

  boardWrap.appendChild(board);

  let hands: HandElements | undefined;
  if (s.hands.inlined) {
    const handWrapTop = createEl('sg-hand-wrap', 'inlined'),
      handWrapBottom = createEl('sg-hand-wrap', 'inlined');
    boardWrap.insertBefore(handWrapBottom, board.nextElementSibling);
    boardWrap.insertBefore(handWrapTop, board);
    hands = {
      top: handWrapTop,
      bottom: handWrapBottom,
    };
  }

  return {
    board,
    squares,
    pieces,
    promotion,
    squareOver,
    dragged,
    shapes,
    hands,
  };
}

export function wrapHand(handWrap: HTMLElement, pos: 'top' | 'bottom', s: State): HTMLElement {
  const hand = renderHand(pos === 'top' ? opposite(s.orientation) : s.orientation, s.hands.roles);
  handWrap.innerHTML = '';

  const roleCntCls = `r-${s.hands.roles.length}`;

  // remove all other role count classes
  handWrap.classList.forEach(c => {
    if (c.substring(0, 2) === 'r-' && c !== roleCntCls) handWrap.classList.remove(c);
  });

  // ensure the sg-hand-wrap class, hand pos class and role number class is set beforehand to avoid recomputing styles
  handWrap.classList.add('sg-hand-wrap', `hand-${pos}`, roleCntCls);
  handWrap.appendChild(hand);

  for (const c of colors) handWrap.classList.toggle('orientation-' + c, s.orientation === c);
  handWrap.classList.toggle('manipulable', !s.viewOnly);

  return hand;
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

function renderSquares(dims: Dimensions, orientation: Color): HTMLElement {
  const squares = createEl('sg-squares');

  for (let i = 0; i < dims.ranks * dims.files; i++) {
    const sq = createEl('sq') as SquareNode;
    sq.sgKey =
      orientation === 'sente'
        ? pos2key([dims.files - 1 - (i % dims.files), Math.floor(i / dims.files)])
        : pos2key([i % dims.files, dims.ranks - 1 - Math.floor(i / dims.files)]);
    squares.appendChild(sq);
  }

  return squares;
}

function renderHand(color: Color, roles: RoleString[]): HTMLElement {
  const hand = createEl('sg-hand');
  for (const role of roles) {
    const piece = { role: role, color: color },
      wrapEl = createEl('sg-hp-wrap'),
      pieceEl = createEl('piece', pieceNameOf(piece)) as PieceNode;
    pieceEl.sgColor = color;
    pieceEl.sgRole = role;
    wrapEl.appendChild(pieceEl);
    hand.appendChild(wrapEl);
  }
  return hand;
}
