import type { InitializedObservable, Observable } from 'synstate';
import type { Constant } from './constant.mjs';
import type { View } from './view.mjs';

/**
 * What a slot that takes data accepts: an observable with an initial value, an
 * explicit {@link Constant}, or a {@link View}. A plain value is not accepted.
 */
export type Bindable<T> = Constant<T> | InitializedObservable<T> | View<T>;

/** The value type a {@link Bindable} carries. */
export type BindableValue<B> =
  B extends View<infer T>
    ? T
    : B extends Observable<infer T>
      ? T
      : B extends Constant<infer T>
        ? T
        : never;
