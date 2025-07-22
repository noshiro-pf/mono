import { expectType } from '../expect-type.mjs';

// Basic types
expectType<TypeEq<number, string>, false>('=');
expectType<TypeEq<number, number>, true>('=');
expectType<TypeEq<string, string>, true>('=');
expectType<TypeEq<boolean, boolean>, true>('=');
expectType<TypeEq<null, null>, true>('=');
expectType<TypeEq<undefined, undefined>, true>('=');
expectType<TypeEq<symbol, symbol>, true>('=');
expectType<TypeEq<bigint, bigint>, true>('=');
expectType<TypeEq<number, any>, false>('=');
expectType<TypeEq<any, number>, false>('=');
expectType<TypeEq<any, any>, true>('='); // any is equal to itself
expectType<TypeEq<unknown, unknown>, true>('=');
expectType<TypeEq<never, never>, true>('=');
expectType<TypeEq<number, unknown>, false>('=');
expectType<TypeEq<unknown, number>, false>('=');
expectType<TypeEq<number, never>, false>('=');
expectType<TypeEq<never, number>, false>('=');
expectType<TypeEq<any, unknown>, false>('=');
expectType<TypeEq<unknown, any>, false>('=');
expectType<TypeEq<any, never>, false>('=');
expectType<TypeEq<never, any>, false>('=');
expectType<TypeEq<unknown, never>, false>('=');
expectType<TypeEq<never, unknown>, false>('=');

// Literal types
expectType<TypeEq<1, 1>, true>('=');
expectType<TypeEq<1, 2>, false>('=');
expectType<TypeEq<1, number>, false>('=');
expectType<TypeEq<number, 1>, false>('=');
expectType<TypeEq<'a', 'a'>, true>('=');
expectType<TypeEq<'a', 'b'>, false>('=');
expectType<TypeEq<'a', string>, false>('=');
expectType<TypeEq<string, 'a'>, false>('=');

// Union types
expectType<TypeEq<1 | 2, 1 | 2>, true>('=');
expectType<TypeEq<1 | 2, 2 | 1>, true>('='); // Order doesn't matter
expectType<TypeEq<1 | 1, 1>, true>('='); // Simplified union
expectType<TypeEq<1, 1 | 1>, true>('='); // Simplified union
expectType<TypeEq<1 | 2, 1>, false>('=');
expectType<TypeEq<1, 1 | 2>, false>('=');
expectType<TypeEq<string | number, number | string>, true>('=');
expectType<TypeEq<string | number, string>, false>('=');
expectType<TypeEq<string, string | number>, false>('=');
expectType<TypeEq<1 | 'a', 'a' | 1>, true>('=');
expectType<TypeEq<1 | never, 1>, true>('='); // never is ignored in union

// Intersection types
expectType<TypeEq<{ a: 1 } & { b: 2 }, { a: 1 } & { b: 2 }>, true>('=');
expectType<TypeEq<{ a: 1 } & { b: 2 }, { b: 2 } & { a: 1 }>, true>('='); // Order doesn't matter
expectType<TypeEq<{ a: 1 } & { a: number }, { a: 1 }>, false>('='); // Intersection simplifies
expectType<TypeEq<{ a: 1 } & { b: 2 }, { a: 1; b: 2 }>, false>('='); // Intersection vs object literal
expectType<TypeEq<{ a: 1; b: 2 }, { a: 1 } & { b: 2 }>, false>('='); // Object literal vs intersection

