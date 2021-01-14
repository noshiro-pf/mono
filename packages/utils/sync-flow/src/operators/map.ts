import { Observable, OperatorObservableClass } from '../abstract_class';
import { Operator } from '../types';
import { monoParentTryUpdate, none } from '../util';

export const map = <A, B>(mapFn: (x: A) => B): Operator<A, B> => (
  parent: Observable<A>
) => new MapObservableClass(parent, mapFn);

class MapObservableClass<A, B>
  extends OperatorObservableClass<A, B>
  implements Observable<B> {
  private mapFn: (x: A) => B;

  constructor(parent: Observable<A>, mapFn: (x: A) => B) {
    super('sync child', parent, none, false);
    this.mapFn = mapFn;
  }

  tryUpdate(): void {
    this.tryUpdateAndSetFlag(() => {
      const b = monoParentTryUpdate(this.parent);
      if (b === 'skipped') return false;
      this.update(this.mapFn(b.value));
      return true;
    });
  }
}
