/**
 * Checks if type `A` is assignable to (extends) type `B`.
 * Returns the boolean literal `true` if `[A]` extends `[B]`, and `false` otherwise.
 * This is essentially a type-level representation of the `extends` check in conditional types.
 *
 * @template A - The type to check.
 * @template B - The type to check against.
 * @returns `true` if `[A]` is assignable to `[B]`, `false` otherwise.
 *
 * @example
 * type T1 = TypeExtends<string, string | number>; // true
 * type T2 = TypeExtends<string | number, string>; // false
 * type T3 = TypeExtends<'a', string>; // true
 * type T4 = TypeExtends<string, 'a'>; // false
 * type T5 = TypeExtends<{ a: number }, object>; // true
 * type T6 = TypeExtends<never, string>; // true (never is assignable to anything)
 * type T7 = TypeExtends<string, any>; // true
 * type T8 = TypeExtends<any, string>; // true
 * type T9 = TypeExtends<string, unknown>; // true
 * type T10 = TypeExtends<unknown, string>; // false
 */
type TypeExtends<A, B> = [A] extends [B] ? true : false;
