import {
  combine,
  derive,
  map,
  skipIfNoChange,
  type InitializedObservable,
} from 'synstate';
import { Arr } from 'ts-data-forge';
import type { NonEmptyTuple } from 'ts-type-forge';

/**
 * What each figure's node passes on: every value `map` computes, as a
 * `combine` + `map` pair does by itself, or only a value that differs from the
 * last, with a `skipIfNoChange` after the `map`. The second stops an update
 * where a figure came out the same, at the cost of a third node per figure.
 */
export type FigureOutput = <T>(
  figure$: InitializedObservable<T>,
) => InitializedObservable<T>;

export const everyValue: FigureOutput = (figure$) => figure$;

export const changedValuesOnly: FigureOutput = (figure$) =>
  figure$.pipe(skipIfNoChange());

/**
 * One node computed from any number of others: `combine` over them, then `map`.
 * For a figure whose inputs are a list (the months of a year, the predecessors
 * of a task) rather than a fixed tuple.
 */
export const combineAll = <R,>(
  parents: readonly InitializedObservable<number>[],
  fn: (values: readonly number[]) => R,
  output: FigureOutput,
): InitializedObservable<R> => {
  if (!Arr.isNonEmpty(parents)) {
    throw new Error('combineAll needs at least one parent');
  }

  return output(combine(parents).pipe(map(fn)));
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
