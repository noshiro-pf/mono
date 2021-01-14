import { Observable, OperatorObservableClass } from '../abstract_class';
import { Operator } from '../types';
import { monoParentTryUpdate, none } from '../util';

export const filter = <A>(filterFn: (x: A) => boolean): Operator<A, A> => (
  parent: Observable<A>
) => new FilterObservableClass(parent, filterFn);

class FilterObservableClass<A>
  extends OperatorObservableClass<A, A>
  implements Observable<A> {
  private filterFn: (x: A) => boolean;

  constructor(parent: Observable<A>, filterFn: (x: A) => boolean) {
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
