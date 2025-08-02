// https://github.com/microsoft/TypeScript/issues/27024
// prettier-ignore
/**
 * Checks if two types `A` and `B` are exactly the same.
 *
 * This utility uses a technique involving conditional types within function types
 * to determine type equality. It returns the boolean literal `true` if `A` and `B`
 * are identical types, and `false` otherwise.
 *
 * @template A - The first type to compare.
 * @template B - The second type to compare.
 * @returns `true` if `A` and `B` are the same type, `false` otherwise.
 *
 * @example
 * type T1 = TypeEq<string, string>; // true
 * type T2 = TypeEq<string, number>; // false
 * type T3 = TypeEq<{ a: number }, { a: number }>; // true
 * type T4 = TypeEq<{ a: number }, { b: number }>; // false
 * type T5 = TypeEq<any, string>; // false (usually, depends on TS version specifics)
 * type T6 = TypeEq<never, never>; // true
 * type T7 = TypeEq<string | number, number | string>; // true
 */
type TypeEq<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;
