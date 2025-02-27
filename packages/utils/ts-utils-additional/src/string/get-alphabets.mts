import { Arr, Uint32 } from '@noshiro/ts-utils';

export const getAlphabets = <Case extends 'lower' | 'upper'>(
  charCase: Case,
): [Case] extends ['lower']
  ? readonly LowerAlphabet[]
  : [Case] extends ['upper']
    ? readonly UpperAlphabet[]
    : never => {
  const code =
    charCase === 'lower'
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'a'.codePointAt(0)!
      : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'A'.codePointAt(0)!;

  const ret = Arr.seq(26).map((i) => String.fromCodePoint(Uint32.add(code, i)));

  type Ret = [Case] extends ['lower']
    ? readonly LowerAlphabet[]
    : [Case] extends ['upper']
      ? readonly UpperAlphabet[]
      : never;

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return ret as Ret;
};
