import { type CardColor } from '../types';

export const flipColor = (color: CardColor): CardColor =>
  color === 'black' ? 'white' : 'black';
