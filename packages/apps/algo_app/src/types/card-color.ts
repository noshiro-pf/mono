export type CardColor = 'black' | 'white';

export const isCardColor = (data: unknown): data is CardColor =>
  typeof data === 'string' && (data === 'black' || data === 'white');
