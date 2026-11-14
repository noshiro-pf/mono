import type { UnknownRecord } from 'ts-type-forge';
import { hasKey, isRecord } from '../../../guard/index.mjs';
import { Result } from '../../result/index.mjs';
import type { UnknownAsyncData } from '../async-data.mjs';
import { IdleTypeTagName, PendingTypeTagName } from './tag.mjs';

/**
 * Checks if a value is an `AsyncData`. A plain `Result.err`, which has no
 * `previous`, is not one.
 *
 * @example
 *
 * ```ts
 * assert.isTrue(AsyncData.isAsyncData(AsyncData.idle));
 *
 * assert.isTrue(AsyncData.isAsyncData(AsyncData.err('boom')));
 *
 * // A plain Err has no `previous`.
 * assert.isFalse(AsyncData.isAsyncData(Result.err('boom')));
 *
 * assert.isFalse(AsyncData.isAsyncData('loading'));
 * ```
 */
export const isAsyncData = (
  maybeAsyncData: unknown,
): maybeAsyncData is UnknownAsyncData => {
  if (!isRecord(maybeAsyncData) || !hasKey(maybeAsyncData, '$$tag')) {
    return false;
  }

  if (maybeAsyncData.$$tag === IdleTypeTagName) {
    return true;
  }

  if (!Result.isResult(maybeAsyncData)) {
    return (
      maybeAsyncData.$$tag === PendingTypeTagName && hasPrevious(maybeAsyncData)
    );
  }

  return Result.isOk(maybeAsyncData) || hasPrevious(maybeAsyncData);
};

// Whether the record has the key, not what it holds: a `Some` of `undefined` or
// `null` is that value at runtime, so a `previous` holding it is nullish. An
// AsyncData from a ts-std-forge before Optional was unwrapped, whose `previous`
// is `{ $$tag, value }`, passes too: values from before that change do not mix
// with these, here as anywhere.
const hasPrevious = (record: UnknownRecord): boolean =>
  hasKey(record, 'previous');
