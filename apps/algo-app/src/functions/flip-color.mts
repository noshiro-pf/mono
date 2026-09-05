import { type CardColor } from '../types/index.mjs';

export const flipColor = (color: CardColor): CardColor =>
  color === 'black' ? 'white' : 'black';
