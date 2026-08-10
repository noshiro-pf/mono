import { type TypeExtends, type UnknownRecord } from 'ts-type-forge';

// embed-sample-code-ignore-above

// Basic assignability checks
type T1 = TypeExtends<string, string | number>; // true (string is part of union)
type T2 = TypeExtends<string | number, string>; // false (union is broader than string)
type T3 = TypeExtends<'hello', string>; // true (literal extends primitive)
type T4 = TypeExtends<string, 'hello'>; // false (primitive doesn't extend literal)

// Object assignability
type T5 = TypeExtends<Readonly<{ a: number }>, UnknownRecord>; // true (specific object extends general object)
type T6 = TypeExtends<
  Readonly<{ a: number; b: string }>,
  Readonly<{ a: number }>
>; // true (extra properties allowed)

// Special types
type T7 = TypeExtends<never, string>; // true (never is assignable to anything)
type T8 = TypeExtends<any, string>; // true (any is assignable to anything)
type T9 = TypeExtends<string, any>; // true (anything is assignable to any)
type T10 = TypeExtends<string, unknown>; // true (anything is assignable to unknown)
type T11 = TypeExtends<unknown, string>; // false (unknown is not assignable to specific types)

// Practical usage in conditional types
type IsOptional<T, K extends keyof T> = TypeExtends<T[K], undefined>;
type IsFunction<T> = TypeExtends<T, (...args: readonly any[]) => any>;
type IsArray<T> = TypeExtends<T, readonly unknown[]>;

// Type compatibility checking
type CanAssign<From, To> = TypeExtends<From, To>;
type StringToNumber = CanAssign<string, number>; // false
type NumberToStringUnion = CanAssign<number, string | number>; // true

// embed-sample-code-ignore-below
export type {
  CanAssign,
  IsArray,
  IsFunction,
  IsOptional,
  NumberToStringUnion,
  StringToNumber,
  T1,
  T10,
  T11,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
};
