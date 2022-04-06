import { IList, Str } from '@noshiro/ts-utils';
import type { LowerAlphabet, UpperAlphabet } from '../types';

export const getAlphabets = <Case extends 'lower' | 'upper'>(
  charCase: Case
): Case extends 'lower' ? LowerAlphabet[] : UpperAlphabet[] => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const code = charCase === 'lower' ? 'a'.codePointAt(0)! : 'A'.codePointAt(0)!;

  return IList.seqThrow(26).map((i) =>
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    Str.fromCodePoint(code + i)
  ) as Case extends 'lower' ? LowerAlphabet[] : UpperAlphabet[];
};
