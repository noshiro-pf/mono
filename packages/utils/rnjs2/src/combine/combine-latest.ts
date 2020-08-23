import { RN, RNClass } from '../abstract_class';
import { Unwrap } from '../types';
import { isNone, none, Some } from '../util';

export const combineLatest = <A extends RN<any>[]>(...rns: A): RN<Unwrap<A>> =>
  new CombineLatestRNClass(rns);

class CombineLatestRNClass<A extends RN<any>[]> extends RNClass<Unwrap<A>>
  implements RN<Unwrap<A>> {
  constructor(parents: A) {
    super(
      'sync child',
      false,
      1 + parents.reduce((mx, a) => Math.max(mx, a.depth), 0),
      parents,
      none,
      false
    );
  }

  tryUpdate(): void {
    this.tryUpdateAndSetFlag(() => {
      if (this.parents.some((a) => isNone(a.currentValue))) return false;
      if (this.parents.every((a) => !a.isUpdated)) return false;
      const currValues = this.parents.map(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (a) => (a.currentValue as Some<any>).value
      );
      this.update(currValues as Unwrap<A>);
      return true;
    });
  }
}
