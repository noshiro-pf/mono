import { Arr, Optional } from 'ts-data-forge';
import { type MutableSet } from 'ts-type-forge';
import {
  isRootObservable,
  type ChildObservable,
  type ObservableId,
  type RootObservable,
} from '../types/index.mjs';
import { binarySearch, issueUpdateToken } from '../utils/index.mjs';
import { ObservableBaseClass } from './observable-base-class.mjs';

export class RootObservableClass<A>
  extends ObservableBaseClass<A, 'root', 0>
  implements RootObservable<A>
{
  #mut_propagationOrder: readonly ChildObservable<unknown>[];
  protected readonly _descendantsIdSet: MutableSet<ObservableId>;

  constructor({
    initialValue,
  }: Readonly<{
    initialValue: Optional<A>;
  }>) {
    super({
      kind: 'root',
      depth: 0,
      initialValue,
    });

    this.#mut_propagationOrder = [];

    this._descendantsIdSet = new Set<ObservableId>();
  }

  addDescendant<B>(child: ChildObservable<B>): void {
    if (this._descendantsIdSet.has(child.id)) return;

    this._descendantsIdSet.add(child.id);

    const insertPos = binarySearch(
      this.#mut_propagationOrder.map((a) => a.depth),
      child.depth,
    );

    this.#mut_propagationOrder = Arr.toInserted(
      this.#mut_propagationOrder,
      insertPos,
      child,
    );
  }

  startUpdate(nextValue: A): void {
    const updateToken = issueUpdateToken();

    this.setNext(nextValue, updateToken);

    for (const p of this.#mut_propagationOrder) {
      p.tryUpdate(updateToken);
    }
  }
}

if (import.meta.vitest !== undefined) {
  test('isRootObservable', () => {
    assert.isTrue(
      isRootObservable(
        new RootObservableClass({
          initialValue: Optional.some(0),
        }),
      ),
    );
  });
}
