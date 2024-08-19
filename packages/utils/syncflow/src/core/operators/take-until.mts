import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type KeepInitialValueOperator,
  type Observable,
  type TakeUntilOperatorObservable,
  type UpdaterSymbol,
} from '../types/index.mjs';

export const takeUntil = <A,>(
  notifier: Observable<unknown>,
): KeepInitialValueOperator<A, A> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    new TakeUntilObservableClass(
      parentObservable,
      notifier,
    )) as KeepInitialValueOperator<A, A>;

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
