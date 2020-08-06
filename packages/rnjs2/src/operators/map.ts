import { OperatorRNClass, RN } from '../abstract_class';
import { Operator } from '../types';
import { monoParentTryUpdate, none } from '../util';

export const map = <A, B>(mapFn: (x: A) => B): Operator<A, B> => (
  parent: RN<A>
) => new MapRNClass(parent, mapFn);

class MapRNClass<A, B> extends OperatorRNClass<A, B> implements RN<B> {
  private mapFn: (x: A) => B;

  constructor(parent: RN<A>, mapFn: (x: A) => B) {
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
