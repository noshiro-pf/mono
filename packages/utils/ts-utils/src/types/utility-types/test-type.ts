export type TypeEq<A, B> = (<T>() => T extends A ? 1 : 2) extends <
  T
>() => T extends B ? 1 : 2
  ? true
  : false;

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function assertType<_T extends true>(): void {}
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function assertNotType<_T extends false>(): void {}

export type TypeExtends<A, B> = A extends B ? true : false;
