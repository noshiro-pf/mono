// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding; an observable is a class (`ObservableBaseClass` says why),
// so those rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import { Optional, expectType } from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import { source } from '../create/index.mjs';
import type {
  InitializedObservable,
  KeepInitialValueOperator,
  MapOperatorObservable,
  Observable,
  UpdateToken,
} from '../types/index.mjs';
import { withInitialValue } from './with-initial-value.mjs';

/**
 * Transforms each value emitted by the source with a mapping function, and
 * emits the result unless it equals the one already held.
 *
 * The comparison is `Object.is` unless `equals` says otherwise, so a result
 * that did not change wakes nothing below. To pass on every result — an event
 * turned into a value, say — give `equals: () => false`, or use `mapTo`. The
 * mapping function receives the value alone; `withIndex` attaches an index.
 *
 * @template A - The type of values from the source
 * @template B - The type of mapped values
 * @param mapFn - A function that maps each value
 * @param options - `equals` compares a result with the one held
 * @returns An operator that maps values
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  num$      1   3   4   6   7
 * //  parity$   1       0       1
 * //
 * //  Explanation:
 * //  - map transforms each value
 * //  - A result equal to the one held is not emitted
 *
 * const num$ = source<number>();
 *
 * const parity$ = num$.pipe(map((x) => x % 2));
 *
 * const valueHistory: number[] = [];
 *
 * parity$.subscribe((p) => {
 *   valueHistory.push(p);
 * });
 *
 * num$.next(1); // 1
 *
 * num$.next(3); // still 1: not emitted
 *
 * num$.next(4); // 0
 *
 * num$.next(6); // still 0: not emitted
 *
 * num$.next(7); // 1
 *
 * assert.deepStrictEqual(valueHistory, [1, 0, 1]);
 * ```
 */
export const map = <A, B>(
  mapFn: (x: A) => B,
  options?: Readonly<{ equals?: (x: B, y: B) => boolean }>,
): KeepInitialValueOperator<A, B> =>
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  ((parentObservable) =>
    new MapObservableClass(
      parentObservable,
      mapFn,
      options?.equals ?? Object.is,
    )) as KeepInitialValueOperator<A, B>;

/* implementation */

class MapObservableClass<A, B>
  extends SyncChildObservableClass<B, readonly [A]>
  implements MapOperatorObservable<A, B>
{
  readonly #mapFn: (x: A) => B;
  readonly #equals: (x: B, y: B) => boolean;

  constructor(
    parentObservable: Observable<A>,
    mapFn: (x: A) => B,
    equals: (x: B, y: B) => boolean,
  ) {
    super({
      parents: [parentObservable],
      initialValue: Optional.map(parentObservable.getSnapshot(), mapFn),
    });

    this.#mapFn = mapFn;

    this.#equals = equals;

    this.attach();
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updateToken !== updateToken || Optional.isNone(sn)) {
      return; // skip update
    }

    const next = this.#mapFn(sn.value);

    const held = this.getSnapshot();

    if (Optional.isSome(held) && this.#equals(held.value, next)) {
      return; // the result did not change
    }

    this.setNext(next, updateToken);
  }
}

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

  {
    const s: Observable<number> = source<number>();

    const _d1 = s.pipe(map((x) => x + 1));

    expectType<typeof _d1, Observable<number>>('=');
  }

  {
    const s = source<number>();

    const m: InitializedObservable<number> = s.pipe(withInitialValue(0));

    const _d = m.pipe(map((x) => x + 1));

    expectType<typeof _d, InitializedObservable<number>>('=');
  }
}
