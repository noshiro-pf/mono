import type { AsyncData } from '../async-data.mjs';
import { err } from './async-data-err.mjs';
import { isErr } from './async-data-is-err.mjs';

/**
 * Maps the error of an Err, keeping its `previous`.
 *
 * @example
 *
 * ```ts
 * const failed = AsyncData.err(new Error('boom'), Optional.some(1));
 *
 * assert.deepStrictEqual(
 *   AsyncData.mapErr(failed, (error) => error.message),
 *   AsyncData.err('boom', Optional.some(1)),
 * );
 *
 * assert.deepStrictEqual(
 *   AsyncData.mapErr(AsyncData.ok(1), (error: string) => error.length),
 *   AsyncData.ok(1),
 * );
 * ```
 */
export function mapErr<S, E, E2>(
  data: AsyncData<S, E>,
  mapFn: (error: E) => E2,
): AsyncData<S, E2>;

// Curried version
export function mapErr<E, E2>(
  mapFn: (error: E) => E2,
): <S>(data: AsyncData<S, E>) => AsyncData<S, E2>;

export function mapErr<S, E, E2>(
  ...args:
    | readonly [data: AsyncData<S, E>, mapFn: (error: E) => E2]
    | readonly [mapFn: (error: E) => E2]
): AsyncData<S, E2> | ((data: AsyncData<S, E>) => AsyncData<S, E2>) {
  switch (args.length) {
    case 2: {
      const [data, mapFn] = args;

      return mapErrImpl(data, mapFn);
    }

    case 1: {
      const [mapFn] = args;

      return (data: AsyncData<S, E>) => mapErrImpl(data, mapFn);
    }
  }
}

const mapErrImpl = <S, E, E2>(
  data: AsyncData<S, E>,
  mapFn: (error: E) => E2,
): AsyncData<S, E2> =>
  isErr(data) ? err(mapFn(data.value), data.previous) : data;
