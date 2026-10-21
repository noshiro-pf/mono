import { Result, type UnknownResult } from 'ts-data-forge';
import { map } from '../../operators/index.mjs';
import { type KeepInitialValueOperator } from '../../types/index.mjs';

/**
 * Transforms the success value (`Ok`) of a `Result` type emitted by the source.
 * If the value is `Ok`, the mapping function is applied; if `Err`, it remains unchanged.
 *
 * @template R - The Result type from the source
 * @template S2 - The type of the mapped success value
 * @param mapFn - A function to transform the Ok value
 * @returns An operator that maps the Ok side of Result emissions
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  result$   Ok(2)      Err("e")   Ok(5)
 * //  doubled$  Ok(4)      Err("e")   Ok(10)
 * //
 * //  Explanation:
 * //  - mapResultOk transforms the Ok value of Result emissions
 * //  - Err values pass through unchanged
 *
 * const result$ = source<Result<number, string>>();
 *
 * const doubled$ = result$.pipe(mapResultOk((x) => x * 2));
 *
 * const valueHistory: Result<number, string>[] = [];
 *
 * doubled$.subscribe((v) => {
 *   valueHistory.push(v);
 * });
 *
 * result$.next(Result.ok(2));
 *
 * assert.deepStrictEqual(valueHistory, [Result.ok(4)]);
 *
 * result$.next(Result.err('e'));
 *
 * assert.deepStrictEqual(valueHistory, [Result.ok(4), Result.err('e')]);
 *
 * result$.next(Result.ok(5));
 *
 * assert.deepStrictEqual(valueHistory, [
 *   Result.ok(4),
 *   Result.err('e'),
 *   Result.ok(10),
 * ]);
 * ```
 */
export const mapResultOk = <R extends UnknownResult, S2>(
  mapFn: (x: Result.UnwrapOk<R>) => S2,
): KeepInitialValueOperator<R, Result<S2, Result.UnwrapErr<R>>> =>
  map(Result.map(mapFn));
