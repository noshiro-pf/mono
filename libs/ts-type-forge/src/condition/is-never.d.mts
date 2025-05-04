/**
 * Checks if a given type `T` is exactly the `never` type.
 *
 * It uses the `[T] extends [never]` pattern to correctly identify `never` even when `T`
 * is a generic type parameter, avoiding issues with conditional type distribution.
 *
 * @template T - The type to check.
 * @returns `true` if `T` is `never`, `false` otherwise.
 *
 * @example
 * type T1 = IsNever<never>; // true
 * type T2 = IsNever<string>; // false
 * type T3 = IsNever<any>; // false
 * type T4 = IsNever<unknown>; // false
 * type T5 = IsNever<string | never>; // false (evaluates to string)
 * type T6 = IsNever<string & never>; // true (evaluates to never)
 */
type IsNever<T> = [T] extends [never] ? true : false;
