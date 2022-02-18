import * as sg from './types.js';
import * as util from './util.js';

function lastRow(dims: sg.Dimensions, pos: sg.Pos, color: sg.Color): boolean {
  return color === 'sente' ? pos[1] === 0 : pos[1] === dims.ranks - 1;
}

function lastTwoRows(dims: sg.Dimensions, pos: sg.Pos, color: sg.Color): boolean {
  return lastRow(dims, pos, color) || (color === 'sente' ? pos[1] === 1 : pos[1] === dims.ranks - 2);
}

export function predrop(pieces: sg.Pieces, dropPiece: sg.Piece, dims: sg.Dimensions): sg.Key[] {
  const color = dropPiece.color;
  const role = dropPiece.role;
  return util.allKeys.filter(key => {
    const p = pieces.get(key);
    const pos = util.key2pos(key);
    return (
      (!p || p.color !== color) &&
      pos[0] < dims.files &&
      pos[1] < dims.ranks &&
      (role === 'pawn' || role === 'lance'
        ? !lastRow(dims, pos, color)
        : role === 'knight'
        ? !lastTwoRows(dims, pos, color)
        : true)
    );
  });
}
