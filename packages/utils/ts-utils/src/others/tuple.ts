import { assertType } from '../types';

export const tuple = <T extends readonly unknown[]>(...args: T): T => args;

const tpl = tuple(1, 2, 3);
assertType<TypeEq<typeof tpl, [number, number, number]>>();

export const ituple = <T extends readonly unknown[]>(...args: T): Readonly<T> =>
  args;

const itpl = ituple(1, 2, 3);
assertType<TypeEq<typeof itpl, readonly [number, number, number]>>();
