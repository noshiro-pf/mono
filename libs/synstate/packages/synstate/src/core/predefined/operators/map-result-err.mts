import { Result, type UnknownResult } from 'ts-data-forge';
import { map } from '../../operators/index.mjs';
import { type KeepInitialValueOperator } from '../../types/index.mjs';

/**
 * Transforms the error value (`Err`) of a `Result` type emitted by the source.
 * If the value is `Err`, the mapping function is applied; if `Ok`, it remains unchanged.
 *
 * @template R - The Result type from the source
 * @template E2 - The type of the mapped error value
 * @param mapFn - A function to transform the Err value
 * @returns An operator that maps the Err side of Result emissions
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  result$   Ok(1)    Err("bad")      Err("fail")
 * //  mapped$   Ok(1)    Err("BAD")      Err("FAIL")
 * //
 * //  Explanation:
 * //  - mapResultErr transforms the Err value of Result emissions
 * //  - Ok values pass through unchanged
 *
 * const result$ = source<Result<number, string>>();
 *
 * const mapped$ = result$.pipe(mapResultErr((e) => e.toUpperCase()));
 *
 * const valueHistory: Result<number, string>[] = [];
 *
 * mapped$.subscribe((v) => {
 *   valueHistory.push(v);
 * });
 *
 * result$.next(Result.ok(1));
 *
 * assert.deepStrictEqual(valueHistory, [Result.ok(1)]);
 *
 * result$.next(Result.err('bad'));
 *
 * assert.deepStrictEqual(valueHistory, [Result.ok(1), Result.err('BAD')]);
 *
 * result$.next(Result.err('fail'));
 *
 * assert.deepStrictEqual(valueHistory, [
 *   Result.ok(1),
 *   Result.err('BAD'),
 *   Result.err('FAIL'),
 * ]);
 * ```
 */
export const mapResultErr = <R extends UnknownResult, E2>(
  mapFn: (x: Result.UnwrapErr<R>) => E2,
): KeepInitialValueOperator<R, Result<Result.UnwrapOk<R>, E2>> =>
  map((a) => Result.mapErr(a, mapFn));
