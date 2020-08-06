import { ManagerRNClass, RN } from '../abstract_class';
import { Subscribable } from '../types';
import { none } from '../util';

export const fromSubscribable = <A>(subscribable: Subscribable<A>): RN<A> =>
  new FromObservableRNClass<A>(subscribable);

export const fromObservable = fromSubscribable;

class FromObservableRNClass<A> extends ManagerRNClass<A> implements RN<A> {
  private subscribable: Subscribable<A>;

  constructor(subscribable: Subscribable<A>) {
    super('source', 0, [], none, false);
    this.subscribable = subscribable;

    this.subscribable.subscribe(
      (value) => {
        this.update(value);
        this.isUpdated = true;
      },
      (error) => {
        this.complete();
        throw new Error(error);
      },
      () => {
        this.complete();
      }
    );
  }
}
