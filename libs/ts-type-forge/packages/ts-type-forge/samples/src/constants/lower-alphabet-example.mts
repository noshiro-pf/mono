import { type LowerAlphabet } from 'ts-type-forge';

// embed-sample-code-ignore-above

type VowelLower = 'a' | 'e' | 'i' | 'o' | 'u';
type IsVowel<T extends LowerAlphabet> = T extends VowelLower ? true : false;

type Test1 = IsVowel<'a'>; // true
type Test2 = IsVowel<'b'>; // false

const validateLowercase = (char: string): char is LowerAlphabet =>
  char.length === 1 && char >= 'a' && char <= 'z';

// embed-sample-code-ignore-below
export { validateLowercase };
export type { IsVowel, Test1, Test2, VowelLower };
