import { Optional } from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type DropInitialValueOperator,
  type Observable,
  type PairwiseOperatorObservable,
  type UpdaterSymbol,
} from '../types/index.mjs';

/**
 * Emits the previous and current values as a pair.
 * Does not emit until the source has emitted at least twice.
 *
 * @template A - The type of values from the source
 * @returns An operator that pairs consecutive values
 *
 * @example
 * ```ts
 * const num$ = source<number>();
 *
 * const pairs$ = num$.pipe(pairwise());
 *
 * pairs$.subscribe(([prev, curr]) => {
 *   console.log(prev, curr);
 * });
 *
 * num$.next(1); // nothing logged
 *
 * num$.next(2); // logs: 1, 2
 *
 * num$.next(3); // logs: 2, 3
 * ```
 */
export const pairwise = <A,>(): DropInitialValueOperator<A, readonly [A, A]> =>
  f;

const f = <A,>(parentObservable: Observable<A>): Observable<readonly [A, A]> =>
  new PairwiseObservableClass(parentObservable);

class PairwiseObservableClass<A>
  extends SyncChildObservableClass<readonly [A, A], readonly [A]>
  implements PairwiseOperatorObservable<A>
{
  #mut_previousValue: Optional<A>;

  constructor(parentObservable: Observable<A>) {
    super({
      parents: [parentObservable],
      initialValue: Optional.none,
    });

    // parentObservable.snapshot has value
    // if parentObservable is InitializedObservable
    this.#mut_previousValue = parentObservable.getSnapshot();
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Optional.isNone(sn)) {
      return; // skip update
    }

    const prev = this.#mut_previousValue;

    const cond = !Optional.isNone(prev);

    // NOTE: Must update before setNext, otherwise Optional.isNone(prev) remains true when tryUpdate is called consecutively
    this.#mut_previousValue = par.getSnapshot();

    if (cond) {
      this.setNext([prev.value, sn.value], updaterSymbol);
    }
  }
}
