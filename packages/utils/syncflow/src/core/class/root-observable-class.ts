import { IList, MutableSet } from '@noshiro/ts-utils';
import type {
  ChildObservable,
  ObservableId,
  RootObservable,
  RootObservableType,
} from '../types';
import { binarySearch, issueToken } from '../utils';
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

    this.#procedure = IList.insert(this.#procedure, insertPos, child);
  }

  startUpdate(nextValue: A): void {
    const token = issueToken();
    this.setNext(nextValue, token);

    for (const p of this.#procedure) {
      p.tryUpdate(token);
    }
  }
}
