import { hasKey, isRecord } from '../../../guard/index.mjs';
import { ErrTypeTagName, OkTypeTagName, WarnTypeTagName } from './tag.mjs';

/**
 * Checks whether the provided value is a {@link TernaryResult}.
 *
 * @example
 *
 * ```ts
 * const okValue = TernaryResult.ok('done');
 *
 * const warnValue = TernaryResult.warn('done', 'retry later');
 *
 * const notResult = { $$tag: 'ts-data-forge::Result.ok' };
 *
 * assert.ok(TernaryResult.isTernaryResult(okValue));
 *
 * assert.ok(TernaryResult.isTernaryResult(warnValue));
 *
 * assert.ok(!TernaryResult.isTernaryResult(notResult));
 * ```
 */
export const isTernaryResult = (
  maybeResult: unknown,
): maybeResult is UnknownTernaryResult =>
  isRecord(maybeResult) &&
  hasKey(maybeResult, '$$tag') &&
  hasKey(maybeResult, 'value') &&
  ((maybeResult.$$tag === WarnTypeTagName && hasKey(maybeResult, 'warning')) ||
    maybeResult.$$tag === OkTypeTagName ||
    maybeResult.$$tag === ErrTypeTagName);
