import { Arr, Uint32 } from '@noshiro/ts-utils';
import { type LowerAlphabet, type UpperAlphabet } from '../types';

export const getAlphabets = <Case extends 'lower' | 'upper'>(
  charCase: Case
): [Case] extends ['lower']
  ? LowerAlphabet[]
  : [Case] extends ['upper']
  ? UpperAlphabet[]
  : never => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const code = charCase === 'lower' ? 'a'.codePointAt(0)! : 'A'.codePointAt(0)!;

  return Arr.seq(26).map((i) => String.fromCodePoint(Uint32.add(code, i))) as [
    Case
  ] extends ['lower']
    ? LowerAlphabet[]
    : [Case] extends ['upper']
    ? UpperAlphabet[]
    : never;
};
