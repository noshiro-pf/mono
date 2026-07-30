import { type BoolNot } from '../others/index.mjs';

/**
 * Checks if a given type `T` is exactly the `any` type.
 *
 * It uses the `0 extends 1 & T` trick: `1 & T` collapses to a type that `0`
 * extends only when `T` is `any` (for any other type, `1 & T` is `1`, a
 * subtype of `1`, or `never`). This avoids conditional type distribution and
 * does not require writing `any` in the implementation.
 *
 * @template T - The type to check.
 * @returns `true` if `T` is `any`, `false` otherwise.
 *
 * @example
 * type T1 = IsAny<any>; // true
 * type T2 = IsAny<unknown>; // false
 * type T3 = IsAny<never>; // false
 * type T4 = IsAny<string>; // false
 * type T5 = IsAny<string | any>; // true (`any` absorbs the union)
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * Checks if a given type `T` is *not* the `any` type.
 * The logical negation of `IsAny`.
 *
 * @template T - The type to check.
 * @returns `true` if `T` is not `any`, `false` otherwise.
 *
 * @example
 * type T1 = IsNotAny<any>; // false
 * type T2 = IsNotAny<unknown>; // true
 * type T3 = IsNotAny<string>; // true
 */
export type IsNotAny<T> = BoolNot<IsAny<T>>;
