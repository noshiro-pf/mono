import { Arr, Optional } from 'ts-data-forge';
import { RootObservableClass } from '../class/index.mjs';
import {
  type InitializedSourceObservable,
  type SourceObservable,
} from '../types/index.mjs';

/**
 * Creates a new Observable source that can manually emit values.
 * This is the primary way to create root observables that start reactive chains.
 *
 * @template A - The type of values emitted by the source
 * @returns A SourceObservable that can emit values via `.next()` method
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  count$    1     2     3     ...
 * //
 * //  Explanation:
 * //  - source creates a new observable that you can manually emit values to
 * //  - Use .next() to emit values
 * //  - Foundation for building custom observables
 *
 * const count$ = source<number>();
 *
 * const valueHistory: number[] = [];
 *
 * count$.subscribe((value) => {
 *   valueHistory.push(value);
 * });
 *
 * count$.next(1); // logs: 1
 *
 * assert.deepStrictEqual(valueHistory, [1]);
 *
 * count$.next(2); // logs: 2
 *
 * assert.deepStrictEqual(valueHistory, [1, 2]);
 *
 * count$.next(3); // logs: 3
 *
 * assert.deepStrictEqual(valueHistory, [1, 2, 3]);
 * ```
 */
export function source<const A>(
  initialValue: A,
): InitializedSourceObservable<A>;

export function source<const A>(): SourceObservable<A>;

export function source<const A>(...args: readonly A[]): SourceObservable<A> {
  return new SourceObservableClass<A>(...args);
}

class SourceObservableClass<A>
  extends RootObservableClass<A>
  implements SourceObservable<A>
{
  constructor(...args: readonly A[]) {
    super({
      initialValue: Arr.isNonEmpty(args)
        ? Optional.some(args[0])
        : Optional.none,
    });
  }

  next(nextValue: A): void {
    if (this.isCompleted) return;

    this.startUpdate(nextValue);
  }
}
