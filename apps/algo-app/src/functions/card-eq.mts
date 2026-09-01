import { type Card } from '../types/index.mjs';

export const cardEq = (a: Card | undefined, b: Card | undefined): boolean =>
  a === undefined || b === undefined
    ? a === b
    : a.color === b.color && a.number === b.number;
