import { type Card } from '../types/index.mjs';

export const cardToString = (card: Card): string =>
  `${card.color}-${card.number}`;
