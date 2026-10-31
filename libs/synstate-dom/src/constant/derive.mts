import {
  derive as deriveObservable,
  isObservable,
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
 * synstate's `derive` over them: one observable, which passes on a result only
 * when it is not `Object.is` the one it holds.
 */
export const derive = <const BS extends NonEmptyTuple<Bindable<unknown>>, R>(
  bindables: BS,
  fn: (...values: BindableValues<BS>) => R,
): Bindable<R> => {
  // `fn` is called with the value of each of `bindables`, position by position:
  // the constants themselves, or their observables' values. The checker cannot
  // follow a position through `Arr.map`, which carries one element type for the
  // whole tuple.
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- see above
  const project = fn as (...values: readonly unknown[]) => R;

  if (Arr.every(bindables, isConstant)) {
    return asConstant(project(...bindables));
  }

  const observables: NonEmptyTuple<InitializedObservable<unknown>> = Arr.map(
    bindables,
    toObservable,
  );

  return deriveObservable(observables, project);
};

/** The value types of a tuple of {@link Bindable}s, position by position. */
export type BindableValues<BS extends readonly Bindable<unknown>[]> = Readonly<{
  [K in keyof BS]: BindableValue<BS[K]>;
}>;

const isConstant = (bindable: Bindable<unknown>): boolean =>
  !isView(bindable) && !isObservable(bindable);
