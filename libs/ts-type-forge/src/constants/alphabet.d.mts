// prettier-ignore
/**
 * Represents the set of lowercase English alphabet letters.
 * A union of string literals from `'a'` to `'z'`.
 *
 * Useful for type-safe operations that require lowercase letters only,
 * such as CSS class naming, identifier validation, or alphabet-based algorithms.
 *
 * @example
 * ```ts
 * type VowelLower = 'a' | 'e' | 'i' | 'o' | 'u';
 * type IsVowel<T extends LowerAlphabet> = T extends VowelLower ? true : false;
 *
 * type Test1 = IsVowel<'a'>; // true
 * type Test2 = IsVowel<'b'>; // false
 *
 * const validateLowercase = (char: string): char is LowerAlphabet => {
 *   return char.length === 1 && char >= 'a' && char <= 'z';
 * };
 * ```
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
 * Derived by applying the built-in `Uppercase` utility type to `LowerAlphabet`.
 *
 * @example
 * ```ts
 * type FirstLetter<S extends string> = S extends `${infer F}${string}`
 *   ? F extends UpperAlphabet
 *     ? F
 *     : never
 *   : never;
 *
 * type T1 = FirstLetter<'Hello'>; // 'H'
 * type T2 = FirstLetter<'world'>; // never
 *
 * const isUppercase = (char: string): char is UpperAlphabet => {
 *   return char.length === 1 && char >= 'A' && char <= 'Z';
 * };
 * ```
 */
type UpperAlphabet = Uppercase<LowerAlphabet>;

/**
 * Represents the set of both lowercase and uppercase English alphabet letters.
 * A union of `LowerAlphabet` and `UpperAlphabet`, covering all 52 English letters.
 *
 * Useful for general alphabetic character validation, text processing,
 * and type-safe operations that work with any English letter.
 *
 * @example
 * ```ts
 * type AlphabetCount = 52; // LowerAlphabet (26) + UpperAlphabet (26)
 *
 * const isAlphabetic = (char: string): char is Alphabet => {
 *   return char.length === 1 &&
 *          ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z'));
 * };
 *
 * type ExtractAlpha<S extends string> = S extends `${infer F}${infer R}`
 *   ? F extends Alphabet
 *     ? `${F}${ExtractAlpha<R>}`
 *     : ExtractAlpha<R>
 *   : '';
 *
 * type OnlyLetters = ExtractAlpha<'H3ll0 W0rld!'>; // 'HllWorld'
 * ```
 */
type Alphabet = LowerAlphabet | UpperAlphabet;
