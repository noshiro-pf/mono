import { Arr, Maybe } from '@noshiro/ts-utils';
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
  #procedure: readonly ChildObservable<unknown>[];
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
    this.#procedure = [];
    // eslint-disable-next-line no-restricted-globals
    this._descendantsIdSet = new Set<ObservableId>();
  }

  addDescendant<B>(child: ChildObservable<B>): void {
    if (this._descendantsIdSet.has(child.id)) return;
    this._descendantsIdSet.add(child.id);

    const insertPos = binarySearch(
      this.#procedure.map((a) => a.depth),
      child.depth,
    );

    this.#procedure = Arr.inserted(this.#procedure, insertPos, child);
  }

  startUpdate(nextValue: A): void {
    const updaterSymbol = issueUpdaterSymbol();
    this.setNext(nextValue, updaterSymbol);

    for (const p of this.#procedure) {
      p.tryUpdate(updaterSymbol);
    }
  }
}

if (import.meta.vitest !== undefined) {
  test('isRootObservable', () => {
    expect(
      isRootObservable(
        new RootObservableClass({
          initialValue: Maybe.some(0),
        }),
      ),
    ).toBe(true);
  });
}
