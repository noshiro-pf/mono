// prettier-ignore
/**
 * Represents the set of lowercase English alphabet letters.
 * A union of string literals from `'a'` to `'z'`.
 */
type LowerAlphabet = (
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'
  | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n'
  | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u'
  | 'v' | 'w' | 'x' | 'y' | 'z'
);

/**
 * Represents the set of uppercase English alphabet letters.
 * A union of string literals from `'A'` to `'Z'`.
 * Derived by applying `Uppercase` to `LowerAlphabet`.
 */
type UpperAlphabet = Uppercase<LowerAlphabet>;

/**
 * Represents the set of both lowercase and uppercase English alphabet letters.
 * A union of `LowerAlphabet` and `UpperAlphabet`.
 */
type Alphabet = LowerAlphabet | UpperAlphabet;
