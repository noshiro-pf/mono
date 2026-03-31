import { Result } from 'ts-data-forge';
import { map } from '../../operators/index.mjs';
import { type KeepInitialValueOperator } from '../../types/index.mjs';

/**
 * Unwraps the error value from a `Result`, converting `Err(error)` to `error` and `Ok` to `undefined`.
 *
 * @template R - The Result type from the source
 * @returns An operator that unwraps the Err side of Result emissions
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  result$     Ok(1)      Err("fail")   Ok(2)
 * //  unwrapped$  undefined  "fail"        undefined
 * //
 * //  Explanation:
 * //  - unwrapResultErr converts Err(error) to error, and Ok to undefined
 * //  - Useful for extracting error values from Result streams
 *
 * const result$ = source<Result<number, string>>();
 *
 * const unwrapped$ = result$.pipe(unwrapResultErr());
 *
 * const valueHistory: (string | undefined)[] = [];
 *
 * unwrapped$.subscribe((v) => {
 *   valueHistory.push(v);
 * });
 *
 * result$.next(Result.ok(1));
 *
 * assert.deepStrictEqual(valueHistory, [undefined]);
 *
 * result$.next(Result.err('fail'));
 *
 * assert.deepStrictEqual(valueHistory, [undefined, 'fail']);
 *
 * result$.next(Result.ok(2));
 *
 * assert.deepStrictEqual(valueHistory, [undefined, 'fail', undefined]);
 * ```
 */
export const unwrapResultErr = <
  R extends UnknownResult,
>(): KeepInitialValueOperator<R, Result.UnwrapErr<R> | undefined> =>
  map(Result.unwrapErr as Fn<R, Result.UnwrapErr<R> | undefined>);
