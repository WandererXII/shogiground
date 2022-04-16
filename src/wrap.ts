import { HeadlessState } from './state.js';
import { createEl, opposite, pieceNameOf, pos2key, setDisplay } from './util.js';
import {
  colors,
  Notation,
  Dimensions,
  SquareNode,
  Color,
  PieceNode,
  Role,
  WrapElements,
  DomBoardElements,
  DomHandsElements,
} from './types.js';
import { createSVGElement, setAttributes } from './shapes.js';

export function wrapBoard(wrapElements: WrapElements, s: HeadlessState): DomBoardElements {
  // .sg-wrap (element passed to Shogiground)
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
    setDisplay(dragged, !!s.draggable.current);
    board.appendChild(dragged);

    promotion = createEl('sg-promotion');
    setDisplay(promotion, !!s.promotion.current);
    board.appendChild(promotion);

    squareOver = createEl('sg-square-over');
    setDisplay(squareOver, !!s.draggable.current?.touch);
    board.appendChild(squareOver);
  }

  let svg: SVGElement | undefined;
  let customSvg: SVGElement | undefined;
  let freePieces: HTMLElement | undefined;

  if (s.drawable.visible) {
    svg = setAttributes(createSVGElement('svg'), {
      class: 'sg-shapes',
      viewBox: `-${s.squareRatio[0] / 2} -${s.squareRatio[1] / 2} ${s.dimensions.files * s.squareRatio[0]} ${
        s.dimensions.ranks * s.squareRatio[1]
      }`,
    });
    svg.appendChild(createSVGElement('defs'));
    svg.appendChild(createSVGElement('g'));

    customSvg = setAttributes(createSVGElement('svg'), {
      class: 'sg-custom-svgs',
      viewBox: `0 0 ${s.dimensions.files * s.squareRatio[0]} ${s.dimensions.ranks * s.squareRatio[1]}`,
    });
    customSvg.appendChild(createSVGElement('g'));

    freePieces = createEl('sg-free-pieces');

    board.appendChild(svg);
    board.appendChild(customSvg);
    board.appendChild(freePieces);
  }

  if (s.coordinates.enabled) {
    const orientClass = s.orientation === 'gote' ? ' gote' : '';
    const ranks = ranksByNotation(s.coordinates.notation);
    board.appendChild(renderCoords(ranks, 'ranks' + orientClass, s.dimensions.ranks));
    board.appendChild(
      renderCoords(
        ['12', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'],
        'files' + orientClass,
        s.dimensions.files
      )
    );
  }

  wrapElements.board.innerHTML = '';

  // ensure the sg-wrap class and dimensions class i set beforehand to avoid recomputing style
  wrapElements.board.classList.add('sg-wrap', `d-${s.dimensions.files}x${s.dimensions.ranks}`);

  for (const c of colors) wrapElements.board.classList.toggle('orientation-' + c, s.orientation === c);
  wrapElements.board.classList.toggle('manipulable', !s.viewOnly);

  wrapElements.board.appendChild(board);

  return {
    board,
    squares,
    pieces,
    promotion,
    squareOver,
    dragged,
    svg,
    customSvg,
    freePieces,
  };
}

export function wrapHands(wrapElements: WrapElements, s: HeadlessState): DomHandsElements {
  let handTop, handBottom;
  if (s.hands.inlined || wrapElements.handTop || wrapElements.handBottom) {
    handTop = renderHand(opposite(s.orientation), s.hands.roles);
    handBottom = renderHand(s.orientation, s.hands.roles);
    if (s.hands.inlined && wrapElements.board.firstElementChild) {
      wrapElements.board.insertBefore(handTop, wrapElements.board.firstElementChild);
      wrapElements.board.insertBefore(handBottom, wrapElements.board.firstElementChild.nextElementSibling);
    } else {
      if (wrapElements.handTop) {
        wrapElements.handTop.innerHTML = '';
        wrapElements.handTop.classList.add('hand-top');
        wrapElements.handTop.appendChild(handTop);
      }
      if (wrapElements.handBottom) {
        wrapElements.handBottom.innerHTML = '';
        wrapElements.handBottom.classList.add('hand-bottom');
        wrapElements.handBottom.appendChild(handBottom);
      }
    }
  }
  return {
    top: handTop,
    bottom: handBottom,
  };
}

function ranksByNotation(notation: Notation): string[] {
  switch (notation) {
    case Notation.JAPANESE:
      return ['十二', '十一', '十', '九', '八', '七', '六', '五', '四', '三', '二', '一'];
    case Notation.WESTERN2:
      return ['l', 'k', 'j', 'i', 'h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
    default:
      return ['12', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
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

function renderSquares(dims: Dimensions, orientation: Color): HTMLElement {
  const squares = createEl('sg-squares');

  for (let i = 0; i < dims.ranks * dims.files; i++) {
    const sq = createEl('sq') as SquareNode;
    sq.sgKey =
      orientation === 'sente'
        ? pos2key([dims.files - 1 - (i % dims.files), Math.floor(i / dims.files)])
        : pos2key([i % dims.files, dims.files - 1 - Math.floor(i / dims.files)]);
    squares.appendChild(sq);
  }

  return squares;
}

function renderHand(color: Color, roles: Role[]): HTMLElement {
  const hand = createEl('sg-hand');
  for (const role of roles) {
    const piece = { role: role, color: color },
      pieceEl = createEl('piece', pieceNameOf(piece)) as PieceNode;
    pieceEl.sgColor = color;
    pieceEl.sgRole = role;
    hand.appendChild(pieceEl);
  }
  return hand;
}
