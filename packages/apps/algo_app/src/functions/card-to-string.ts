import type { Card } from '../types';

export const cardToString = (card: Card): string =>
  `${card.color}-${card.number}`;
