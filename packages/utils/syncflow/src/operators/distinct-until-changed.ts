import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  DistinctUntilChangedOperatorObservable,
  InitializedToInitializedOperator,
  Observable,
  ToBaseOperator,
  Token,
} from '../types';

export const distinctUntilChanged = <A>(
  compare: (x: A, y: A) => boolean = (x, y) => x === y
): ToBaseOperator<A, A> => (parent: Observable<A>) =>
  new DistinctUntilChangedObservableClass(parent, compare);

export const distinctUntilChangedI = <A>(
  compare: (x: A, y: A) => boolean = (x, y) => x === y
): InitializedToInitializedOperator<A, A> =>
  distinctUntilChanged(compare) as InitializedToInitializedOperator<A, A>;

export const skipUnchanged = distinctUntilChanged; // alias
export const skipUnchangedI = distinctUntilChangedI; // alias

class DistinctUntilChangedObservableClass<A>
  extends SyncChildObservableClass<A, 'distinctUntilChanged', [A]>
  implements DistinctUntilChangedOperatorObservable<A> {
  private readonly _compare: (x: A, y: A) => boolean;
  private _previousValue: Option<A>;

  constructor(parent: Observable<A>, compare: (x: A, y: A) => boolean) {
    super({
      parents: [parent],
      type: 'distinctUntilChanged',
      currentValueInit: parent.currentValue,
    });
    this._previousValue = Option.none;
    this._compare = compare;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    const prev = this._previousValue;
    this._previousValue = parent.currentValue;

    if (
      Option.isNone(prev) ||
      !this._compare(prev.value, parent.currentValue.value)
    ) {
      this.setNext(parent.currentValue.value, token);
    }
  }
}
