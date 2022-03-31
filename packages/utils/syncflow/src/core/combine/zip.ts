import { assertType, createQueue, Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import { fromArray } from '../create';
import { withInitialValue } from '../operators';
import type {
  InitializedSyncChildObservable,
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
  parents: Wrap<A>
): ZipObservable<A> => new ZipObservableClass(parents);

export const zipI = <A extends NonEmptyUnknownList>(
  parents: WrapInitialized<A>
): InitializedZipObservable<A> =>
  new ZipObservableClass(parents as Wrap<A>) as InitializedZipObservable<A>;

class ZipObservableClass<A extends NonEmptyUnknownList>
  extends SyncChildObservableClass<A, 'zip', A>
  implements ZipObservable<A>
{
  private readonly _queues: TupleToQueueTuple<A>;

  constructor(parents: Wrap<A>) {
    const parentsValues = parents.map((p) => p.currentValue);
    super({
      parents,
      type: 'zip',
      currentValueInit: parentsValues.every(Maybe.isSome)
        ? Maybe.some(parentsValues.map((c) => c.value) as unknown as A)
        : Maybe.none,
    });

    this._queues = parents.map(createQueue) as unknown as TupleToQueueTuple<A>;
  }

  override tryUpdate(token: Token): void {
    const queues = this._queues;
    for (const [index, par] of this.parents.entries()) {
      if (par.token === token && Maybe.isSome(par.currentValue)) {
        queues[index]?.enqueue(par.currentValue.value);
      }
    }

    if (queues.every((list) => !list.isEmpty)) {
      const nextValue = queues.map((q) => q.dequeue()) as unknown as A;
      this.setNext(nextValue, token);
    }
  }
}

// type tests

const r1 = fromArray([1, 2, 3]);
const r2 = fromArray(['a', 'b', 'c']);

const z = zip([r1, r2] as const);

const zi = zipI([
  r1.chain(withInitialValue(0)),
  r2.chain(withInitialValue('0')),
] as const);

assertType<
  TypeExtends<typeof z, SyncChildObservable<readonly [number, string], 'zip'>>
>();

assertType<
  TypeExtends<
    typeof zi,
    InitializedSyncChildObservable<readonly [number, string], 'zip'>
  >
>();
