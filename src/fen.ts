import { pos2key, invRanks } from './util'
import * as cg from './types'

export const initial: cg.FEN = 'rnbskbnr/pppppppp/8/8/8/8/8/PPPPPPPP/RNBQKBNR';

const roles: { [letter: string]: cg.Role } = {
  'p': 'pawn', 'l': 'lance', 'n': 'knight', 's': 'silver', 'g': 'gold', 'b': 'bishop', 'r': 'rook', 'k': 'king',
  '+p': 'p_pawn', '+l': 'p_lance', '+n': 'p_knight', '+s': 'p_silver', '+b': 'p_bishop', '+r': 'p_rook'
};

const letters = {
  pawn: 'p', lance: 'l', knight: 'n', silver: 's', gold: 'g', bishop: 'b', rook: 'r', king: 'k',
  p_pawn: '+p', p_lance: '+l', p_knight: '+n', p_silver: '+s', p_bishop: '+b', p_rook: '+r'
};

export function read(sfen: cg.FEN): cg.Pieces {
  if (sfen === 'start') sfen = initial;
  const pieces: cg.Pieces = new Map();
  let row = 8, col = 0;
  for (let i = 0; i < sfen.length; i++) {
    switch (sfen[i]) {
      case ' ': return pieces;
      case '/':
        --row;
        if (row < 0) return pieces;
        col = 0;
        break;
      case '~':
        const piece = pieces.get(pos2key([col, row]));
        if (piece) piece.promoted = true;
        break;
      default:
        const nb = sfen[i].charCodeAt(0);
        if (nb < 58) col += nb - 48;
        else {
          var role = sfen[i].toLowerCase();
          if (role == "+" && sfen.length > i + 1) {
            role += sfen[++i]
          }
          pieces.set(pos2key([col, row]), {
            role: roles[role],
            color: sfen[i] === role ? 'black' : 'white',
          });
          ++col;
        }
    }
  }
  return pieces;
}

export function write(pieces: cg.Pieces): cg.FEN {
  return invRanks.map(y => cg.files.map(x => {
    const piece = pieces.get(x + y as cg.Key);
    if (piece) {
      const letter = letters[piece.role];
      return piece.color === 'white' ? letter.toUpperCase() : letter;
    } else return '1';
  }).join('')
  ).join('/').replace(/1{2,}/g, s => s.length.toString());
}
