import { createQueue, Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type InitializedZipObservable,
  type NonEmptyUnknownList,
  type TupleToQueueTuple,
  type UpdaterSymbol,
  type Wrap,
  type WrapInitialized,
  type ZipObservable,
} from '../types/index.mjs';

export const zip = <A extends NonEmptyUnknownList>(
  parents: Wrap<A>,
): ZipObservable<A> => new ZipObservableClass(parents);

export const zipI = <A extends NonEmptyUnknownList>(
  parents: WrapInitialized<A>,
): InitializedZipObservable<A> =>
  // eslint-disable-next-line no-restricted-syntax
  new ZipObservableClass(parents as Wrap<A>) as InitializedZipObservable<A>;

class ZipObservableClass<A extends NonEmptyUnknownList>
  extends SyncChildObservableClass<A, 'zip', A>
  implements ZipObservable<A>
{
  readonly #queues: TupleToQueueTuple<A>;

  constructor(parents: Wrap<A>) {
    const parentsValues = parents.map((p) => p.snapshot);
    super({
      parents,
      type: 'zip',
      initialValue: parentsValues.every(Maybe.isSome)
        ? // eslint-disable-next-line no-restricted-syntax
          Maybe.some(parentsValues.map((c) => c.value) as unknown as A)
        : Maybe.none,
    });

    // eslint-disable-next-line no-restricted-syntax
    this.#queues = parents.map(createQueue) as unknown as TupleToQueueTuple<A>;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const queues = this.#queues;
    for (const [index, par] of this.parents.entries()) {
      if (par.updaterSymbol === updaterSymbol && Maybe.isSome(par.snapshot)) {
        queues[index]?.enqueue(par.snapshot.value);
      }
    }

    if (queues.every((list) => !list.isEmpty)) {
      // eslint-disable-next-line no-restricted-syntax
      const nextValue = queues.map((q) => q.dequeue()) as unknown as A;
      this.setNext(nextValue, updaterSymbol);
    }
  }
}
