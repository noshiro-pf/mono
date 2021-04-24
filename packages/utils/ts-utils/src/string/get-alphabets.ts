import { seq } from '../array';

export const getAlphabets = (charCase: 'lower' | 'upper'): string[] => {
  const code_a = 'a'.charCodeAt(0);
  const code_A = 'A'.charCodeAt(0);
  const code = charCase === 'upper' ? code_A : code_a;
  return seq(26).map((i) => String.fromCharCode(code + i));
};