// Object types
expectType<TypeEq<{ a: number }, { a: number }>, true>('=');
expectType<TypeEq<{ a: number }, { b: number }>, false>('='); // Different key
expectType<TypeEq<{ a: number }, { a: string }>, false>('='); // Different value type
expectType<TypeEq<{ a: number; b: string }, { b: string; a: number }>, true>(
  '=',
); // Order doesn't matter
expectType<TypeEq<{ a: number }, { a: number; b: string }>, false>('='); // Extra property
expectType<TypeEq<{ a: number; b: string }, { a: number }>, false>('='); // Missing property
expectType<TypeEq<{ a: 1 }, { a: number }>, false>('=');
expectType<TypeEq<{ a: number }, { a: 1 }>, false>('=');
expectType<TypeEq<{ a: number }, Readonly<{ a: number }>>, false>('='); // Mutability difference
expectType<TypeEq<Readonly<{ a: number }>, { a: number }>, false>('='); // Mutability difference
expectType<TypeEq<{ a?: number }, { a?: number }>, true>('=');
expectType<TypeEq<{ a?: number }, { a: number | undefined }>, false>('='); // Optional vs union with undefined
expectType<TypeEq<{ a: number | undefined }, { a?: number }>, false>('='); // Union with undefined vs optional
expectType<TypeEq<{ a?: number }, { a: number }>, false>('='); // Optional vs required
expectType<TypeEq<{ a: number }, { a?: number }>, false>('='); // Required vs optional
expectType<TypeEq<{ x: any }, { x: number }>, false>('=');
expectType<TypeEq<{ x: number }, { x: any }>, false>('=');
expectType<TypeEq<{ x: unknown }, { x: number }>, false>('=');
expectType<TypeEq<{ x: number }, { x: unknown }>, false>('=');

// Array/Tuple types
expectType<TypeEq<number[], number[]>, true>('=');
expectType<TypeEq<string[], number[]>, false>('=');
expectType<TypeEq<number[], readonly number[]>, false>('='); // Mutability difference
expectType<TypeEq<readonly number[], number[]>, false>('='); // Mutability difference
expectType<TypeEq<[1, 2], [1, 2]>, true>('=');
expectType<TypeEq<[1, 2], [1, 3]>, false>('=');
expectType<TypeEq<[1, 2], [1, 2, 3]>, false>('='); // Different length
expectType<TypeEq<[1, 2, 3], [1, 2]>, false>('='); // Different length
expectType<TypeEq<[1, 2], readonly [1, 2]>, false>('='); // Mutability difference
expectType<TypeEq<readonly [1, 2], [1, 2]>, false>('='); // Mutability difference
expectType<TypeEq<[any], [number]>, false>('=');
expectType<TypeEq<[number], [any]>, false>('=');
expectType<TypeEq<[unknown], [number]>, false>('=');
expectType<TypeEq<[number], [unknown]>, false>('=');
expectType<TypeEq<[number, ...string[]], [number, ...string[]]>, true>('=');
expectType<TypeEq<[number, ...string[]], [number]>, false>('=');
expectType<TypeEq<[number, ...string[]], [number, string]>, false>('=');

// Function types
expectType<TypeEq<() => void, () => void>, true>('=');
expectType<TypeEq<(a: number) => void, (a: number) => void>, true>('=');
expectType<TypeEq<(a: number) => void, (a: string) => void>, false>('='); // Different param type
expectType<TypeEq<(a: number) => void, (b: number) => void>, true>('='); // Param name doesn't matter
expectType<TypeEq<(a: number) => void, () => void>, false>('='); // Different param count
expectType<TypeEq<() => void, (a: number) => void>, false>('='); // Different param count
expectType<TypeEq<() => number, () => string>, false>('='); // Different return type
expectType<TypeEq<() => number, () => void>, false>('='); // Different return type (void)
expectType<TypeEq<() => void, () => number>, false>('='); // Different return type (void)
expectType<TypeEq<(a?: number) => void, (a?: number) => void>, true>('=');
expectType<
  TypeEq<(a?: number) => void, (a: number | undefined) => void>,
  false
>('='); // Optional vs union with undefined
expectType<
  TypeEq<(a: number | undefined) => void, (a?: number) => void>,
  false
>('='); // Union with undefined vs optional
expectType<TypeEq<(a?: number) => void, (a: number) => void>, false>('='); // Optional vs required
expectType<TypeEq<(a: number) => void, (a?: number) => void>, false>('='); // Required vs optional
