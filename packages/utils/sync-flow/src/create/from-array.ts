import { ManagerObservableClass, Observable } from '../abstract_class';
import { none } from '../util';

export const fromArray = <A>(values: A[]): FromArrayObservable<A> =>
  new FromArrayObservableClass<A>(values);

export interface FromArrayObservable<A> extends Observable<A> {
  emit(): void;
}

class FromArrayObservableClass<A>
  extends ManagerObservableClass<A>
  implements FromArrayObservable<A> {
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
