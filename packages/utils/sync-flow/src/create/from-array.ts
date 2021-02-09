import { Option } from '@mono/ts-utils';
import { RootObservableClass } from '../class';
import { FromArrayObservable } from '../types';

export const fromArray = <A>(values: readonly A[]): FromArrayObservable<A> =>
  new FromArrayObservableClass<A>(values);

class FromArrayObservableClass<A>
  extends RootObservableClass<A, 'FromArray'>
  implements FromArrayObservable<A> {
  private readonly _values: readonly A[];

  constructor(values: readonly A[]) {
    super({ type: 'FromArray', currentValueInit: Option.none });
    this._values = values;
  }

  emit(): this {
    if (this.isCompleted) return this;
    this._values.forEach((v) => {
      this.startUpdate(v);
    });
    this.complete();
    return this;
  }
}
