import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  InitializedToInitializedOperator,
  Observable,
  TakeUntilOperatorObservable,
  ToBaseOperator,
  Token,
} from '../types';

export const takeUntil = <A>(
  notifier: Observable<unknown>
): ToBaseOperator<A, A> => (parent: Observable<A>) =>
  new TakeUntilObservableClass(parent, notifier);

export const takeUntilI = <A>(
  notifier: Observable<unknown>
): InitializedToInitializedOperator<A, A> =>
  takeUntil(notifier) as InitializedToInitializedOperator<A, A>;

class TakeUntilObservableClass<A>
  extends SyncChildObservableClass<A, 'takeUntil', [A]>
  implements TakeUntilOperatorObservable<A> {
  constructor(parent: Observable<A>, notifier: Observable<unknown>) {
    super({
      parents: [parent],
      type: 'takeUntil',
      currentValueInit: parent.currentValue,
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

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this.setNext(parent.currentValue.value, token);
  }
}
