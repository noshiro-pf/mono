import type { ArrayElement, TypeExtends } from '@noshiro/ts-utils';
import { assertType, Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import { fromArray } from '../create';
import type {
  MergeObservable,
  NonEmptyUnknownList,
  SyncChildObservable,
  Token,
  Wrap,
} from '../types';

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
      currentValueInit: Option.none,
    });
  }

  override tryUpdate(token: Token): void {
    const parentToUse = this.parents.find(
      (o) => o.token === token && Option.isSome(o.currentValue)
    );
    if (parentToUse === undefined) return;
    const nextValue = Option.unwrap(
      parentToUse.currentValue
    ) as ArrayElement<P>;
    this.setNext(nextValue, token);
  }
}

// type tests

const r1 = fromArray([1, 2, 3]);
const r2 = fromArray(['a', 'b', 'c']);

const m = merge([r1, r2] as const);

assertType<
  TypeExtends<typeof m, SyncChildObservable<number | string, 'merge'>>
>();
