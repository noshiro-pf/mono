import { assertType } from '../assert-type';

export const tp = <T extends readonly unknown[]>(...args: T): Readonly<T> =>
  args;

const tuple = tp(1, 2, 3);

assertType<TypeEq<typeof tuple, readonly [number, number, number]>>();
