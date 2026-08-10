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
  extends SyncChildObservableClass<A, readonly [A]>
  implements TakeUntilOperatorObservable<A>
{
  constructor(parentObservable: Observable<A>, notifier: Observable<unknown>) {
    super({
      parents: [parentObservable],
      initialValue: parentObservable.getSnapshot(),
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
    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(sn)) {
      return; // skip update
    }

    this.setNext(sn.value, updaterSymbol);
  }
}
