// prettier-ignore
export type LowerAlphabet = (
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'
  | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n'
  | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u'
  | 'v' | 'w' | 'x' | 'y' | 'z'
);

export type UpperAlphabet = Uppercase<LowerAlphabet>;

export type Alphabet = LowerAlphabet | UpperAlphabet;
