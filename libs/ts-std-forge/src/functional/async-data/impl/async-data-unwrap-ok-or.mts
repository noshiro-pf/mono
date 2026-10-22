import type { AsyncData } from '../async-data.mjs';
import { isOk } from './async-data-is-ok.mjs';

/**
 * The value of an Ok, otherwise `defaultValue`.
 *
 * @example
 *
 * ```ts
 * assert.strictEqual(AsyncData.unwrapOkOr(AsyncData.ok(1), 0), 1);
 *
 * assert.strictEqual(AsyncData.unwrapOkOr(AsyncData.err('boom'), 0), 0);
 *
 * const unwrapOrZero = AsyncData.unwrapOkOr(0);
 *
 * assert.strictEqual(unwrapOrZero(AsyncData.idle), 0);
 * ```
 */
export function unwrapOkOr<S, D>(
  data: AsyncData<S, unknown>,
  defaultValue: D,
): D | S;

// Curried version
export function unwrapOkOr<D>(
  defaultValue: D,
): <S>(data: AsyncData<S, unknown>) => D | S;

export function unwrapOkOr<S, D>(
  ...args:
    | readonly [data: AsyncData<S, unknown>, defaultValue: D]
    | readonly [defaultValue: D]
): D | S | ((data: AsyncData<S, unknown>) => D | S) {
  switch (args.length) {
    case 2: {
      const [data, defaultValue] = args;

      return unwrapOkOrImpl(data, defaultValue);
    }

    case 1: {
      const [defaultValue] = args;

      return (data: AsyncData<S, unknown>) =>
        unwrapOkOrImpl(data, defaultValue);
    }
  }
}

const unwrapOkOrImpl = <S, D>(
  data: AsyncData<S, unknown>,
  defaultValue: D,
): D | S => (isOk(data) ? data.value : defaultValue);
