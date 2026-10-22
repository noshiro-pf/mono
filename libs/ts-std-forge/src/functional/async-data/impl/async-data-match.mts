import type { Optional } from '../../optional/index.mjs';
import type { AsyncData } from '../async-data.mjs';
import { isIdle } from './async-data-is-idle.mjs';
import { isOk } from './async-data-is-ok.mjs';
import { isPending } from './async-data-is-pending.mjs';

/**
 * Handles each of the four states and returns what the handler returns.
 * `pending` and `err` receive the latest success value as `previous`.
 *
 * @example
 *
 * ```ts
 * const render = AsyncData.match({
 *   idle: () => 'Press the button',
 *   pending: (previous: Optional<number>) =>
 *     Optional.isSome(previous) ? `Updating ${previous.value}` : 'Loading',
 *   ok: (value: number) => `Value: ${value}`,
 *   err: (error: string) => `Failed: ${error}`,
 * });
 *
 * assert.strictEqual(render(AsyncData.idle), 'Press the button');
 *
 * assert.strictEqual(render(AsyncData.pending()), 'Loading');
 *
 * assert.strictEqual(
 *   render(AsyncData.pending(Optional.some(1))),
 *   'Updating 1',
 * );
 *
 * assert.strictEqual(render(AsyncData.ok(2)), 'Value: 2');
 *
 * assert.strictEqual(render(AsyncData.err('timeout')), 'Failed: timeout');
 * ```
 */
export function match<S, E, I, P, O, X>(
  data: AsyncData<S, E>,
  cases: Cases<S, E, I, P, O, X>,
): I | O | P | X;

// Curried version
export function match<S, E, I, P, O, X>(
  cases: Cases<S, E, I, P, O, X>,
): (data: AsyncData<S, E>) => I | O | P | X;

export function match<S, E, I, P, O, X>(
  ...args:
    | readonly [data: AsyncData<S, E>, cases: Cases<S, E, I, P, O, X>]
    | readonly [cases: Cases<S, E, I, P, O, X>]
): I | O | P | X | ((data: AsyncData<S, E>) => I | O | P | X) {
  switch (args.length) {
    case 2: {
      const [data, cases] = args;

      return matchImpl(data, cases);
    }

    case 1: {
      const [cases] = args;

      return (data: AsyncData<S, E>) => matchImpl(data, cases);
    }
  }
}

type Cases<S, E, I, P, O, X> = Readonly<{
  idle: () => I;
  pending: (previous: Optional<S>) => P;
  ok: (value: S) => O;
  err: (error: E, previous: Optional<S>) => X;
}>;

const matchImpl = <S, E, I, P, O, X>(
  data: AsyncData<S, E>,
  cases: Cases<S, E, I, P, O, X>,
): I | O | P | X =>
  isIdle(data)
    ? cases.idle()
    : isPending(data)
      ? cases.pending(data.previous)
      : isOk(data)
        ? cases.ok(data.value)
        : cases.err(data.value, data.previous);
