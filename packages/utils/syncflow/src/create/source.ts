import { Option } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class';
import type { SourceObservable } from '../types';

export const subject = <A>(): SourceObservable<A> =>
  new SourceObservableClass<A>();

export const source = subject; // alias

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
