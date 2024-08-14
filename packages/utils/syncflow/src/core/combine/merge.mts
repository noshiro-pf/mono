import { Maybe, expectType } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import { fromArray } from '../create/index.mjs';
import {
  type MergeObservable,
  type MergeObservableRefined,
  type NonEmptyUnknownList,
  type Observable,
  type SyncChildObservable,
  type UpdaterSymbol,
  type Wrap,
} from '../types/index.mjs';

/**
 * @deprecated To improve the readability of your code, use `createState`
 *   instead of `merge`, and subscribe to `parents` and call `setState` within
 *   it.
 */
export const merge = <OS extends NonEmptyArray<Observable<unknown>>>(
  parents: OS,
): MergeObservableRefined<OS> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  new MergeObservableClass(parents) as never;

class MergeObservableClass<P extends NonEmptyUnknownList>
  extends SyncChildObservableClass<ArrayElement<P>, 'merge', P>
  implements MergeObservable<P>
{
  constructor(parents: Wrap<P>) {
    super({
      parents,
      type: 'merge',
      initialValue: Maybe.none,
    });
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const parentToUse = this.parents.find(
      (o) => o.updaterSymbol === updaterSymbol && Maybe.isSome(o.snapshot),
    );
    if (parentToUse === undefined) return;

    const nextValue =
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      Maybe.unwrap(parentToUse.snapshot) as ArrayElement<P>;

    this.setNext(nextValue, updaterSymbol);
  }
}

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

  const r1 = fromArray([1, 2, 3]);
  const r2 = fromArray(['a', 'b', 'c']);

  // eslint-disable-next-line deprecation/deprecation
  const _m = merge([r1, r2] as const);

  expectType<typeof _m, SyncChildObservable<number | string, 'merge'>>('<=');
}
