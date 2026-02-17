import { Arr, Optional } from 'ts-data-forge';
import {
  isRootObservable,
  type ChildObservable,
  type ObservableId,
  type RootObservable,
} from '../types/index.mjs';
import { binarySearch, issueUpdaterSymbol } from '../utils/index.mjs';
import { ObservableBaseClass } from './observable-base-class.mjs';

export class RootObservableClass<A>
  extends ObservableBaseClass<A, 'root', 0>
  implements RootObservable<A>
{
  #mut_procedure: readonly ChildObservable<unknown>[];
  protected readonly _descendantsIdSet: MutableSet<ObservableId>;

  constructor({
    initialValue,
  }: Readonly<{
    initialValue: ReturnType<RootObservable<A>['getSnapshot']>;
  }>) {
    super({
      kind: 'root',
      depth: 0,
      initialValue,
    });

    this.#mut_procedure = [];

    this._descendantsIdSet = new Set<ObservableId>();
  }

  addDescendant<B>(child: ChildObservable<B>): void {
    if (this._descendantsIdSet.has(child.id)) return;

    this._descendantsIdSet.add(child.id);

    const insertPos = binarySearch(
      this.#mut_procedure.map((a) => a.depth),
      child.depth,
    );

    this.#mut_procedure = Arr.toInserted(this.#mut_procedure, insertPos, child);
  }

  startUpdate(nextValue: A): void {
    const updaterSymbol = issueUpdaterSymbol();

    this.setNext(nextValue, updaterSymbol);

    for (const p of this.#mut_procedure) {
      p.tryUpdate(updaterSymbol);
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
