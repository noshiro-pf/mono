import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  MergeObservable,
  NonEmptyUnknownList,
  Token,
  Wrap,
} from '../types';

/** @deprecated use `createState` instead */
export const merge = <P extends NonEmptyUnknownList>(
  parents: Wrap<P>
): MergeObservable<P> => new MergeObservableClass(parents);

class MergeObservableClass<P extends NonEmptyUnknownList>
  extends SyncChildObservableClass<ArrayElement<P>, 'merge', P>
  implements MergeObservable<P>
{
  constructor(parents: Wrap<P>) {
    super({
      parents,
      type: 'merge',
      currentValueInit: Maybe.none,
    });
  }

  override tryUpdate(token: Token): void {
    const parentToUse = this.parents.find(
      (o) => o.token === token && Maybe.isSome(o.currentValue)
    );
    if (parentToUse === undefined) return;
    const nextValue = Maybe.unwrap(parentToUse.currentValue) as ArrayElement<P>;
    this.setNext(nextValue, token);
  }
}
