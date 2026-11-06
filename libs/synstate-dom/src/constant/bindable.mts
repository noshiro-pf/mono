import type { InitializedObservable, Observable } from 'synstate';
import type { Constant } from './constant.mjs';
import type { InlineMap } from './inline-map.mjs';

/**
 * What a slot that takes data accepts: an observable with an initial value, or
 * an explicit {@link Constant}. A plain value is not accepted.
 */
export type Bindable<T> = Constant<T> | InitializedObservable<T>;

/**
 * What a slot of an intrinsic element accepts: a {@link Bindable}, or an
 * {@link InlineMap}, the optimization of `pipe(map(fn))` that only such a slot
 * takes. A prop typed `Bindable` and the helpers that receive one never see an
 * inline map; a prop passed to an element unchanged, such as a `Child` or the
 * `<a>` attributes `Link` spreads onto its anchor, may hold one.
 */
export type ElementBindable<T> = Bindable<T> | InlineMap<T>;

/** The value type a {@link Bindable} carries. */
export type BindableValue<B> =
  B extends Observable<infer T> ? T : B extends Constant<infer T> ? T : never;
