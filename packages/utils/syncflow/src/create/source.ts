import { Option } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class';
import { SourceObservable } from '../types';

export const source = <A>(): SourceObservable<A> =>
  new SourceObservableClass<A>();

class SourceObservableClass<A>
  extends RootObservableClass<A, 'Source'>
  implements SourceObservable<A> {
  constructor() {
    super({ type: 'Source', currentValueInit: Option.none });
  }

  next(nextValue: A): void {
    if (this.isCompleted) return;
    this.startUpdate(nextValue);
  }
}
