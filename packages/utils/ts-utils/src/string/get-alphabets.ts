import { seq } from '../array';
import { uint32 } from '../types';

export const getAlphabets = (charCase: 'lower' | 'upper'): string[] => {
  const code = charCase === 'lower' ? 'a'.charCodeAt(0) : 'A'.charCodeAt(0);
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  return seq(26 as uint32).map((i) => String.fromCharCode(code + i));
};
