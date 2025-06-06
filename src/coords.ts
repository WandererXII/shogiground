import type { Notation } from './types.js';

export function coords(notation: Notation): string[] {
  switch (notation) {
    case 'dizhi':
      return [
        '',
        '',
        '',
        '',
        '亥',
        '戌',
        '酉',
        '申',
        '未',
        '午',
        '巳',
        '辰',
        '卯',
        '寅',
        '丑',
        '子',
      ];
    case 'japanese':
      return [
        '十六',
        '十五',
        '十四',
        '十三',
        '十二',
        '十一',
        '十',
        '九',
        '八',
        '七',
        '六',
        '五',
        '四',
        '三',
        '二',
        '一',
      ];
    case 'engine':
      return ['p', 'o', 'n', 'm', 'l', 'k', 'j', 'i', 'h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
    case 'hex':
      return ['10', 'f', 'e', 'd', 'c', 'b', 'a', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
    default:
      return [
        '16',
        '15',
        '14',
        '13',
        '12',
        '11',
        '10',
        '9',
        '8',
        '7',
        '6',
        '5',
        '4',
        '3',
        '2',
        '1',
      ];
  }
}
