import { isObservable, map } from 'synstate';
import { asConstant, isView } from '../internal/index.mjs';
import type { Bindable } from './bindable.mjs';
import { view } from './view.mjs';

/**
 * Applies `fn` to the value of a {@link Bindable}, keeping its kind.
 *
 * - A constant gives a constant: `fn` runs once and no node is created.
 * - A view gives a view with the two functions composed: no node is created.
 * - An observable gives `bindable.pipe(map(fn))`.
 */
export const mapBindable = <A, B>(
  bindable: Bindable<A>,
  fn: (value: A) => B,
): Bindable<B> =>
  isView(bindable)
    ? bindable.open((source, inner) =>
        view(source, (value) => fn(inner(value))),
      )
    : isObservable(bindable)
      ? bindable.pipe(map(fn))
      : asConstant(fn(bindable));
