import { type Alphabet } from 'ts-type-forge';

// embed-sample-code-ignore-above

type AlphabetCount = 52; // LowerAlphabet (26) + UpperAlphabet (26)

const isAlphabetic = (char: string): char is Alphabet =>
  char.length === 1 &&
  ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z'));

type ExtractAlpha<S extends string> = S extends `${infer F}${infer R}`
  ? F extends Alphabet
    ? `${F}${ExtractAlpha<R>}`
    : ExtractAlpha<R>
  : '';

type OnlyLetters = ExtractAlpha<'H3ll0 W0rld!'>; // 'HllWorld'

// embed-sample-code-ignore-below
export { isAlphabetic };
export type { AlphabetCount, ExtractAlpha, OnlyLetters };
