import { Observable, ObservableClass } from '../abstract_class';
import { ArrayElement, Subscription, Unwrap } from '../types';
import { isNone, none } from '../util';

export const zip = <A extends Observable<any>[]>(
  ...rns: A
): Observable<Unwrap<A>> => new ZipObservableClass(rns);

class ZipObservableClass<A extends Observable<any>[]>
  extends ObservableClass<Unwrap<A>>
  implements Observable<Unwrap<A>> {
  private _nextValueQueues: ArrayElement<Unwrap<A>>[][];
  private _subscriptions: Subscription[];

  constructor(parents: A) {
    super(
      'sync child',
      false,
      1 + parents.reduce((mx, a) => Math.max(mx, a.depth), 0),
      parents,
      none,
      false
    );
    this._nextValueQueues = parents.map(() => []);
    this._subscriptions = parents.map((p, i) =>
      p.subscribe((v) => {
        this._nextValueQueues[i].push(v);
      })
    );
  }

  tryUpdate(): void {
    this.tryUpdateAndSetFlag(() => {
      if (this.parents.some((a) => isNone(a.currentValue))) return false;
      if (this.parents.every((a) => !a.isUpdated)) return false;
      if (this._nextValueQueues.some((q) => q.length === 0)) return false;
      const currValues = this._nextValueQueues.map((q) => q.shift());
      this.update(currValues as Unwrap<A>);
      return true;
    });
  }

  protected complete(): void {
    this._subscriptions.forEach((s) => {
      s.unsubscribe();
    });
    super.complete();
  }
}
