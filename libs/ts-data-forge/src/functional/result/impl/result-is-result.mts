import { hasKey, isRecord } from '../../../guard/index.mjs';
import { ErrTypeTagName, OkTypeTagName } from './tag.mjs';

/**
 * Checks whether the provided value is a {@link Result<S, E>}.
 *
 * @example
 *
 * ```ts
 * const okValue = Result.ok('success');
 * const errValue = Result.err(new Error('failure'));
 * const notResult = { $$tag: 'ts-data-forge::Result.ok' };
 *
 * assert.ok(Result.isResult(okValue));
 * assert.ok(Result.isResult(errValue));
 * assert.notOk(Result.isResult(notResult));
 * ```
 */
export const isResult = (maybeResult: unknown): maybeResult is UnknownResult =>
  isRecord(maybeResult) &&
  hasKey(maybeResult, '$$tag') &&
  hasKey(maybeResult, 'value') &&
  (maybeResult.$$tag === ErrTypeTagName || maybeResult.$$tag === OkTypeTagName);
