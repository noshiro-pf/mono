import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  type Observable,
  type RemoveInitializedOperator,
  type SkipUntilOperatorObservable,
  type UpdaterSymbol,
} from '../types';

export const skipUntil =
  <A>(notifier: Observable<unknown>): RemoveInitializedOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new SkipUntilObservableClass(parentObservable, notifier);

class SkipUntilObservableClass<A>
  extends SyncChildObservableClass<A, 'skipUntil', [A]>
  implements SkipUntilOperatorObservable<A>
{
  #isSkipping: boolean;
  constructor(parentObservable: Observable<A>, notifier: Observable<unknown>) {
    super({
      parents: [parentObservable],
      type: 'skipUntil',
      initialValue: Maybe.none,
    });

    this.#isSkipping = true;

    notifier.subscribe(
      () => {
        this.#isSkipping = false;
      },
      () => {
        this.#isSkipping = false;
      }
    );
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (
      par.updaterSymbol !== updaterSymbol ||
      Maybe.isNone(par.snapshot) ||
      this.#isSkipping
    ) {
      return; // skip update
    }

    this.setNext(par.snapshot.value, updaterSymbol);
  }
}
