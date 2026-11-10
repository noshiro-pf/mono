import { combine, derive, map, type InitializedObservable } from 'synstate';
import { Arr } from 'ts-data-forge';
import type { NonEmptyTuple } from 'ts-type-forge';

/**
 * One node computed from any number of others: `combine` over them, then `map`,
 * which passes on only a value that is not `Object.is` the last. For a figure
 * whose inputs are a list (the months of a year, the predecessors of a task)
 * rather than a fixed tuple.
 */
export const combineAll = <R,>(
  parents: readonly InitializedObservable<number>[],
  fn: (values: readonly number[]) => R,
): InitializedObservable<R> => {
  if (!Arr.isNonEmpty(parents)) {
    throw new Error('combineAll needs at least one parent');
  }

  return combine(parents).pipe(map(fn));
};

/**
 * One `derive` over any number of others, which passes on only a value that
 * changed: the form `synstate-dom (derive)` writes synstate-dom-next's
 * scenarios in.
 */
export const deriveAll = <R,>(
  parents: readonly InitializedObservable<number>[],
  fn: (values: readonly number[]) => R,
): InitializedObservable<R> => {
  if (!Arr.isNonEmpty(parents)) {
    throw new Error('deriveAll needs at least one parent');
  }

  const tuple: NonEmptyTuple<InitializedObservable<number>> = parents;

  return derive(tuple, (...values) => fn(values));
};
