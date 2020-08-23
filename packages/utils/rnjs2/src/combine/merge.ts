import { RN, RNClass } from '../abstract_class';
import { ArrayElement, Subscription, Unwrap } from '../types';
import { isNone, none, Option, some } from '../util';

export const merge = <T extends RN<any>[]>(
  ...srcs: T
): RN<ArrayElement<Unwrap<T>>> => new MergeRNClass(srcs);

class MergeRNClass<A extends RN<any>[]> extends RNClass<ArrayElement<Unwrap<A>>>
  implements RN<ArrayElement<Unwrap<A>>> {
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
