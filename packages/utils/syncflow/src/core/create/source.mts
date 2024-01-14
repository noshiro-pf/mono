import { Maybe } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class/index.mjs';
import { type SourceObservable } from '../types/index.mjs';

export const subject = <A,>(): SourceObservable<A> =>
  new SourceObservableClass<A>();

export const source = subject; // alias

class SourceObservableClass<A>
  extends RootObservableClass<A, 'Source'>
  implements SourceObservable<A>
{
  constructor() {
    super({ type: 'Source', initialValue: Maybe.none });
  }

  next(nextValue: A): void {
    if (this.isCompleted) return;
    this.startUpdate(nextValue);
  }
}
