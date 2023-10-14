import { Maybe } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class';
import { type FromArrayObservable } from '../types';

export const fromArray = <A>(
  values: readonly A[],
  startManually: boolean = false,
): FromArrayObservable<A> =>
  new FromArrayObservableClass<A>(values, startManually);

class FromArrayObservableClass<A>
  extends RootObservableClass<A, 'FromArray'>
  implements FromArrayObservable<A>
{
  readonly #values: readonly A[];

  constructor(values: readonly A[], startManually: boolean = false) {
    super({ type: 'FromArray', initialValue: Maybe.none });
    this.#values = values;
    if (!startManually) {
      setTimeout(() => {
        this.emit();
      }, 0);
    }
  }

  emit(): this {
    if (this.isCompleted) return this;
    for (const v of this.#values) {
      this.startUpdate(v);
    }
    this.complete();
    return this;
  }
}
