import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type InitializedToInitializedOperator,
  type Observable,
  type TakeUntilOperatorObservable,
  type ToUninitializedOperator,
  type UpdaterSymbol,
} from '../types/index.mjs';

export const takeUntil =
  <A,>(notifier: Observable<unknown>): ToUninitializedOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new TakeUntilObservableClass(parentObservable, notifier);

export const takeUntilI = <A,>(
  notifier: Observable<unknown>,
): InitializedToInitializedOperator<A, A> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  takeUntil(notifier) as InitializedToInitializedOperator<A, A>;

class TakeUntilObservableClass<A>
  extends SyncChildObservableClass<A, 'takeUntil', readonly [A]>
  implements TakeUntilOperatorObservable<A>
{
  constructor(parentObservable: Observable<A>, notifier: Observable<unknown>) {
    super({
      parents: [parentObservable],
      type: 'takeUntil',
      initialValue: parentObservable.snapshot,
    });

    notifier.subscribe(
      () => {
        this.complete();
      },
      () => {
        this.complete();
      },
    );
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.setNext(par.snapshot.value, updaterSymbol);
  }
}
