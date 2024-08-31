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
      initialValue: parentObservable.getSnapshot(),
    });
    this.#timerId = undefined;
    this.#milliSeconds = milliSeconds;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(sn)) {
      return; // skip update
    }

    this.#resetTimer();
    // set timer
    this.#timerId = setTimeout(() => {
      if (Maybe.isNone(sn)) return;
      this.startUpdate(sn.value);
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
