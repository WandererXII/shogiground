import { pos2key, invFiles, dimensions } from './util';
import * as sg from './types';

export const initial: sg.BoardSfen = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL';

export function stringToRole(ch: string): sg.Role | undefined {
  switch (ch) {
    case 'p':
      return 'pawn';
    case 'l':
      return 'lance';
    case 'n':
      return 'knight';
    case 's':
      return 'silver';
    case 'g':
      return 'gold';
    case 'b':
      return 'bishop';
    case 'r':
      return 'rook';
    case '+p':
      return 'tokin';
    case '+l':
      return 'promotedlance';
    case '+n':
      return 'promotedknight';
    case '+s':
      return 'promotedsilver';
    case '+b':
      return 'horse';
    case '+r':
      return 'dragon';
    case 'k':
      return 'king';
    default:
      return;
  }
}
const letters = {
  pawn: 'p',
  lance: 'l',
  knight: 'n',
  silver: 's',
  gold: 'g',
  bishop: 'b',
  rook: 'r',
  king: 'k',
  tokin: '+p',
  promotedlance: '+l',
  promotedknight: '+n',
  promotedsilver: '+s',
  horse: '+b',
  dragon: '+r',
};

export function readBoard(sfen: sg.BoardSfen, variant: sg.Variant): sg.Pieces {
  const pieces: sg.Pieces = new Map();
  const dims = dimensions(variant);
  let x = dims.files - 1,
    y = 0;
  for (let i = 0; i < sfen.length; i++) {
    switch (sfen[i]) {
      case ' ':
      case '_':
        return pieces;
      case '/':
        ++y;
        if (y > dims.ranks - 1) return pieces;
        x = dims.files - 1;
        break;
      default: {
        const nb = sfen[i].charCodeAt(0);
        if (nb < 58 && nb > 47) x -= nb - 48;
        else {
          const roleStr =
            sfen[i] === '+' && sfen.length > i + 1 ? '+' + sfen[++i].toLowerCase() : sfen[i].toLowerCase();
          const role = stringToRole(roleStr);
          if (x >= 0 && role) {
            const color = sfen[i] === roleStr || '+' + sfen[i] === roleStr ? 'gote' : 'sente';
            pieces.set(pos2key([x, y]), {
              role: role,
              color: color,
            });
          }
          --x;
        }
      }
    }
  }
  return pieces;
}

export function writeBoard(pieces: sg.Pieces): sg.BoardSfen {
  return sg.ranks
    .map(y =>
      invFiles
        .map(x => {
          const piece = pieces.get((x + y) as sg.Key);
          if (piece) {
            const letter = letters[piece.role];
            return piece.color === 'sente' ? letter.toUpperCase() : letter;
          } else return '1';
        })
        .join('')
    )
    .join('/')
    .replace(/1{2,}/g, s => s.length.toString());
}

export function readHands(str: sg.HandsSfen): sg.Hands {
  const sente = new Map();
  const gote = new Map();

  let tmpNum = 0;
  let num = 1;
  for (let i = 0; i < str.length; i++) {
    const nb = str[i].charCodeAt(0);
    if (nb < 58 && nb > 47) {
      tmpNum = tmpNum * 10 + nb - 48;
      num = tmpNum;
    } else {
      const roleStr = str[i] === '+' && str.length > i + 1 ? '+' + str[++i].toLowerCase() : str[i].toLowerCase();
      const role = stringToRole(roleStr);
      if (role) {
        const color = str[i] === role || '+' + str[i] === role ? 'gote' : 'sente';
        if (color === 'sente') sente.set(role, (sente.get(role) || 0) + num);
        else gote.set(role, (gote.get(role) || 0) + num);
      }
      tmpNum = 0;
      num = 1;
    }
  }

  return new Map([
    ['sente', sente],
    ['gote', gote],
  ]);
}

// todo
// export function writeHands()
