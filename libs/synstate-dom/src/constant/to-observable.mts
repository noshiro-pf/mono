import { isObservable, just, map, type InitializedObservable } from 'synstate';
import { isView } from '../internal/index.mjs';
import type { Bindable } from './bindable.mjs';

/**
 * Turns a {@link Bindable} into an observable: a constant becomes `just(value)`,
 * a view becomes `source.pipe(map(fn))`, and an observable is returned as is.
 *
 * Only for where an observable is really needed, such as the projection of a
 * `switchMap`: a constant made into an observable joins the graph, which
 * {@link mapBindable} and {@link derive} avoid.
 */
export const toObservable = <T,>(
  bindable: Bindable<T>,
): InitializedObservable<T> =>
  isView(bindable)
    ? bindable.open((source, fn) => source.pipe(map(fn)))
    : isObservable(bindable)
      ? bindable
      : just(bindable);
