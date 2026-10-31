import type { InitializedObservable } from 'synstate';
import { viewTag } from '../internal/index.mjs';

/**
 * An observable and a function to apply to each of its values, bound without
 * creating a node in the graph. Made by {@link view}.
 *
 * The source's value type is hidden behind `open`, which hands the pair back to
 * a callback that is generic in it: whoever opens a view sees a source and a
 * function that agree with each other, with no assertion on either side.
 */
export type View<T> = Readonly<{
  [viewTag]: true;
  open: <R>(
    use: <A>(source: InitializedObservable<A>, fn: (value: A) => T) => R,
  ) => R;
}>;

/**
 * Pairs an observable with a light transformation, for a slot that takes a
 * `Bindable`. The transformation runs in the binding's subscriber, so no node
 * is added to the graph.
 *
 * `fn` runs once per value per binding: a view passed to two slots runs it
 * twice. A heavy transformation, or one shared by several bindings, belongs in
 * `source.pipe(map(fn))`.
 */
export const view = <A, T>(
  source: InitializedObservable<A>,
  fn: (value: A) => T,
): View<T> =>
  ({
    [viewTag]: true,
    open: (use) => use(source, fn),
  }) as const;
