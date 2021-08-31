import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  InitializedToInitializedOperator,
  Observable,
  TakeUntilOperatorObservable,
  ToBaseOperator,
  Token,
} from '../types';

export const takeUntil =
  <A>(notifier: Observable<unknown>): ToBaseOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new TakeUntilObservableClass(parentObservable, notifier);

export const takeUntilI = <A>(
  notifier: Observable<unknown>
): InitializedToInitializedOperator<A, A> =>
  takeUntil(notifier) as InitializedToInitializedOperator<A, A>;

class TakeUntilObservableClass<A>
  extends SyncChildObservableClass<A, 'takeUntil', readonly [A]>
  implements TakeUntilOperatorObservable<A>
{
  constructor(parentObservable: Observable<A>, notifier: Observable<unknown>) {
    super({
      parents: [parentObservable],
      type: 'takeUntil',
      currentValueInit: parentObservable.currentValue,
    });

    notifier.subscribe(
      () => {
        this.complete();
      },
      () => {
        this.complete();
      }
    );
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    this.setNext(par.currentValue.value, token);
  }
}
