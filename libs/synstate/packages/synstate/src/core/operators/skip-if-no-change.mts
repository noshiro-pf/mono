import { Optional } from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type KeepInitialValueOperator,
  type Observable,
  type SkipIfNoChangeOperatorObservable,
  type UpdaterSymbol,
} from '../types/index.mjs';

/**
 * Skips emissions if the value hasn't changed from the previous emission.
 * Uses a custom equality function or Object.is by default.
 *
 * @template A - The type of values from the source
 * @param eq - Equality comparison function (default: Object.is)
 * @returns An operator that skips duplicate consecutive values
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  num$      1     1     2     2     2     3
 * //  distinct$ 1           2                 3
 * //
 * //  Explanation:
 * //  - skipIfNoChange filters out consecutive duplicate values
 * //  - Uses strict equality (===) for comparison
 * //  - Only emits when the value actually changes
 *
 * const num$ = source<number>();
 *
 * const distinct$ = num$.pipe(skipIfNoChange());
 *
 * const mut_history: number[] = [];
 *
 * distinct$.subscribe((x) => {
 *   mut_history.push(x);
 * });
 *
 * num$.next(1); // logs: 1
 *
 * assert.deepStrictEqual(mut_history, [1]);
 *
 * num$.next(1); // nothing logged
 *
 * assert.deepStrictEqual(mut_history, [1]);
 *
 * num$.next(2); // logs: 2
 *
 * assert.deepStrictEqual(mut_history, [1, 2]);
 *
 * num$.next(2); // nothing logged
 *
 * num$.next(3); // logs: 3
 *
 * assert.deepStrictEqual(mut_history, [1, 2, 3]);
 * ```
 */
export const skipIfNoChange = <A,>(
  eq: (x: A, y: A) => boolean = (x, y) => Object.is(x, y),
): KeepInitialValueOperator<A, A> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    new SkipIfNoChangeObservableClass(
      parentObservable,
      eq,
    )) as KeepInitialValueOperator<A, A>;

/**
 * Alias for `skipIfNoChange()`.
 * @see skipIfNoChange
 */
export const distinctUntilChanged = skipIfNoChange; // alias

class SkipIfNoChangeObservableClass<A>
  extends SyncChildObservableClass<A, readonly [A]>
  implements SkipIfNoChangeOperatorObservable<A>
{
  readonly #eq: (x: A, y: A) => boolean;
  #mut_previousValue: Optional<A>;

  constructor(parentObservable: Observable<A>, eq: (x: A, y: A) => boolean) {
    super({
      parents: [parentObservable],
      initialValue: parentObservable.getSnapshot(),
    });

    // parentObservable.snapshot has value
    // if parentObservable is InitializedObservable
    this.#mut_previousValue = parentObservable.getSnapshot();

    this.#eq = eq;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Optional.isNone(sn)) {
      return; // skip update
    }

    const prev = this.#mut_previousValue;

    const cond = Optional.isNone(prev) || !this.#eq(prev.value, sn.value);

    // NOTE: Must update before setNext, otherwise Optional.isNone(prev) remains true when tryUpdate is called consecutively
    this.#mut_previousValue = sn;

    if (cond) {
      this.setNext(sn.value, updaterSymbol);
    }
  }
}
