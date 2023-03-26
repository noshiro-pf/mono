import { Arr, MutableSet } from '@noshiro/ts-utils';
import {
  type ChildObservable,
  type ObservableId,
  type RootObservable,
  type RootObservableType,
} from '../types';
import { binarySearch, issueUpdaterSymbol } from '../utils';
import { ObservableBaseClass } from './observable-base-class';

export class RootObservableClass<A, Type extends RootObservableType>
  extends ObservableBaseClass<A, 'root', 0>
  implements RootObservable<A, Type>
{
  override readonly type: Type;
  #procedure: readonly ChildObservable<unknown>[];
  protected readonly _descendantsIdSet: MutableSet<ObservableId>;

  constructor({
    type,
    currentValueInit,
  }: Readonly<{
    type: Type;
    currentValueInit: RootObservable<A, Type>['currentValue'];
  }>) {
    super({
      kind: 'root',
      type,
      depth: 0,
      currentValueInit,
    });
    this.type = type;
    this.#procedure = [];
    this._descendantsIdSet = new MutableSet<ObservableId>();
  }

  addDescendant<B>(child: ChildObservable<B>): void {
    if (this._descendantsIdSet.has(child.id)) return;
    this._descendantsIdSet.add(child.id);

    const insertPos = binarySearch(
      this.#procedure.map((a) => a.depth),
      child.depth
    );

    this.#procedure = Arr.insert(this.#procedure, insertPos, child);
  }

  startUpdate(nextValue: A): void {
    const updaterSymbol = issueUpdaterSymbol();
    this.setNext(nextValue, updaterSymbol);

    for (const p of this.#procedure) {
      p.tryUpdate(updaterSymbol);
    }
  }
}
