import { Maybe } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class/index.mjs';
import { type SourceObservable } from '../types/index.mjs';

export const source = <A,>(): SourceObservable<A> =>
  new SourceObservableClass<A>();

export const subject = source; // alias

class SourceObservableClass<A>
  extends RootObservableClass<A>
  implements SourceObservable<A>
{
  constructor() {
    super({ initialValue: Maybe.none });
  }

  next(nextValue: A): void {
    if (this.isCompleted) return;
    this.startUpdate(nextValue);
  }
}
