import { derive, type InitializedObservable } from 'synstate';
import { Arr } from 'ts-data-forge';

/**
 * One node computed from any number of others, for a figure whose inputs are a
 * list (the months of a year, the predecessors of a task) rather than a fixed
 * tuple. synstate's `derive` passes on only a value that changed.
 */
export const deriveAll = <R,>(
  parents: readonly InitializedObservable<number>[],
  fn: (values: readonly number[]) => R,
): InitializedObservable<R> => {
  if (!Arr.isNonEmpty(parents)) {
    throw new Error('deriveAll needs at least one parent');
  }

  return derive(parents, (...values) => fn(values));
};
