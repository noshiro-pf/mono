import {
  derive,
  isObservable,
  just,
  map,
  type InitializedObservable,
  type Observable,
} from 'synstate-next';
import * as Arr from 'ts-data-forge/array';
import type { NonEmptyTuple } from 'ts-type-forge';
import type { Bindable, Constant } from './constant.mjs';

/** The value type a {@link Bindable} carries. */
export type BindableValue<B> =
  B extends Observable<infer T> ? T : B extends Constant<infer T> ? T : never;

/** The value types of a tuple of {@link Bindable}s, position by position. */
export type BindableValues<BS extends readonly Bindable<unknown>[]> = Readonly<{
  [K in keyof BS]: BindableValue<BS[K]>;
}>;

/**
 * `bindable` as an observable: itself, or a settled one holding the constant.
 * For code that needs an observable whatever it was given.
 */
export const toObservable = <T,>(
  bindable: Bindable<T>,
): InitializedObservable<T> =>
  isObservable(bindable) ? bindable : just<T>(bindable);

/**
 * `fn` applied to `bindable`: once to a constant, giving a constant, and to
 * each value of an observable, giving an observable.
 */
export const mapBindable = <A, B>(
  bindable: Bindable<A>,
  fn: (value: A) => B,
): Bindable<B> =>
  isObservable(bindable) ? bindable.pipe(map(fn)) : asConstant(fn(bindable));

/**
 * `fn` applied to the values of `bindables`: a constant when every one of them
 * is, an observable that follows them otherwise.
 */
export const deriveBindable = <
  const BS extends NonEmptyTuple<Bindable<unknown>>,
  R,
>(
  bindables: BS,
  fn: (...values: BindableValues<BS>) => R,
): Bindable<R> => {
  // `fn` is called with the value of each of `bindables`, position by position.
  // The checker cannot follow a position through `Arr.map`, which carries one
  // element type for the whole tuple.
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- see above
  const project = fn as (...values: readonly unknown[]) => R;

  if (Arr.every(bindables, isConstant)) {
    return asConstant(project(...bindables));
  }

  const observables: readonly InitializedObservable<unknown>[] = Arr.map(
    bindables,
    toObservable,
  );

  return derive(observables, project);
};

const isConstant = (bindable: Bindable<unknown>): boolean =>
  !isObservable(bindable);

/**
 * Brands a value computed from constants. `constant` rejects `null` and
 * `undefined` for a slot written by hand; a computed one may hold them.
 */
const asConstant = <T,>(value: T): Constant<T> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a brand has no run-time part to check
  value as Constant<T>;
