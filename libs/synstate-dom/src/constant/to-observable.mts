import { isObservable, just, type InitializedObservable } from 'synstate';
import type { Bindable } from './bindable.mjs';

/**
 * Turns a {@link Bindable} into an observable: a constant becomes `just(value)`,
 * and an observable is returned as is.
 *
 * Only for where an observable is really needed, such as the projection of a
 * `switchMap`: a constant made into an observable joins the graph, which
 * {@link mapBindable} and {@link deriveBindable} avoid.
 */
export const toObservable = <T,>(
  bindable: Bindable<T>,
): InitializedObservable<T> =>
  isObservable(bindable) ? bindable : just(bindable);
