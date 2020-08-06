import { RNType } from '../types';
import { binarySearch, Option } from '../util';
import { RNClass } from './rn';
import { RN } from './rn-interface';

export abstract class ManagerRNClass<A> extends RNClass<A> implements RN<A> {
  private procedure: RN<any>[] = [];

  constructor(
    type: RNType,
    depth: number,
    parents: RN<any>[],
    currentValueInit: Option<A>,
    isUpdatedInit: boolean
  ) {
    super(type, true, depth, parents, currentValueInit, isUpdatedInit);
  }

  /** @internal */
  addDescendant(child: RN<any>): void {
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
    // let numRNsToUpdate = this.numDescendants;
    this.isUpdated = true;

    for (const p of this.procedure) {
      p.isUpdated = false; // reset
    }
    for (const p of this.procedure) {
      p.tryUpdate();
      // numRNsToUpdate += -1 + (p.isUpdated ? p.numDescendants : 0);
      // if (numRNsToUpdate === 0) break; // for early stopping
      /*
       * [note]: This early stopping logic is not accurate
       * since `numChildToUpdate` is added up considering the dependency graph as a tree.
       */
    }
  }

  /** @internal */
  tryUpdate(nextValue: A): void {
    this.tryUpdateAndSetFlag(() => {
      this.update(nextValue);
      return true;
    });
  }
}
