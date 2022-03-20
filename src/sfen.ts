import { pos2key } from './util.js';
import * as sg from './types.js';

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

export function inferDimensions(boardSfen: sg.BoardSfen): sg.Dimensions {
  const ranks = boardSfen.split('/');
  const firstFile = ranks[0].split('');
  let filesCnt = 0;
  let cnt = 0;
  for (const c of firstFile) {
    const nb = c.charCodeAt(0);
    if (nb < 58 && nb > 47) cnt = cnt * 10 + nb - 48;
    else {
      filesCnt += cnt + 1;
      cnt = 0;
    }
  }
  filesCnt += cnt;
  return { files: filesCnt, ranks: ranks.length };
}

export function readBoard(sfen: sg.BoardSfen, dims: sg.Dimensions): sg.Pieces {
  const pieces: sg.Pieces = new Map();
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
        const nb1 = sfen[i].charCodeAt(0),
          nb2 = sfen[i + 1] && sfen[i + 1].charCodeAt(0);
        if (nb1 < 58 && nb1 > 47) {
          if (nb2 && nb2 < 58 && nb2 > 47) {
            x -= (nb1 - 48) * 10 + (nb2 - 48);
            i++;
          } else x -= nb1 - 48;
        } else {
          const roleStr = (sfen[i] === '+' && sfen.length > i + 1 ? '+' + sfen[++i] : sfen[i]).toLowerCase();
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

export function writeBoard(pieces: sg.Pieces, dims: sg.Dimensions): sg.BoardSfen {
  const reversedFiles = sg.files.slice(dims.files).reverse();
  return sg.ranks
    .slice(dims.ranks)
    .map(y =>
      reversedFiles
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
      const roleStr = (str[i] === '+' && str.length > i + 1 ? '+' + str[++i] : str[i]).toLowerCase();
      const role = stringToRole(roleStr);
      if (role) {
        const color = str[i] === roleStr || '+' + str[i] === roleStr ? 'gote' : 'sente';
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

export function writeHands(hands: sg.Hands, roles: sg.Role[]): sg.HandsSfen {
  let senteHandStr = '';
  let goteHandStr = '';
  for (const role of roles) {
    const senteCnt = hands.get('sente')?.get(role);
    const goteCnt = hands.get('gote')?.get(role);
    if (senteCnt) senteHandStr += senteCnt > 1 ? senteCnt.toString() + letters[role] : letters[role];
    if (goteCnt) goteHandStr += goteCnt > 1 ? goteCnt.toString() + letters[role] : letters[role];
  }
  if (senteHandStr || goteHandStr) return senteHandStr.toUpperCase() + goteHandStr;
  return '-';
}
