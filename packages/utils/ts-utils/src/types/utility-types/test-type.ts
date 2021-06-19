/* eslint-disable @typescript-eslint/no-explicit-any */

// https://github.com/microsoft/TypeScript/issues/27024
export type TypeEq<A, B> = (<T>() => T extends A ? 1 : 2) extends <
  T
>() => T extends B ? 1 : 2
  ? true
  : false;

export type TypeExtends<A, B> = A extends B ? true : false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const assertType = <_T extends true>(): void => undefined;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const assertNotType = <_T extends false>(): void => undefined;

assertNotType<TypeEq<number, string>>();
assertType<TypeEq<1, 1>>();
assertType<TypeEq<[1, 2, 3], [1, 2, 3]>>();
assertType<TypeEq<readonly [1, 2, 3], readonly [1, 2, 3]>>();
assertNotType<TypeEq<[1, 2, 3], readonly [1, 2, 3]>>();
assertNotType<TypeEq<any, 1>>();
assertNotType<TypeEq<1 | 2, 1>>();
assertNotType<TypeEq<any, never>>();
assertNotType<TypeEq<[any], [number]>>();
assertNotType<TypeEq<{ x: 1 } & { y: 2 }, { x: 1; y: 2 }>>();
assertNotType<TypeEq<{ x: any }, { x: number }>>();
