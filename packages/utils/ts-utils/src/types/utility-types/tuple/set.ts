import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { TupleHead } from './head';
import type { ReadonlyTupleReverse, TupleReverse } from './reverse';
import type { ReadonlyTupleTail, TupleTail } from './tail';

type _TupleSet<
  T extends readonly unknown[],
  I extends number,
  V,
  ACC extends readonly unknown[]
> = {
  end: TupleReverse<ACC>;
  next: _TupleSet<TupleTail<T>, I, V, [TupleHead<T>, ...ACC]>;
  setValue: _TupleSet<TupleTail<T>, I, V, [V, ...ACC]>;
}[T extends readonly []
  ? 'end'
  : ACC['length'] extends I
  ? 'setValue'
  : 'next'];

export type TupleSet<T extends readonly unknown[], I extends number, V> =
  _TupleSet<T, I, V, []>;

assertType<TypeEq<TupleSet<[], 2, 999>, []>>();
assertType<TypeEq<TupleSet<[1, 2], 2, 999>, [1, 2]>>();
assertType<TypeEq<TupleSet<[1, 2, 3], 1, 999>, [1, 999, 3]>>();
assertType<TypeEq<TupleSet<[1, 2, 3], 0, 999>, [999, 2, 3]>>();

type _ReadonlyTupleSet<
  T extends readonly unknown[],
  I extends number,
  V,
  ACC extends readonly unknown[]
> = {
  end: ReadonlyTupleReverse<ACC>;
  next: _ReadonlyTupleSet<
    ReadonlyTupleTail<T>,
    I,
    V,
    readonly [TupleHead<T>, ...ACC]
  >;
  setValue: _ReadonlyTupleSet<ReadonlyTupleTail<T>, I, V, readonly [V, ...ACC]>;
}[T extends readonly []
  ? 'end'
  : ACC['length'] extends I
  ? 'setValue'
  : 'next'];

export type ReadonlyTupleSet<
  T extends readonly unknown[],
  I extends number,
  V
> = _ReadonlyTupleSet<T, I, V, readonly []>;

assertType<TypeEq<ReadonlyTupleSet<readonly [], 2, 999>, readonly []>>();
assertType<
  TypeEq<ReadonlyTupleSet<readonly [1, 2], 2, 999>, readonly [1, 2]>
>();
assertType<
  TypeEq<ReadonlyTupleSet<readonly [1, 2, 3], 1, 999>, readonly [1, 999, 3]>
>();
assertType<
  TypeEq<ReadonlyTupleSet<readonly [1, 2, 3], 0, 999>, readonly [999, 2, 3]>
>();
