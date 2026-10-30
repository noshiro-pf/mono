// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding; an observable is a class (`ObservableBaseClass` says why),
// so those rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import { Arr, Optional } from 'ts-data-forge';
import type { NonEmptyTuple } from 'ts-type-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import type {
  DeriveObservable,
  DeriveObservableRefined,
  NonEmptyUnknownList,
  Observable,
  Unwrap,
  UpdateToken,
  Wrap,
} from '../types/index.mjs';

/**
 * Derives one value from the latest values of several observables: one
 * observable that calls `project` with them, as arguments, and emits the
 * result unless it equals the one already held.
 *
 * It emits once every parent has a value, and then whenever any of them
 * emits, as `combine` does; but where `combine(parents).pipe(map(fn))` is two
 * observables and a tuple per update, `derive` is one, and passes the values
 * as arguments (a rest parameter in `project` collects them into an array
 * again).
 * The comparison is `Object.is` unless `equals` says otherwise.
 *
 * @template OS - Tuple type of the parent observables
 * @template B - The type of the derived value
 * @param parents - The observables to derive from
 * @param project - Computes the value from the parents' values, in order
 * @param options - `equals` compares a result with the one held
 * @returns An observable of the derived value, initialized when every parent is
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  price$     100         120
 * //  quantity$        2            3
 * //  total$           200   240    360
 * //
 * //  Explanation:
 * //  - derive waits for every parent to have a value
 * //  - Then calls the projection with their latest values whenever one emits
 *
 * const price$ = source<number>();
 *
 * const quantity$ = source<number>();
 *
 * const total$ = derive(
 *   [price$, quantity$],
 *   (price, quantity) => price * quantity,
 * );
 *
 * const totalHistory: number[] = [];
 *
 * total$.subscribe((total) => {
 *   totalHistory.push(total);
 * });
 *
 * price$.next(100); // nothing yet: quantity$ has no value
 *
 * quantity$.next(2); // 200
 *
 * price$.next(120); // 240
 *
 * quantity$.next(3); // 360
 *
 * assert.deepStrictEqual(totalHistory, [200, 240, 360]);
 * ```
 */
export const derive = <const OS extends NonEmptyTuple<Observable<unknown>>, B>(
  parents: OS,
  project: (...values: Unwrap<OS>) => B,
  options?: Readonly<{ equals?: (x: B, y: B) => boolean }>,
): DeriveObservableRefined<B, OS> =>
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  new DeriveObservableClass(
    parents,
    // `project` is called with the values of `parents`, position by
    // position, which the checker cannot follow through an index.
    // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
    project as (...values: readonly unknown[]) => B,
    options?.equals ?? Object.is,
  ) as unknown as DeriveObservableRefined<B, OS>;

class DeriveObservableClass<const A extends NonEmptyUnknownList, B>
  extends SyncChildObservableClass<B, A>
  implements DeriveObservable<B, A>
{
  readonly #project: (...values: readonly unknown[]) => B;
  readonly #equals: (x: B, y: B) => boolean;

  /**
   * The parents' values, rewritten by every update. `project` receives them
   * spread, as arguments of its own, so nothing it is given changes later and
   * no array is built per update.
   */
  // @sumi-expect-error readonly/require-readonly-type
  readonly #mut_values: unknown[];

  constructor(
    parents: Wrap<A>,
    project: (...values: readonly unknown[]) => B,
    equals: (x: B, y: B) => boolean,
  ) {
    const snapshots = Arr.map(parents, (p) => p.getSnapshot());

    const mut_values = Array.from(snapshots, (s): unknown =>
      Optional.isSome(s) ? s.value : undefined,
    );

    super({
      parents,
      initialValue: Arr.every(snapshots, Optional.isSome)
        ? Optional.some(project(...mut_values))
        : Optional.none,
    });

    this.#project = project;

    this.#equals = equals;

    this.#mut_values = mut_values;

    this.attach();
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const mut_values = this.#mut_values;

    let mut_updated = false;

    let mut_index = 0;

    for (const parent of this.parents) {
      const snapshot = parent.getSnapshot();

      if (Optional.isNone(snapshot)) {
        return; // a parent has no value yet
      }

      mut_values[mut_index] = snapshot.value;

      mut_index += 1;

      if (parent.updateToken === updateToken) {
        mut_updated = true;
      }
    }

    if (!mut_updated) {
      return; // all parents are skipped
    }

    const next = this.#project(...mut_values);

    const held = this.getSnapshot();

    if (Optional.isSome(held) && this.#equals(held.value, next)) {
      return; // the result did not change
    }

    this.setNext(next, updateToken);
  }
}
