import { createQueue, Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  InitializedZipObservable,
  NonEmptyUnknownList,
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
  readonly #queues: TupleToQueueTuple<A>;

  constructor(parents: Wrap<A>) {
    const parentsValues = parents.map((p) => p.currentValue);
    super({
      parents,
      type: 'zip',
      currentValueInit: parentsValues.every(Maybe.isSome)
        ? Maybe.some(parentsValues.map((c) => c.value) as unknown as A)
        : Maybe.none,
    });

    this.#queues = parents.map(createQueue) as unknown as TupleToQueueTuple<A>;
  }

  override tryUpdate(token: Token): void {
    const queues = this.#queues;
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
