import type { InitializedObservable, Observable } from 'synstate';
import type { Constant } from './constant.mjs';

/**
 * What a slot that takes data accepts: an observable with an initial value, or
 * an explicit {@link Constant}. A plain value is not accepted.
 */
export type Bindable<T> = Constant<T> | InitializedObservable<T>;

/** The value type a {@link Bindable} carries. */
export type BindableValue<B> =
  B extends Observable<infer T> ? T : B extends Constant<infer T> ? T : never;
