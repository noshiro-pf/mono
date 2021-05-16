import type { Card } from '../types';

export const cardEq = (a: Card | undefined, b: Card | undefined): boolean =>
  a === undefined || b === undefined
    ? a === b
    : a.color === b.color && a.number === b.number;
