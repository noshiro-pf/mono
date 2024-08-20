import { Maybe } from '@noshiro/ts-utils';
import { AsyncChildObservableClass } from '../class/index.mjs';
import {
  type DebounceTimeOperatorObservable,
  type KeepInitialValueOperator,
  type Observable,
  type UpdaterSymbol,
} from '../types/index.mjs';

export const debounceTime = <A,>(
  milliSeconds: number,
): KeepInitialValueOperator<A, A> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    new DebounceTimeObservableClass(
      parentObservable,
      milliSeconds,
    )) as KeepInitialValueOperator<A, A>;

class DebounceTimeObservableClass<A>
  extends AsyncChildObservableClass<A, readonly [A]>
  implements DebounceTimeOperatorObservable<A>
{
  readonly #milliSeconds: number;
  #timerId: TimerId | undefined;

  constructor(parentObservable: Observable<A>, milliSeconds: number) {
    super({
      parents: [parentObservable],
      initialValue: parentObservable.snapshot,
    });
    this.#timerId = undefined;
    this.#milliSeconds = milliSeconds;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.#resetTimer();
    // set timer
    this.#timerId = setTimeout(() => {
      if (Maybe.isNone(par.snapshot)) return;
      this.startUpdate(par.snapshot.value);
    }, this.#milliSeconds);
  }

  #resetTimer(): void {
    if (this.#timerId !== undefined) {
      clearTimeout(this.#timerId);
    }
  }

  override complete(): void {
    this.#resetTimer();
    super.complete();
  }
}
