import { ManagerRNClass, RN } from '../abstract_class';
import { none } from '../util';

export const source = <A>(): SourceRN<A> => new SourceRNClass<A>();

export const subject = source; // alias

export interface SourceRN<A> extends RN<A> {
  push(nextValue: A): void;
}

class SourceRNClass<A> extends ManagerRNClass<A> implements SourceRN<A> {
  constructor() {
    super('source', 0, [], none, false);
  }

  push(nextValue: A): void {
    this.update(nextValue);
  }
}
