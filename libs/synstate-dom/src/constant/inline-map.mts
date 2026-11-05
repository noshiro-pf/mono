import type { InitializedObservable } from 'synstate';
import { inlineMapTag } from '../internal/index.mjs';

/**
 * An observable and a function to apply to each of its values, bound without
 * creating a node in the graph. Made by {@link inlineMap}.
 *
 * The source's value type is hidden behind `open`, which hands the pair back to
 * a callback that is generic in it: whoever opens an inline map sees a source and a
 * function that agree with each other, with no assertion on either side.
 */
export type InlineMap<T> = Readonly<{
  [inlineMapTag]: true;
  open: <R>(
    use: <A>(source: InitializedObservable<A>, fn: (value: A) => T) => R,
  ) => R;
}>;

/**
 * An optimization of `source.pipe(map(fn))` for a slot of an intrinsic element
 * (`ElementBindable`): `fn` runs in the binding's subscriber, so no node is added
 * to the graph. A prop typed `Bindable` does not take it. Use `pipe(map(fn))` by
 * default, and this where bindings are many, such as the cells of `For` rows.
 *
 * What a binding writes is what the `map` node would pass on: a result
 * `Object.is` the one last written is not written again. Unlike the node, the
 * result is not shared: `fn` runs once per value per binding, so an inline map
 * passed to two slots runs it twice, and nothing else can read the result. A
 * heavy transformation, or one several bindings use, belongs in
 * `source.pipe(map(fn))`.
 *
 * Only `map` has such a form. A transformation of several sources (`deriveBindable`)
 * would see one of them before the update reached the others, since subscribers
 * are called while it propagates; one with state (`scan`) would keep it per
 * binding.
 */
export const inlineMap = <A, T>(
  source: InitializedObservable<A>,
  fn: (value: A) => T,
): InlineMap<T> =>
  ({
    [inlineMapTag]: true,
    open: (use) => use(source, fn),
  }) as const;
