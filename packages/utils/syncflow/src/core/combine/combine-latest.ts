import { assertType, Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import { fromArray } from '../create';
import { withInitialValue } from '../operators';
import type {
  CombineLatestObservable,
  InitializedCombineLatestObservable,
  InitializedSyncChildObservable,
  NonEmptyUnknownList,
  SyncChildObservable,
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
      currentValueInit: parentsValues.every(Option.isSome)
        ? Option.some(parentsValues.map((c) => c.value) as unknown as A)
        : Option.none,
    });
  }

  override tryUpdate(token: Token): void {
    if (this.parents.every((o) => o.token !== token)) return; // all parents are skipped

    const parentValues = this.parents.map((a) => a.currentValue);
    if (parentValues.every(Option.isSome)) {
      const nextValue = parentValues.map((a) => a.value) as unknown as A;
      this.setNext(nextValue, token);
    }
  }
}

// type tests

const r1 = fromArray([1, 2, 3]);
const r2 = fromArray(['a', 'b', 'c']);

const cm = combineLatest([r1, r2] as const);

const cmi = combineLatestI([
  r1.chain(withInitialValue(0)),
  r2.chain(withInitialValue(0)),
] as const);

assertType<
  TypeExtends<
    typeof cm,
    SyncChildObservable<readonly [number, string], 'combineLatest'>
  >
>();

assertType<
  TypeExtends<
    typeof cmi,
    InitializedSyncChildObservable<
      readonly [number, number | string],
      'combineLatest'
    >
  >
>();
