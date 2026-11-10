import { derive, type InitializedObservable } from 'synstate-next';
import { Arr } from 'ts-data-forge';

/**
 * One node computed from any number of others, for a figure whose inputs are a
 * list (the months of a year, the predecessors of a task) rather than a fixed
 * tuple. synstate-next's `derive` passes on only a value that changed.
 */
export const deriveAllNext = <R,>(
  parents: readonly InitializedObservable<number>[],
  fn: (values: readonly number[]) => R,
): InitializedObservable<R> => {
  if (!Arr.isNonEmpty(parents)) {
    throw new Error('deriveAllNext needs at least one parent');
  }

  return derive(parents, (...values) => fn(values));
};
