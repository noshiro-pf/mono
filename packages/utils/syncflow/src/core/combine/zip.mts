import { Maybe, createQueue, expectType } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import { fromArray, source } from '../create/index.mjs';
import { setInitialValue } from '../operators/index.mjs';
import {
  type InitializedObservable,
  type InitializedSyncChildObservable,
  type NonEmptyUnknownList,
  type Observable,
  type SyncChildObservable,
  type TupleToQueueTuple,
  type UpdaterSymbol,
  type Wrap,
  type ZipObservable,
  type ZipObservableRefined,
} from '../types/index.mjs';

export const zip = <OS extends NonEmptyArray<Observable<unknown>>>(
  parents: OS,
): ZipObservableRefined<OS> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  new ZipObservableClass(parents) as never;

class ZipObservableClass<A extends NonEmptyUnknownList>
  extends SyncChildObservableClass<A, 'zip', A>
  implements ZipObservable<A>
{
  readonly #queues: TupleToQueueTuple<A>;

  constructor(parents: Wrap<A>) {
    const parentsValues = parents.map((p) => p.snapshot);
    super({
      parents,
      type: 'zip',
      initialValue: parentsValues.every(Maybe.isSome)
        ? Maybe.some(
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            parentsValues.map((c) => c.value) as unknown as A,
          )
        : Maybe.none,
    });

    this.#queues =
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      parents.map(createQueue) as unknown as TupleToQueueTuple<A>;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const queues = this.#queues;
    for (const [index, par] of this.parents.entries()) {
      if (par.updaterSymbol === updaterSymbol && Maybe.isSome(par.snapshot)) {
        queues[index]?.enqueue(par.snapshot.value);
      }
    }

    if (queues.every((list) => !list.isEmpty)) {
      const nextValue =
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        queues.map((q) => q.dequeue()) as unknown as A;

      this.setNext(nextValue, updaterSymbol);
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
    const s1: InitializedObservable<1> = source<1>().chain(setInitialValue(1));
    const s2: Observable<2> = source<2>();
    const _d = zip([s1, s2]);

    expectType<typeof _d, ZipObservable<readonly [1, 2]>>('=');
    expectType<typeof _d, Observable<readonly [1, 2]>>('<=');
  }

  {
    const s1: InitializedObservable<1> = source<1>().chain(setInitialValue(1));
    const s2: InitializedObservable<2> = source<2>().chain(setInitialValue(2));
    const _d = zip([s1, s2]);

    // OS がすべて InitializedObservable であれば InitializedObservable を返す
    expectType<typeof _d, InitializedObservable<readonly [1, 2]>>('<=');
  }

  const r1 = fromArray([1, 2, 3]);
  const r2 = fromArray(['a', 'b', 'c']);

  const _z = zip([r1, r2] as const);

  const _zi = zip([
    r1.chain(setInitialValue(0)),
    r2.chain(setInitialValue('0')),
  ] as const);

  expectType<typeof _z, SyncChildObservable<readonly [number, string], 'zip'>>(
    '<=',
  );

  expectType<
    typeof _zi,
    InitializedSyncChildObservable<readonly [number, string], 'zip'>
  >('<=');
}
