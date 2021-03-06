import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  InitializedObservable,
  InitializedToInitializedOperator,
  Observable,
  ToBaseOperator,
  Token,
  WithLatestFromOperatorObservable,
} from '../types';
import { maxDepth } from '../utils';

export const withLatestFrom =
  <A, B>(observable: Observable<B>): ToBaseOperator<A, [A, B]> =>
  (parentObservable: Observable<A>) =>
    new WithLatestFromObservableClass(parentObservable, observable);

export const withLatestFromI = <A, B>(
  observable: InitializedObservable<B>
): InitializedToInitializedOperator<A, [A, B]> =>
  withLatestFrom(observable) as InitializedToInitializedOperator<A, [A, B]>;

export const withLatest = withLatestFrom; // alias
export const withLatestI = withLatestFromI; // alias

class WithLatestFromObservableClass<A, B>
  extends SyncChildObservableClass<[A, B], 'withLatestFrom', [A]>
  implements WithLatestFromOperatorObservable<A, B>
{
  private readonly _observable: Observable<B>;

  constructor(parentObservable: Observable<A>, observable: Observable<B>) {
    super({
      parents: [parentObservable],
      depth: 1 + maxDepth([parentObservable, observable]),
      type: 'withLatestFrom',
      currentValueInit:
        Option.isNone(parentObservable.currentValue) ||
        Option.isNone(observable.currentValue)
          ? Option.none
          : Option.some([
              parentObservable.currentValue.value,
              observable.currentValue.value,
            ]),
    });

    this._observable = observable;
  }

  tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    const curr = this._observable.currentValue;
    if (Option.isNone(curr)) return; // skip update

    this.setNext([par.currentValue.value, curr.value], token);
  }
}
