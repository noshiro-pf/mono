import { IList } from '@noshiro/ts-utils';
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
  private _procedure: readonly ChildObservable<unknown>[];
  protected readonly _descendantsIdSet: Set<ObservableId>;

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
    this._procedure = [];
    this._descendantsIdSet = new Set<ObservableId>();
  }

  addDescendant<B>(child: ChildObservable<B>): void {
    if (this._descendantsIdSet.has(child.id)) return;
    this._descendantsIdSet.add(child.id);

    const insertPos = binarySearch(
      this._procedure.map((a) => a.depth),
      child.depth
    );

    this._procedure = IList.insert(this._procedure, insertPos, child);
  }

  startUpdate(nextValue: A): void {
    const token = issueToken();
    this.setNext(nextValue, token);

    this._procedure.forEach((p) => {
      p.tryUpdate(token);
    });
  }
}
