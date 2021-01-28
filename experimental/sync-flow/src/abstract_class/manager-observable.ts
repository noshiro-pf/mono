import { ObservableType } from '../types';
import { binarySearch, Option } from '../util';
import { ObservableClass } from './observable';
import { Observable } from './observable-interface';

export abstract class ManagerObservableClass<A>
  extends ObservableClass<A>
  implements Observable<A> {
  private procedure: Observable<any>[] = [];

  constructor(
    type: ObservableType,
    depth: number,
    parents: Observable<any>[],
    currentValueInit: Option<A>,
    isUpdatedInit: boolean
  ) {
    super(type, true, depth, parents, currentValueInit, isUpdatedInit);
  }

  /** @internal */
  addDescendant(child: Observable<any>): void {
    if (this._descendantsIdSet.has(child.id)) return;
    super.addDescendant(child);
    const insertPos = binarySearch(
      this.procedure.map((a) => a.depth),
      child.depth
    );
    this.procedure.splice(insertPos, 0, child);
  }

  protected update(nextValue: A): void {
    this.isUpdated = true;

    super.update(nextValue);
    // let numObservablesToUpdate = this.numDescendants;
    this.isUpdated = true;

    for (const p of this.procedure) {
      p.isUpdated = false; // reset
    }
    for (const p of this.procedure) {
      p.tryUpdate();
      // numObservablesToUpdate += -1 + (p.isUpdated ? p.numDescendants : 0);
      // if (numObservablesToUpdate === 0) break; // for early stopping
      /*
       * [note]: This early stopping logic is not accurate
       * since `numChildToUpdate` is added up considering the dependency graph as a tree.
       */
    }
  }

  /** @internal */
  fire(nextValue: A): void {
    this.tryUpdateAndSetFlag(() => {
      this.update(nextValue);
      return true;
    });
  }
}
