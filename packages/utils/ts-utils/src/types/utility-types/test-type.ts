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
