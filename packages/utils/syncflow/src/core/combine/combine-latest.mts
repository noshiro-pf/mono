import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type CombineLatestObservable,
  type InitializedCombineLatestObservable,
  type NonEmptyUnknownList,
  type UpdaterSymbol,
  type Wrap,
  type WrapInitialized,
} from '../types/index.mjs';

export const combineLatest = <A extends NonEmptyUnknownList>(
  parents: Wrap<A>,
): CombineLatestObservable<A> => new CombineLatestObservableClass(parents);

export const combineLatestI = <A extends NonEmptyUnknownList>(
  parents: WrapInitialized<A>,
): InitializedCombineLatestObservable<A> =>
  // eslint-disable-next-line no-restricted-syntax
  new CombineLatestObservableClass(
    // eslint-disable-next-line no-restricted-syntax
    parents as Wrap<A>,
  ) as InitializedCombineLatestObservable<A>;

export const combine = combineLatest; // alias

class CombineLatestObservableClass<A extends NonEmptyUnknownList>
  extends SyncChildObservableClass<A, 'combineLatest', A>
  implements CombineLatestObservable<A>
{
  constructor(parents: Wrap<A>) {
    const parentsValues = parents.map((p) => p.snapshot);
    super({
      parents,
      type: 'combineLatest',
      initialValue: parentsValues.every(Maybe.isSome)
        ? // eslint-disable-next-line no-restricted-syntax
          Maybe.some(parentsValues.map((c) => c.value) as unknown as A)
        : Maybe.none,
    });
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    if (this.parents.every((o) => o.updaterSymbol !== updaterSymbol)) return; // all parents are skipped

    const parentValues = this.parents.map((a) => a.snapshot);
    if (parentValues.every(Maybe.isSome)) {
      // eslint-disable-next-line no-restricted-syntax
      const nextValue = parentValues.map((a) => a.value) as unknown as A;
      this.setNext(nextValue, updaterSymbol);
    }
  }
}
