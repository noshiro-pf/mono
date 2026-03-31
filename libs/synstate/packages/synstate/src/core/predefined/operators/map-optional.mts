import { Optional } from 'ts-data-forge';
import { map } from '../../operators/index.mjs';
import { type KeepInitialValueOperator } from '../../types/index.mjs';

/**
 * Transforms the inner value of an `Optional` type emitted by the source.
 * If the value is `Some`, the mapping function is applied; if `None`, it remains `None`.
 *
 * @template O - The Optional type from the source
 * @template B - The type of the mapped inner value
 * @param mapFn - A function to transform the unwrapped value
 * @returns An operator that maps the inner value of Optional emissions
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  value$    Some(2)    None       Some(5)
 * //  doubled$  Some(4)    None       Some(10)
 * //
 * //  Explanation:
 * //  - mapOptional transforms the inner value of Optional emissions
 * //  - Some values are mapped; None values pass through unchanged
 *
 * const value$ = source<Optional<number>>();
 *
 * const doubled$ = value$.pipe(mapOptional((x) => x * 2));
 *
 * const valueHistory: Optional<number>[] = [];
 *
 * doubled$.subscribe((v) => {
 *   valueHistory.push(v);
 * });
 *
 * value$.next(Optional.some(2));
 *
 * assert.deepStrictEqual(valueHistory, [Optional.some(4)]);
 *
 * value$.next(Optional.none);
 *
 * assert.deepStrictEqual(valueHistory, [Optional.some(4), Optional.none]);
 *
 * value$.next(Optional.some(5));
 *
 * assert.deepStrictEqual(valueHistory, [
 *   Optional.some(4),
 *   Optional.none,
 *   Optional.some(10),
 * ]);
 * ```
 */
export const mapOptional = <O extends UnknownOptional, B>(
  mapFn: (x: Optional.Unwrap<O>) => B,
): KeepInitialValueOperator<O, Optional<B>> =>
  map((a) => Optional.map(a, mapFn));
