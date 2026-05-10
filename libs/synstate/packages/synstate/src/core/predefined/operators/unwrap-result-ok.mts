import { Result, type UnknownResult } from 'ts-data-forge';
import { type Fn } from 'ts-type-forge';
import { map } from '../../operators/index.mjs';
import { type KeepInitialValueOperator } from '../../types/index.mjs';

/**
 * Unwraps the success value from a `Result`, converting `Ok(value)` to `value` and `Err` to `undefined`.
 *
 * @template R - The Result type from the source
 * @returns An operator that unwraps the Ok side of Result emissions
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  result$     Ok(42)    Err("e")    Ok(7)
 * //  unwrapped$  42        undefined   7
 * //
 * //  Explanation:
 * //  - unwrapResultOk converts Ok(value) to value, and Err to undefined
 * //  - Useful for extracting success values from Result streams
 *
 * const result$ = source<Result<number, string>>();
 *
 * const unwrapped$ = result$.pipe(unwrapResultOk());
 *
 * const valueHistory: (number | undefined)[] = [];
 *
 * unwrapped$.subscribe((v) => {
 *   valueHistory.push(v);
 * });
 *
 * result$.next(Result.ok(42));
 *
 * assert.deepStrictEqual(valueHistory, [42]);
 *
 * result$.next(Result.err('e'));
 *
 * assert.deepStrictEqual(valueHistory, [42, undefined]);
 *
 * result$.next(Result.ok(7));
 *
 * assert.deepStrictEqual(valueHistory, [42, undefined, 7]);
 * ```
 */
export const unwrapResultOk = <
  R extends UnknownResult,
>(): KeepInitialValueOperator<R, Result.UnwrapOk<R> | undefined> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  map(Result.unwrapOk as Fn<R, Result.UnwrapOk<R> | undefined>);
