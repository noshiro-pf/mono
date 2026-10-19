import {
  combine,
  isObservable,
  map,
  type InitializedObservable,
} from 'synstate';
import { Arr } from 'ts-data-forge';
import type { NonEmptyTuple } from 'ts-type-forge';
import { asConstant, isView } from '../internal/index.mjs';
import type { Bindable, BindableValue } from './bindable.mjs';
import { toObservable } from './to-observable.mjs';

/**
 * Combines several {@link Bindable}s into one.
 *
 * When every input is a constant, `fn` runs once and the result is a constant:
 * a static part of the view never enters the graph. Otherwise the constants
 * become `just` and the views are turned into observables, and the result is
 * `combine(...).pipe(map(...))`.
 */
export const derive = <const BS extends NonEmptyTuple<Bindable<unknown>>, R>(
  bindables: BS,
  fn: (...values: BindableValues<BS>) => R,
): Bindable<R> => {
  // `values` holds, position by position, the value of each of `bindables`:
  // the constants themselves, or what `combine` emits for their observables.
  // The checker cannot follow a position through `Arr.map` and `combine`,
  // which carry one element type for the whole tuple.
  const apply = (values: readonly unknown[]): R =>
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- see above
    fn(...(values as BindableValues<BS>));

  if (Arr.every(bindables, isConstant)) {
    return asConstant(apply(bindables));
  }

  const observables: NonEmptyTuple<InitializedObservable<unknown>> = Arr.map(
    bindables,
    toObservable,
  );

  return combine(observables).pipe(map(apply));
};

/** The value types of a tuple of {@link Bindable}s, position by position. */
export type BindableValues<BS extends readonly Bindable<unknown>[]> = Readonly<{
  [K in keyof BS]: BindableValue<BS[K]>;
}>;

const isConstant = (bindable: Bindable<unknown>): boolean =>
  !isView(bindable) && !isObservable(bindable);
