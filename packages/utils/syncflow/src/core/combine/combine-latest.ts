import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  CombineLatestObservable,
  InitializedCombineLatestObservable,
  NonEmptyUnknownList,
  Token,
  Wrap,
  WrapInitialized,
} from '../types';

export const combineLatest = <A extends NonEmptyUnknownList>(
  parents: Wrap<A>
): CombineLatestObservable<A> => new CombineLatestObservableClass(parents);

export const combineLatestI = <A extends NonEmptyUnknownList>(
  parents: WrapInitialized<A>
): InitializedCombineLatestObservable<A> =>
  new CombineLatestObservableClass(
    parents as Wrap<A>
  ) as InitializedCombineLatestObservable<A>;

export const combine = combineLatest; // alias

class CombineLatestObservableClass<A extends NonEmptyUnknownList>
  extends SyncChildObservableClass<A, 'combineLatest', A>
  implements CombineLatestObservable<A>
{
  constructor(parents: Wrap<A>) {
    const parentsValues = parents.map((p) => p.currentValue);
    super({
      parents,
      type: 'combineLatest',
      currentValueInit: parentsValues.every(Maybe.isSome)
        ? Maybe.some(parentsValues.map((c) => c.value) as unknown as A)
        : Maybe.none,
    });
  }

  override tryUpdate(token: Token): void {
    if (this.parents.every((o) => o.token !== token)) return; // all parents are skipped

    const parentValues = this.parents.map((a) => a.currentValue);
    if (parentValues.every(Maybe.isSome)) {
      const nextValue = parentValues.map((a) => a.value) as unknown as A;
      this.setNext(nextValue, token);
    }
  }
}
