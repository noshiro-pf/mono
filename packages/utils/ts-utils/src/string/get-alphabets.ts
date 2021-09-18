import { IList } from '../immutable';
import type { LowerAlphabet, UpperAlphabet } from '../types';

export const getAlphabets = <Case extends 'lower' | 'upper'>(
  charCase: Case
): Case extends 'lower' ? LowerAlphabet[] : UpperAlphabet[] => {
  const code = charCase === 'lower' ? 'a'.charCodeAt(0) : 'A'.charCodeAt(0);
  return IList.seqThrow(26).map((i) =>
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    String.fromCharCode(code + i)
  ) as Case extends 'lower' ? LowerAlphabet[] : UpperAlphabet[];
};
