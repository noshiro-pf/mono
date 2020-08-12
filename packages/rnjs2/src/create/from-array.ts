import { ManagerRNClass, RN } from '../abstract_class';
import { none } from '../util';

export const fromArray = <A>(values: A[]): FromArrayRN<A> =>
  new FromArrayRNClass<A>(values);

export interface FromArrayRN<A> extends RN<A> {
  emit(): void;
}

class FromArrayRNClass<A> extends ManagerRNClass<A> implements FromArrayRN<A> {
  private _values: A[];

  constructor(values: A[]) {
    super('source', 0, [], none, false);
    this._values = values;
  }

  emit(): void {
    if (this.isCompleted) return;
    this._values.forEach((v) => {
      this.update(v);
      this.isUpdated = true;
    });
    this.complete();
  }
}
