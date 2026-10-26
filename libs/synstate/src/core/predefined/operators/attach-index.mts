// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding; an observable is a class (`ObservableBaseClass` says why),
// so those rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import { Optional, SafeUint, asSafeUint } from 'ts-data-forge';
import { SyncChildObservableClass } from '../../class/index.mjs';
import type {
  KeepInitialValueOperator,
  Observable,
  UpdateToken,
} from '../../types/index.mjs';

/**
 * Attaches a sequential index to each emitted value, producing `[index, value]` tuples.
 * Index starts at 0 and increments with each emission; a value the source
 * already holds when this is applied gets -1. Use it where `map` used to
 * receive an index.
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
> =>
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  ((parentObservable) =>
    new WithIndexObservableClass(parentObservable)) as KeepInitialValueOperator<
    A,
    readonly [SafeUint | -1, A]
  >;

/**
 * Alias for `withIndex`.
 * @see withIndex
 */
export const attachIndex = withIndex;

/* implementation */

class WithIndexObservableClass<A> extends SyncChildObservableClass<
  readonly [SafeUint | -1, A],
  readonly [A]
> {
  #mut_index: SafeUint | -1;

  constructor(parentObservable: Observable<A>) {
    super({
      parents: [parentObservable],
      initialValue: Optional.map(
        parentObservable.getSnapshot(),
        (a) => [-1, a] as const,
      ),
    });

    this.#mut_index = -1;

    this.attach();
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updateToken !== updateToken || Optional.isNone(sn)) {
      return; // skip update
    }

    this.#mut_index =
      this.#mut_index === -1 ? asSafeUint(0) : SafeUint.add(1, this.#mut_index);

    this.setNext([this.#mut_index, sn.value], updateToken);
  }
}
