import type * as sg from './types.js';
import { files, ranks } from './constants.js';
import { pos2key } from './util.js';

export function inferDimensions(boardSfen: sg.BoardSfen): sg.Dimensions {
  const ranks = boardSfen.split('/'),
    firstFile = ranks[0].split('');
  let filesCnt = 0,
    cnt = 0;
  for (const c of firstFile) {
    const nb = c.charCodeAt(0);
    if (nb < 58 && nb > 47) cnt = cnt * 10 + nb - 48;
    else if (c !== '+') {
      filesCnt += cnt + 1;
      cnt = 0;
    }
  }
  filesCnt += cnt;
  return { files: filesCnt, ranks: ranks.length };
}

export function sfenToBoard(
  sfen: sg.BoardSfen,
  dims: sg.Dimensions,
  fromForsyth?: (forsyth: string) => sg.RoleString | undefined,
): sg.Pieces {
  const sfenParser = fromForsyth || standardFromForsyth,
    pieces: sg.Pieces = new Map();
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
          const roleStr = sfen[i] === '+' && sfen.length > i + 1 ? '+' + sfen[++i] : sfen[i],
            role = sfenParser(roleStr);
          if (x >= 0 && role) {
            const color = roleStr === roleStr.toLowerCase() ? 'gote' : 'sente';
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

export function boardToSfen(
  pieces: sg.Pieces,
  dims: sg.Dimensions,
  toForsyth?: (role: sg.RoleString) => string | undefined,
): sg.BoardSfen {
  const sfenRenderer = toForsyth || standardToForsyth,
    reversedFiles = files.slice(0, dims.files).reverse();
  return ranks
    .slice(0, dims.ranks)
    .map((y) =>
      reversedFiles
        .map((x) => {
          const piece = pieces.get((x + y) as sg.Key),
            forsyth = piece && sfenRenderer(piece.role);
          if (forsyth) {
            return piece.color === 'sente' ? forsyth.toUpperCase() : forsyth.toLowerCase();
          } else return '1';
        })
        .join(''),
    )
    .join('/')
    .replace(/1{2,}/g, (s) => s.length.toString());
}

export function sfenToHands(
  sfen: sg.HandsSfen,
  fromForsyth?: (forsyth: string) => sg.RoleString | undefined,
): sg.Hands {
  const sfenParser = fromForsyth || standardFromForsyth,
    sente: sg.Hand = new Map(),
    gote: sg.Hand = new Map();

  let tmpNum = 0,
    num = 1;
  for (let i = 0; i < sfen.length; i++) {
    const nb = sfen[i].charCodeAt(0);
    if (nb < 58 && nb > 47) {
      tmpNum = tmpNum * 10 + nb - 48;
      num = tmpNum;
    } else {
      const roleStr = sfen[i] === '+' && sfen.length > i + 1 ? '+' + sfen[++i] : sfen[i],
        role = sfenParser(roleStr);
      if (role) {
        const color = roleStr === roleStr.toLowerCase() ? 'gote' : 'sente';
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

export function handsToSfen(
  hands: sg.Hands,
  roles: sg.RoleString[],
  toForsyth?: (role: sg.RoleString) => string | undefined,
): sg.HandsSfen {
  const sfenRenderer = toForsyth || standardToForsyth;

  let senteHandStr = '',
    goteHandStr = '';
  for (const role of roles) {
    const forsyth = sfenRenderer(role);
    if (forsyth) {
      const senteCnt = hands.get('sente')?.get(role),
        goteCnt = hands.get('gote')?.get(role);
      if (senteCnt) senteHandStr += senteCnt > 1 ? senteCnt.toString() + forsyth : forsyth;
      if (goteCnt) goteHandStr += goteCnt > 1 ? goteCnt.toString() + forsyth : forsyth;
    }
  }
  if (senteHandStr || goteHandStr) return senteHandStr.toUpperCase() + goteHandStr.toLowerCase();
  else return '-';
}

function standardFromForsyth(forsyth: string): sg.RoleString | undefined {
  switch (forsyth.toLowerCase()) {
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
export function standardToForsyth(role: string): string | undefined {
  switch (role) {
    case 'pawn':
      return 'p';
    case 'lance':
      return 'l';
    case 'knight':
      return 'n';
    case 'silver':
      return 's';
    case 'gold':
      return 'g';
    case 'bishop':
      return 'b';
    case 'rook':
      return 'r';
    case 'tokin':
      return '+p';
    case 'promotedlance':
      return '+l';
    case 'promotedknight':
      return '+n';
    case 'promotedsilver':
      return '+s';
    case 'horse':
      return '+b';
    case 'dragon':
      return '+r';
    case 'king':
      return 'k';
    default:
      return;
  }
}
