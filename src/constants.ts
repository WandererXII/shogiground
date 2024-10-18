import type { Key } from './types.js';

export const colors = ['sente', 'gote'] as const;

export const files = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
] as const;
export const ranks = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
] as const;

export const allKeys: readonly Key[] = Array.prototype.concat(
  ...ranks.map(r => files.map(f => f + r))
);

export const notations = ['numeric', 'japanese', 'engine', 'hex'] as const;
