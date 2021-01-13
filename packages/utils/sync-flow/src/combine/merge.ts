import { Observable, ObservableClass } from '../abstract_class';
import { ArrayElement, Subscription, Unwrap } from '../types';
import { isNone, none, Option, some } from '../util';

export const merge = <T extends Observable<any>[]>(
  ...srcs: T
): Observable<ArrayElement<Unwrap<T>>> => new MergeObservableClass(srcs);

class MergeObservableClass<A extends Observable<any>[]>
  extends ObservableClass<ArrayElement<Unwrap<A>>>
  implements Observable<ArrayElement<Unwrap<A>>> {
  private _nextValueCandidate: Option<ArrayElement<Unwrap<A>>>;
  private _subscriptions: Subscription[];

  constructor(parents: A) {
    super(
      'merge',
      false,
      1 + parents.reduce((mx, a) => Math.max(mx, a.depth), 0),
      parents,
      none,
      false
    );
    this._nextValueCandidate = none;
    this._subscriptions = parents.map((p) =>
      p.subscribe((v) => {
        this._nextValueCandidate = some(v);
      })
    );
  }

  tryUpdate(): void {
    this.tryUpdateAndSetFlag(() => {
      if (isNone(this._nextValueCandidate)) return false;
      if (this.parents.every((a) => !a.isUpdated)) return false;
      super.update(this._nextValueCandidate.value);
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
