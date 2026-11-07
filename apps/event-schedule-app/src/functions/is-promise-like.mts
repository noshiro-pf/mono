import { isNonNullObject } from 'ts-data-forge';

/**
 * Whether `value` is a thenable. `then` is read through the prototype chain, as
 * `await` reads it: a native promise's `then` is on `Promise.prototype`, so
 * `hasKey`, which sees own properties only, never finds it.
 */
export const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  isNonNullObject(value) && typeof Reflect.get(value, 'then') === 'function';
