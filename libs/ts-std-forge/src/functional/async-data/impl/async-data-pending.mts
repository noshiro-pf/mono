import { Optional } from '../../optional/index.mjs';
import type { AsyncPending } from '../async-data.mjs';
import { PendingTypeTagName } from './tag.mjs';

/**
 * The `AsyncData` of a request in flight. To start a request from an existing
 * `AsyncData`, `AsyncData.toPending` fills `previous` in.
 *
 * @example
 *
 * ```ts
 * const firstLoad = AsyncData.pending();
 *
 * assert.deepStrictEqual(firstLoad.previous, Optional.none);
 *
 * const reload = AsyncData.pending(Optional.some([1, 2, 3]));
 *
 * assert.deepStrictEqual(reload.previous, Optional.some([1, 2, 3]));
 * ```
 *
 * @param previous The latest success value; `Optional.none` when omitted.
 */
export const pending = <S = never,>(
  // Not a default parameter: a `Some` of `undefined` is `undefined` at runtime,
  // which a default would replace with `Optional.none`.
  ...args: readonly [] | readonly [previous: Optional<S>]
): AsyncPending<S> =>
  ({
    $$tag: PendingTypeTagName,
    previous: args.length === 0 ? Optional.none : args[0],
  }) as const;
