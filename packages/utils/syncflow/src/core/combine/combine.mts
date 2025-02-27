import { Maybe, expectType } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import { fromArray, source } from '../create/index.mjs';
import { setInitialValue } from '../operators/index.mjs';
import {
  type CombineObservable,
  type CombineObservableRefined,
  type InitializedObservable,
  type InitializedSyncChildObservable,
  type NonEmptyUnknownList,
  type Observable,
  type SyncChildObservable,
  type UpdaterSymbol,
  type Wrap,
} from '../types/index.mjs';

export const combine = <const OS extends NonEmptyArray<Observable<unknown>>>(
  parents: OS,
): CombineObservableRefined<OS> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  new CombineObservableClass(
    parents,
  ) as unknown as CombineObservableRefined<OS>;

export const combineLatest = combine; // alias

class CombineObservableClass<const A extends NonEmptyUnknownList>
  extends SyncChildObservableClass<A, A>
  implements CombineObservable<A>
{
  constructor(parents: Wrap<A>) {
    const parentsValues = parents.map((p) => p.getSnapshot());
    super({
      parents,
      initialValue: parentsValues.every(Maybe.isSome)
        ? Maybe.some(
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            parentsValues.map((c) => c.value) as unknown as A,
          )
        : Maybe.none,
    });
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    if (this.parents.every((o) => o.updaterSymbol !== updaterSymbol)) return; // all parents are skipped

    const parentValues = this.parents.map((a) => a.getSnapshot());
    if (parentValues.every(Maybe.isSome)) {
      const nextValue =
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        parentValues.map((a) => a.value) as unknown as A;
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
    const _d = combine([s1, s2]);

    expectType<typeof _d, CombineObservable<readonly [1, 2]>>('=');
    expectType<typeof _d, Observable<readonly [1, 2]>>('<=');
  }

  {
    const s1: InitializedObservable<1> = source<1>().chain(setInitialValue(1));
    const s2: Observable<2> = source<2>();
    const _d = combine([s1, s2]);

    expectType<typeof _d, CombineObservable<readonly [1, 2]>>('=');
    expectType<typeof _d, Observable<readonly [1, 2]>>('<=');
  }

  {
    const s1: InitializedObservable<1> = source<1>().chain(setInitialValue(1));
    const s2: InitializedObservable<2> = source<2>().chain(setInitialValue(2));
    const _d = combine([s1, s2]);

    // OS がすべて InitializedObservable であれば InitializedObservable を返す
    expectType<typeof _d, InitializedObservable<readonly [1, 2]>>('<=');
  }

  const r1 = fromArray([1, 2, 3]);
  const r2 = fromArray(['a', 'b', 'c']);

  const _c = combine([r1, r2]);

  const _ci = combine([
    r1.chain(setInitialValue(0)),
    r2.chain(setInitialValue(0)),
  ]);

  expectType<typeof _c, SyncChildObservable<readonly [number, string]>>('<=');

  expectType<
    typeof _ci,
    InitializedSyncChildObservable<readonly [number, number | string]>
  >('<=');
}
