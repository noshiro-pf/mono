import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  Observable,
  Operator,
  SkipUntilOperatorObservable,
  Token,
} from '../types';

export const skipUntil = <A>(notifier: Observable<unknown>): Operator<A, A> => (
  parent: Observable<A>
) => new SkipUntilObservableClass(parent, notifier);

class SkipUntilObservableClass<A>
  extends SyncChildObservableClass<A, 'skipUntil', [A]>
  implements SkipUntilOperatorObservable<A> {
  private _isSkipping: boolean;
  constructor(parent: Observable<A>, notifier: Observable<unknown>) {
    super({
      parents: [parent],
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

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update
    if (this._isSkipping) return;

    this.setNext(parent.currentValue.value, token);
  }
}
