import { type BoolNot } from '../others/index.mjs';
import { type IsAny } from './is-any.mjs';

/**
 * Checks if a given type `T` is exactly the `unknown` type.
 *
 * `unknown extends T` holds only for `T = unknown` or `T = any`, so `any` is
 * excluded first via `IsAny`. The check does not distribute over unions
 * (the checked type appears on the right-hand side of `extends`).
 *
 * @template T - The type to check.
 * @returns `true` if `T` is `unknown`, `false` otherwise.
 *
 * @example
 * ```ts
 * type T1 = IsUnknown<unknown>; // true
 * type T2 = IsUnknown<any>; // false
 * type T3 = IsUnknown<never>; // false
 * type T4 = IsUnknown<string>; // false
 * type T5 = IsUnknown<string | unknown>; // true (`unknown` absorbs the union)
 * ```
 */
export type IsUnknown<T> =
  IsAny<T> extends true ? false : unknown extends T ? true : false;

/**
 * Checks if a given type `T` is *not* the `unknown` type.
 * The logical negation of `IsUnknown`.
 *
 * @template T - The type to check.
 * @returns `true` if `T` is not `unknown`, `false` otherwise.
 *
 * @example
 * ```ts
 * type T1 = IsNotUnknown<unknown>; // false
 * type T2 = IsNotUnknown<any>; // true
 * type T3 = IsNotUnknown<string>; // true
 * ```
 */
export type IsNotUnknown<T> = BoolNot<IsUnknown<T>>;
