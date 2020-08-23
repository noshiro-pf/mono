import { OperatorRNClass, RN } from '../abstract_class';
import { Operator } from '../types';
import { monoParentTryUpdate, none } from '../util';

export const filter = <A>(filterFn: (x: A) => boolean): Operator<A, A> => (
  parent: RN<A>
) => new FilterRNClass(parent, filterFn);

class FilterRNClass<A> extends OperatorRNClass<A, A> implements RN<A> {
  private filterFn: (x: A) => boolean;

  constructor(parent: RN<A>, filterFn: (x: A) => boolean) {
    super('sync child', parent, none, false);
    this.filterFn = filterFn;
  }

  tryUpdate(): void {
    this.tryUpdateAndSetFlag(() => {
      const b = monoParentTryUpdate(this.parent);
      if (b === 'skipped') return false;
      if (this.filterFn(b.value)) {
        this.update(b.value);
        return true;
      } else {
        return false;
      }
    });
  }
}
