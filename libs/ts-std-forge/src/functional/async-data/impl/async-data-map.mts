import { Optional } from '../../optional/index.mjs';
import type { AsyncData } from '../async-data.mjs';
import { err } from './async-data-err.mjs';
import { isIdle } from './async-data-is-idle.mjs';
import { isOk } from './async-data-is-ok.mjs';
import { isPending } from './async-data-is-pending.mjs';
import { ok } from './async-data-ok.mjs';
import { pending } from './async-data-pending.mjs';

/**
 * Maps the success value: the value of an Ok and the `previous` of a Pending or
 * an Err.
 *
 * @example
 *
 * ```ts
 * assert.deepStrictEqual(
 *   AsyncData.map(AsyncData.ok(3), (n) => n * 2),
 *   AsyncData.ok(6),
 * );
 *
 * // The previous value is mapped as well.
 * assert.deepStrictEqual(
 *   AsyncData.map(AsyncData.err('boom', Optional.some(3)), (n) => n * 2),
 *   AsyncData.err('boom', Optional.some(6)),
 * );
 *
 * const doubleData = AsyncData.map((n: number) => n * 2);
 *
 * assert.deepStrictEqual(
 *   doubleData(AsyncData.pending(Optional.some(1))),
 *   AsyncData.pending(Optional.some(2)),
 * );
 * ```
 */
export function map<S, E, S2>(
  data: AsyncData<S, E>,
  mapFn: (value: S) => S2,
): AsyncData<S2, E>;

// Curried version
export function map<S, S2>(
  mapFn: (value: S) => S2,
): <E>(data: AsyncData<S, E>) => AsyncData<S2, E>;

export function map<S, E, S2>(
  ...args:
    | readonly [data: AsyncData<S, E>, mapFn: (value: S) => S2]
    | readonly [mapFn: (value: S) => S2]
): AsyncData<S2, E> | ((data: AsyncData<S, E>) => AsyncData<S2, E>) {
  switch (args.length) {
    case 2: {
      const [data, mapFn] = args;

      return mapImpl(data, mapFn);
    }

    case 1: {
      const [mapFn] = args;

      return (data: AsyncData<S, E>) => mapImpl(data, mapFn);
    }
  }
}

const mapImpl = <S, E, S2>(
  data: AsyncData<S, E>,
  mapFn: (value: S) => S2,
): AsyncData<S2, E> =>
  isIdle(data)
    ? data
    : isPending(data)
      ? pending(Optional.map(data.previous, mapFn))
      : isOk(data)
        ? ok(mapFn(data.value))
        : err(data.value, Optional.map(data.previous, mapFn));
