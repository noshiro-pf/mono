import { map } from '../../operators/index.mjs';
import { type KeepInitialValueOperator } from '../../types/index.mjs';

/**
 * Maps all emitted values to a constant value, ignoring the source values.
 * Equivalent to `map(() => value)`.
 *
 * @template A - The type of values from the source
 * @template B - The type of the constant value
 * @param value - The constant value to emit
 * @returns An operator that always emits the given constant
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  click$    MouseEvent   MouseEvent   MouseEvent
 * //  count$    1            1            1
 * //
 * //  Explanation:
 * //  - mapTo maps all emitted values to a constant value
 * //  - Ignores the source values entirely
 * //  - Useful for converting events to signals
 *
 * const click$ = source<string>();
 *
 * const one$ = click$.pipe(mapTo(1));
 *
 * const valueHistory: number[] = [];
 *
 * one$.subscribe((value) => {
 *   valueHistory.push(value);
 * });
 *
 * click$.next('click1');
 *
 * click$.next('click2');
 *
 * click$.next('click3');
 *
 * assert.deepStrictEqual(valueHistory, [1, 1, 1]);
 * ```
 */
export const mapTo = <A, B>(value: B): KeepInitialValueOperator<A, B> =>
  map(() => value);
