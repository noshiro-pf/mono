import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type DropInitialValueOperator,
  type Observable,
  type SkipUntilOperatorObservable,
  type UpdaterSymbol,
} from '../types/index.mjs';

export const skipUntil =
  <A,>(notifier: Observable<unknown>): DropInitialValueOperator<A, A> =>
  (parentObservable) =>
    new SkipUntilObservableClass(parentObservable, notifier);

class SkipUntilObservableClass<A>
  extends SyncChildObservableClass<A, [A]>
  implements SkipUntilOperatorObservable<A>
{
  #isSkipping: boolean;
  constructor(parentObservable: Observable<A>, notifier: Observable<unknown>) {
    super({
      parents: [parentObservable],
      initialValue: Maybe.none,
    });

    this.#isSkipping = true;

    notifier.subscribe(
      () => {
        this.#isSkipping = false;
      },
      () => {
        this.#isSkipping = false;
      },
    );
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    const sn = par.getSnapshot();

    if (
      par.updaterSymbol !== updaterSymbol ||
      Maybe.isNone(sn) ||
      this.#isSkipping
    ) {
      return; // skip update
    }

    this.setNext(sn.value, updaterSymbol);
  }
}
