import { assertType, Option, TypeExtends } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import { fromArray } from '../create';
import {
  CombineLatestObservable,
  NonEmptyUnknownList,
  SyncChildObservable,
  Token,
  Wrap,
} from '../types';

export const combineLatest = <A extends NonEmptyUnknownList>(
  ...parents: Wrap<A>
): CombineLatestObservable<A> => new CombineLatestObservableClass(parents);

export const combine = combineLatest; // alias

class CombineLatestObservableClass<A extends NonEmptyUnknownList>
  extends SyncChildObservableClass<A, 'combineLatest', A>
  implements CombineLatestObservable<A> {
  constructor(parents: Wrap<A>) {
    const parentsValues = parents.map((p) => p.currentValue);
    super({
      parents,
      type: 'combineLatest',
      currentValueInit: parentsValues.every(Option.isSome)
        ? Option.some(parentsValues.map((c) => c.value) as A)
        : Option.none,
    });
  }

  // overload
  tryUpdate(token: Token): void {
    if (this.parents.every((o) => o.token !== token)) return; // all parents are skipped

    const parentValues = this.parents.map((a) => a.currentValue);
    if (parentValues.every(Option.isSome)) {
      const nextValue = parentValues.map((a) => a.value) as A;
      this.setNext(nextValue, token);
    }
  }
}

// type tests

const r1 = fromArray([1, 2, 3]);
const r2 = fromArray(['a', 'b', 'c']);
const c = combineLatest(r1, r2);
assertType<
  TypeExtends<typeof c, SyncChildObservable<[number, string], 'combineLatest'>>
>();
