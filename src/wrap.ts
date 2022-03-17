import { HeadlessState } from './state.js';
import { createEl, opposite, pieceNameOf, pos2key, setDisplay } from './util.js';
import { colors, Notation, Elements, Dimensions, SquareNode, Color, PieceNode, Role, WrapElements } from './types.js';
import { createSVGElement, setAttributes } from './shapes.js';

export function renderWrap(wrapElements: WrapElements, s: HeadlessState, relative: boolean): Elements {
  // .sg-wrap (element passed to Shogiground)
  //     sg-hand  // if inlined
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
  //     sg-hand // if inlined

  wrapElements.board.innerHTML = '';

  // ensure the sg-wrap class is set
  // so bounds calculation can use the CSS width/height values
  // add that class yourself to the element before calling shogiground
  // for a slight performance improvement! (avoids recomputing style)
  wrapElements.board.classList.add('sg-wrap', `d-${s.dimensions.files}x${s.dimensions.ranks}`);

  for (const c of colors) wrapElements.board.classList.toggle('orientation-' + c, s.orientation === c);
  wrapElements.board.classList.toggle('manipulable', !s.viewOnly);

  const board = createEl('sg-board');
  wrapElements.board.appendChild(board);

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
    setDisplay(promotion, s.promotion.active);
    board.appendChild(promotion);

    squareOver = createEl('sg-square-over');
    setDisplay(squareOver, !!s.draggable.current?.touch);
    board.appendChild(squareOver);
  }

  let handTop, handBottom;
  if (s.hands.inlined || wrapElements.handTop || wrapElements.handBottom) {
    handTop = renderHand(opposite(s.orientation), s.hands.roles, 'top');
    handBottom = renderHand(s.orientation, s.hands.roles, 'bottom');
    if (s.hands.inlined) {
      wrapElements.board.insertBefore(handTop, board);
      wrapElements.board.insertBefore(handBottom, board.nextElementSibling);
    } else {
      if (wrapElements.handTop) {
        wrapElements.handTop.innerHTML = '';
        wrapElements.handTop.appendChild(handTop);
      }
      if (wrapElements.handBottom) {
        wrapElements.handBottom.innerHTML = '';
        wrapElements.handBottom.appendChild(handBottom);
      }
    }
  }

  let svg: SVGElement | undefined;
  let customSvg: SVGElement | undefined;
  let freePieces: HTMLElement | undefined;

  if (s.drawable.visible && !relative) {
    svg = setAttributes(createSVGElement('svg'), {
      class: 'sg-shapes',
      viewBox: `-0.5 -0.5 ${s.dimensions.files} ${s.dimensions.ranks}`,
      preserveAspectRatio: 'none',
    });
    svg.appendChild(createSVGElement('defs'));
    svg.appendChild(createSVGElement('g'));

    customSvg = setAttributes(createSVGElement('svg'), {
      class: 'sg-custom-svgs',
      viewBox: `0 0 ${s.dimensions.files} ${s.dimensions.ranks}`,
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
      renderCoords(['9', '8', '7', '6', '5', '4', '3', '2', '1'], 'files' + orientClass, s.dimensions.files)
    );
  }

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
    handTop,
    handBottom,
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

function renderHand(color: Color, roles: Role[], position: 'top' | 'bottom'): HTMLElement {
  const hand = createEl('sg-hand', `hand-${position}`);
  for (const role of roles) {
    const piece = { role: role, color: color },
      pieceEl = createEl('piece', pieceNameOf(piece)) as PieceNode;
    pieceEl.sgColor = color;
    pieceEl.sgRole = role;
    hand.appendChild(pieceEl);
  }
  return hand;
}
