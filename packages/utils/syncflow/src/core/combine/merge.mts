import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type MergeObservable,
  type NonEmptyUnknownList,
  type UpdaterSymbol,
  type Wrap,
} from '../types/index.mjs';

/**
 * @deprecated To improve the readability of your code, use `createState`
 *   instead of `merge`, and subscribe to `parents` and call `setState` within
 *   it.
 */
export const merge = <P extends NonEmptyUnknownList>(
  parents: Wrap<P>,
): MergeObservable<P> => new MergeObservableClass(parents);

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
