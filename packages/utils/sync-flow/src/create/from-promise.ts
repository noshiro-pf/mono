import { ManagerObservableClass, Observable } from '../abstract_class';
import { none } from '../util';

export const fromPromise = <A>(promise: Promise<A>): Observable<A> =>
  new FromPromiseObservableClass<A>(promise);

class FromPromiseObservableClass<A>
  extends ManagerObservableClass<A>
  implements Observable<A> {
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
