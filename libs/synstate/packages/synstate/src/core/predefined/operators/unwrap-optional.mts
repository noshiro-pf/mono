import { Optional } from 'ts-data-forge';
import { map } from '../../operators/index.mjs';
import { type KeepInitialValueOperator } from '../../types/index.mjs';

/**
 * Unwraps `Optional` values, converting `Some(value)` to `value` and `None` to `undefined`.
 *
 * @template O - The Optional type from the source
 * @returns An operator that unwraps Optional emissions
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  opt$        Some(42)    None        Some(7)
 * //  unwrapped$  42          undefined   7
 * //
 * //  Explanation:
 * //  - unwrapOptional converts Some(value) to value, and None to undefined
 * //  - Useful for extracting raw values from Optional streams
 *
 * const opt$ = source<Optional<number>>();
 *
 * const unwrapped$ = opt$.pipe(unwrapOptional());
 *
 * const valueHistory: (number | undefined)[] = [];
 *
 * unwrapped$.subscribe((v) => {
 *   valueHistory.push(v);
 * });
 *
 * opt$.next(Optional.some(42));
 *
 * assert.deepStrictEqual(valueHistory, [42]);
 *
 * opt$.next(Optional.none);
 *
 * assert.deepStrictEqual(valueHistory, [42, undefined]);
 *
 * opt$.next(Optional.some(7));
 *
 * assert.deepStrictEqual(valueHistory, [42, undefined, 7]);
 * ```
 */
export const unwrapOptional = <
  O extends UnknownOptional,
>(): KeepInitialValueOperator<O, Optional.Unwrap<O> | undefined> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  map(Optional.unwrap as Fn<O, Optional.Unwrap<O> | undefined>);
