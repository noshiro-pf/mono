import { type TypeEq } from 'ts-type-forge';

// embed-sample-code-ignore-above

type T1 = TypeEq<string, string>; // true
type T2 = TypeEq<string, number>; // false
type T3 = TypeEq<Readonly<{ a: number }>, Readonly<{ a: number }>>; // true
type T4 = TypeEq<Readonly<{ a: number }>, Readonly<{ b: number }>>; // false
type T5 = TypeEq<any, string>; // false (usually, depends on TS version specifics)
type T6 = TypeEq<never, never>; // true
type T7 = TypeEq<string | number, number | string>; // true

// embed-sample-code-ignore-below
export type { T1, T2, T3, T4, T5, T6, T7 };
