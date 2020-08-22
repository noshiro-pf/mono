import { ManagerRNClass, RN } from '../abstract_class';
import { none } from '../util';

export const fromPromise = <A>(promise: Promise<A>): RN<A> =>
  new FromPromiseRNClass<A>(promise);

class FromPromiseRNClass<A> extends ManagerRNClass<A> implements RN<A> {
  private promise: Promise<A>;

  constructor(promise: Promise<A>) {
    super('source', 0, [], none, false);
    this.promise = promise;

    this.promise
      .then((value) => {
        this.update(value);
        this.isUpdated = true;
      })
      .catch((err) => console.error(err));
  }
}
