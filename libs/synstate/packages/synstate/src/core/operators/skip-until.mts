import { Optional } from 'ts-data-forge';
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
  extends SyncChildObservableClass<A, readonly [A]>
  implements SkipUntilOperatorObservable<A>
{
  #mut_isSkipping: boolean;

  constructor(parentObservable: Observable<A>, notifier: Observable<unknown>) {
    super({
      parents: [parentObservable],
      initialValue: Optional.none,
    });

    this.#mut_isSkipping = true;

    notifier.subscribe(
      () => {
        this.#mut_isSkipping = false;
      },
      () => {
        this.#mut_isSkipping = false;
      },
    );
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (
      par.updaterSymbol !== updaterSymbol ||
      Optional.isNone(sn) ||
      this.#mut_isSkipping
    ) {
      return; // skip update
    }

    this.setNext(sn.value, updaterSymbol);
  }
}
