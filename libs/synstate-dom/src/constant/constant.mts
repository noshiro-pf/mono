import type { Observable } from 'synstate';
import type { Brand } from 'ts-type-forge';
import { asConstant } from '../internal/index.mjs';

/**
 * A value that is written once and never updated. A brand that exists only in
 * the type system: at run time it is the value itself.
 *
 * A slot that takes data accepts a `Constant<T>` but not a plain `T`, so that a
 * value read once and never updated (`count$.getSnapshot().value`) is a type
 * error rather than a binding that silently stays stale.
 */
export type Constant<T> = Brand<T, 'synstate-dom/Constant'>;

/**
 * Marks a value as a {@link Constant}. Returns the value unchanged.
 *
 * `null` and `undefined` are rejected: an absent attribute is an omitted prop,
 * and a value that comes and goes is an `InitializedObservable<T | undefined>`.
 * An observable is rejected too, since wrapping one would bind it once.
 */
export const constant = <const T,>(
  value: T extends Observable<unknown> | null | undefined ? never : T,
): Constant<T> => asConstant<T>(value);
