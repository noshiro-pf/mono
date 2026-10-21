import { type SafeUint } from 'ts-type-forge';
import { map } from '../../operators/index.mjs';
import { type KeepInitialValueOperator } from '../../types/index.mjs';

/**
 * Attaches a sequential index to each emitted value, producing `[index, value]` tuples.
 * Index starts at 0 and increments with each emission.
 *
 * @template A - The type of values from the source
 * @returns An operator that emits `[index, value]` tuples
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  letter$    "A"      "B"      "C"
 * //  indexed$   [0,"A"]  [1,"B"]  [2,"C"]
 * //
 * //  Explanation:
 * //  - attachIndex attaches a sequential index to each emitted value
 * //  - Produces [index, value] tuples
 * //  - Index starts at 0 and increments with each emission
 *
 * const letter$ = source<string>();
 *
 * const indexed$ = letter$.pipe(attachIndex());
 *
 * const valueHistory: (readonly [number, string])[] = [];
 *
 * indexed$.subscribe(([i, letter]) => {
 *   valueHistory.push([i, letter]);
 * });
 *
 * letter$.next('A');
 *
 * assert.deepStrictEqual(valueHistory, [[0, 'A']]);
 *
 * letter$.next('B');
 *
 * assert.deepStrictEqual(valueHistory, [
 *   [0, 'A'],
 *   [1, 'B'],
 * ]);
 *
 * letter$.next('C');
 *
 * assert.deepStrictEqual(valueHistory, [
 *   [0, 'A'],
 *   [1, 'B'],
 *   [2, 'C'],
 * ]);
 * ```
 */
export const withIndex = <A,>(): KeepInitialValueOperator<
  A,
  readonly [SafeUint | -1, A]
> => map((a, i) => [i, a] as const);

/**
 * Alias for `withIndex`.
 * @see withIndex
 */
export const attachIndex = withIndex;
