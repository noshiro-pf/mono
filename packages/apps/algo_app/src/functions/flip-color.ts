import { CardColor } from '../types/card-color';

export const flipColor = (color: CardColor): CardColor =>
  color === 'black' ? 'white' : 'black';
