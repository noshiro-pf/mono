import { ManagerObservableClass, Observable } from '../abstract_class';
import { none } from '../util';

export const source = <A>(): SourceObservable<A> =>
  new SourceObservableClass<A>();

export const subject = source; // alias

export interface SourceObservable<A> extends Observable<A> {
  push(nextValue: A): void;
}

class SourceObservableClass<A>
  extends ManagerObservableClass<A>
  implements SourceObservable<A> {
  constructor() {
    super('source', 0, [], none, false);
  }

  push(nextValue: A): void {
    this.update(nextValue);
  }
}
