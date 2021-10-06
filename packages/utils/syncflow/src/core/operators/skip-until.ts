import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  Observable,
  RemoveInitializedOperator,
  SkipUntilOperatorObservable,
  Token,
} from '../types';

export const skipUntil =
  <A>(notifier: Observable<unknown>): RemoveInitializedOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new SkipUntilObservableClass(parentObservable, notifier);

class SkipUntilObservableClass<A>
  extends SyncChildObservableClass<A, 'skipUntil', [A]>
  implements SkipUntilOperatorObservable<A>
{
  private _isSkipping: boolean;
  constructor(parentObservable: Observable<A>, notifier: Observable<unknown>) {
    super({
      parents: [parentObservable],
      type: 'skipUntil',
      currentValueInit: Option.none,
    });

    this._isSkipping = true;

    notifier.subscribe(
      () => {
        this._isSkipping = false;
      },
      () => {
        this._isSkipping = false;
      }
    );
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update
    if (this._isSkipping) return;

    this.setNext(par.currentValue.value, token);
  }
}
