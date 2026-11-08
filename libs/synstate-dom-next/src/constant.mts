import type { InitializedObservable, Observable } from 'synstate-next';
import type { Brand } from 'ts-type-forge';

/**
 * A value that is written once and never updated. A brand that exists only in
 * the type system: at run time it is the value itself.
 *
 * A prop or attribute that takes data accepts a `Constant<T>` but not a plain
 * `T`, so that a value read once and never updated (`count.value`) is a type
 * error rather than a binding that silently stays stale.
 */
export type Constant<T> = Brand<T, 'synstate-dom-next/Constant'>;

/**
 * What a prop or attribute that takes data accepts: an observable that holds a
 * value, or an explicit {@link Constant}. A plain value is not accepted.
 */
export type Bindable<T> = Constant<T> | InitializedObservable<T>;

/**
 * Marks a value as a {@link Constant}, and returns it unchanged.
 *
 * `null` and `undefined` are rejected: an absent attribute is an omitted prop,
 * and a value that comes and goes is an `InitializedObservable<T | undefined>`.
 * An observable is rejected too, since wrapping one would bind it once.
 */
export const constant = <const T,>(
  value: T extends Observable<unknown> | null | undefined ? never : T,
): Constant<T> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a brand has no run-time part to check
  value as Constant<T>;
