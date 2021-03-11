import {
  assertType,
  createQueue,
  Option,
  TypeExtends,
} from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import { fromArray } from '../create';
import {
  InitializedZipObservable,
  NonEmptyUnknownList,
  SyncChildObservable,
  Token,
  TupleToQueueTuple,
  Wrap,
  WrapInitialized,
  ZipObservable,
} from '../types';

export const zip = <A extends NonEmptyUnknownList>(
  ...parents: Wrap<A>
): ZipObservable<A> => new ZipObservableClass(parents);

export const zipI = <A extends NonEmptyUnknownList>(
  ...parents: WrapInitialized<A>
): InitializedZipObservable<A> =>
  new ZipObservableClass(parents as Wrap<A>) as InitializedZipObservable<A>;

class ZipObservableClass<A extends NonEmptyUnknownList>
  extends SyncChildObservableClass<A, 'zip', A>
  implements ZipObservable<A> {
  private readonly _queues: TupleToQueueTuple<A>;

  constructor(parents: Wrap<A>) {
    const parentsValues = parents.map((p) => p.currentValue);
    super({
      parents,
      type: 'zip',
      currentValueInit: parentsValues.every(Option.isSome)
        ? Option.some(parentsValues.map((c) => c.value) as A)
        : Option.none,
    });

    this._queues = (parents.map(
      createQueue
    ) as unknown) as TupleToQueueTuple<A>;
  }

  // overload
  tryUpdate(token: Token): void {
    const queues = this._queues;
    this.parents.forEach((parent, index) => {
      if (parent.token === token) {
        if (Option.isSome(parent.currentValue)) {
          queues[index]?.enqueue(parent.currentValue.value);
        }
      }
    });

    if (queues.every((list) => !list.isEmpty)) {
      const nextValue = queues.map((q) => q.dequeue()) as A;
      this.setNext(nextValue, token);
    }
  }
}

// type tests

const r1 = fromArray([1, 2, 3]);
const r2 = fromArray(['a', 'b', 'c']);
const c = zip(r1, r2);
assertType<
  TypeExtends<typeof c, SyncChildObservable<[number, string], 'zip'>>
>();
