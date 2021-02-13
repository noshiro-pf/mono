import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  Observable,
  Operator,
  Token,
  WithLatestOperatorObservable,
} from '../types';
import { maxDepth } from '../utils';

export const withLatest = <A, B>(
  observable: Observable<B>
): Operator<A, [A, B]> => (parent: Observable<A>) =>
  new WithLatestObservableClass(parent, observable);

export const withLatestFrom = withLatest; // alias

class WithLatestObservableClass<A, B>
  extends SyncChildObservableClass<[A, B], 'withLatest', [A]>
  implements WithLatestOperatorObservable<A, B> {
  private readonly _observable: Observable<B>;

  constructor(parent: Observable<A>, observable: Observable<B>) {
    super({
      parents: [parent],
      depth: 1 + maxDepth([parent, observable]),
      type: 'withLatest',
      currentValueInit:
        Option.isNone(parent.currentValue) ||
        Option.isNone(observable.currentValue)
          ? Option.none
          : Option.some([
              parent.currentValue.value,
              observable.currentValue.value,
            ]),
    });

    this._observable = observable;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    const curr = this._observable.currentValue;
    if (Option.isNone(curr)) return; // skip update

    this.setNext([parent.currentValue.value, curr.value], token);
  }
}
