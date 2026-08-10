import { Arr, Optional, createQueue, expectType } from 'ts-data-forge';
import { type NonEmptyTuple, type Tuple } from 'ts-type-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import { source } from '../create/index.mjs';
import { withInitialValue } from '../operators/index.mjs';
import {
  type InitializedObservable,
  type InitializedSyncChildObservable,
  type NonEmptyUnknownList,
  type Observable,
  type SyncChildObservable,
  type TupleToQueueTuple,
  type UpdateToken,
  type Wrap,
  type ZipObservable,
  type ZipObservableRefined,
} from '../types/index.mjs';

/**
 * Combines multiple observables by pairing their emissions by index.
 * Waits for all sources to emit their nth value before emitting the nth tuple.
 * Completes when any source completes.
 *
 * @template OS - Tuple type of source observables
 * @param parents - Array of observables to zip
 * @returns A zipped observable emitting tuples of values
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  letters$  'A'       'B'       'C'
 * //  numbers$  1         2         3
 * //  zipped$   ['A',1]   ['B',2]   ['C',3]
 * //
 * //  Explanation:
 * //  - zip pairs values by their index from multiple sources
 * //  - Waits for all sources to emit at the same index
 * //  - Completes when any source completes
 *
 * const [letters$, setLetter] = createState<string>('A');
 *
 * const [numbers$, setNumber] = createState<number>(1);
 *
 * const zipped$ = zip([letters$, numbers$]);
 *
 * const valueHistory: (readonly [string, number])[] = [];
 *
 * zipped$.subscribe(([letter, num]) => {
 *   valueHistory.push([letter, num]);
 * });
 *
 * for (const letter of ['B', 'C']) {
 *   setLetter(letter);
 * }
 *
 * for (const num of [2, 3]) {
 *   setNumber(num);
 * }
 *
 * assert.deepStrictEqual(valueHistory, [
 *   ['A', 1],
 *   ['B', 2],
 *   ['C', 3],
 * ]);
 * ```
 */
export const zip = <const OS extends NonEmptyTuple<Observable<unknown>>>(
  parents: OS,
): ZipObservableRefined<OS> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  new ZipObservableClass(parents) as unknown as ZipObservableRefined<OS>;

class ZipObservableClass<const A extends NonEmptyUnknownList>
  extends SyncChildObservableClass<A, A>
  implements ZipObservable<A>
{
  readonly #queues: TupleToQueueTuple<A>;

  constructor(parents: Wrap<A>) {
    const parentsValues: Tuple.MapTo<Optional<A[number]>, A> = Arr.map(
      parents,
      (p) => p.getSnapshot(),
    );

    // The annotation on `initialValue` is what replaces the type assertion.
    // `Arr.map` carries a single result element type, so it reports `A[number]`
    // at every position, and `Tuple.MapTo<A[number], A>` — the uniform mapping
    // — is *not* assignable back to `A`. The positional
    // `Readonly<{ [K in keyof A]: A[K] }>` is, and TypeScript accepts the
    // uniform result into it because the two mapped types share `keyof A`. So
    // it is the annotation, not an assertion, that records the position-wise
    // fact the checker cannot derive on its own.
    const initialValue: Optional<Readonly<{ [K in keyof A]: A[K] }>> =
      Arr.every(parentsValues, Optional.isSome)
        ? Optional.some(Arr.map(parentsValues, (c) => c.value))
        : Optional.none;

    super({
      parents,
      initialValue,
    });

    this.#queues = Arr.map(parents, () => createQueue());
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const queues = this.#queues;

    for (const [index, par] of this.parents.entries()) {
      const sn = par.getSnapshot();

      if (par.updateToken === updateToken && Optional.isSome(sn)) {
        queues[index]?.enqueue(sn.value);
      }
    }

    if (queues.every((list) => !list.isEmpty)) {
      const nextValue =
        // `Arr.map` has a single result element type, so it reports
        // `A[number] | undefined` per position rather than `A[P]`.
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        Arr.map(queues, (q) => Optional.unwrap(q.dequeue())) as A;

      this.setNext(nextValue, updateToken);
    }
  }
}

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

  {
    const s1: Observable<1> = source<1>();

    const s2: Observable<2> = source<2>();

    const _d = zip([s1, s2]);

    expectType<typeof _d, ZipObservable<readonly [1, 2]>>('=');

    expectType<typeof _d, Observable<readonly [1, 2]>>('<=');
  }

  {
    const s1: InitializedObservable<1> = source<1>().pipe(withInitialValue(1));

    const s2: Observable<2> = source<2>();

    const _d = zip([s1, s2]);

    expectType<typeof _d, ZipObservable<readonly [1, 2]>>('=');

    expectType<typeof _d, Observable<readonly [1, 2]>>('<=');
  }

  {
    const s1: InitializedObservable<1> = source<1>().pipe(withInitialValue(1));

    const s2: InitializedObservable<2> = source<2>().pipe(withInitialValue(2));

    const _d = zip([s1, s2]);

    // Returns InitializedObservable if all OS are InitializedObservable
    expectType<typeof _d, InitializedObservable<readonly [1, 2]>>('<=');
  }

  const r1 = source(1);

  const r2 = source('a');

  const _z = zip([r1, r2]);

  const _zi = zip([
    r1.pipe(withInitialValue(0)),
    r2.pipe(withInitialValue('0')),
  ] as const);

  expectType<typeof _z, SyncChildObservable<readonly [number, string]>>('<=');

  expectType<
    typeof _zi,
    InitializedSyncChildObservable<readonly [number, string]>
  >('<=');
}
