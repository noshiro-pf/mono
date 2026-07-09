import { type UpperAlphabet } from 'ts-type-forge';

// embed-sample-code-ignore-above

type FirstLetter<S extends string> = S extends `${infer F}${string}`
  ? F extends UpperAlphabet
    ? F
    : never
  : never;

type T1 = FirstLetter<'Hello'>; // 'H'
type T2 = FirstLetter<'world'>; // never

const isUppercase = (char: string): char is UpperAlphabet =>
  char.length === 1 && char >= 'A' && char <= 'Z';

// embed-sample-code-ignore-below
export { isUppercase };
export type { FirstLetter, T1, T2 };
