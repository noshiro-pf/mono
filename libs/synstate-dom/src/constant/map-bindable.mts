import { isObservable, map } from 'synstate';
import { asConstant } from '../internal/index.mjs';
import type { Bindable } from './bindable.mjs';

/**
 * Applies `fn` to the value of a {@link Bindable}, keeping its kind.
 *
 * - A constant gives a constant: `fn` runs once and no node is created.
 * - An observable gives `bindable.pipe(map(fn))`.
 */
export const mapBindable = <A, B>(
  bindable: Bindable<A>,
  fn: (value: A) => B,
): Bindable<B> =>
  isObservable(bindable) ? bindable.pipe(map(fn)) : asConstant(fn(bindable));
