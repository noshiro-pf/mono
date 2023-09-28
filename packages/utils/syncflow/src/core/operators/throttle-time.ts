import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  type InitializedToInitializedOperator,
  type Observable,
  type ThrottleTimeOperatorObservable,
  type ToBaseOperator,
  type UpdaterSymbol,
} from '../types';

export const throttleTime =
  <A>(milliSeconds: number): ToBaseOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new ThrottleTimeObservableClass(parentObservable, milliSeconds);

export const throttleTimeI = <A>(
  milliSeconds: number
): InitializedToInitializedOperator<A, A> =>
  // eslint-disable-next-line no-restricted-syntax
  throttleTime(milliSeconds) as InitializedToInitializedOperator<A, A>;

class ThrottleTimeObservableClass<A>
  extends SyncChildObservableClass<A, 'throttleTime', readonly [A]>
  implements ThrottleTimeOperatorObservable<A>
{
  readonly #milliSeconds: number;
  #mut_timerId: TimerId | undefined;
  #mut_isSkipping: boolean;

  constructor(parentObservable: Observable<A>, milliSeconds: number) {
    super({
      parents: [parentObservable],
      type: 'throttleTime',
      initialValue: parentObservable.snapshot,
    });
    this.#mut_timerId = undefined;
    this.#mut_isSkipping = false;
    this.#milliSeconds = milliSeconds;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (
      par.updaterSymbol !== updaterSymbol ||
      Maybe.isNone(par.snapshot) ||
      this.#mut_isSkipping
    ) {
      return; // skip update
    }

    this.setNext(par.snapshot.value, updaterSymbol);

    this.#mut_isSkipping = true;
    // set timer
    this.#mut_timerId = setTimeout(() => {
      this.#mut_isSkipping = false;
    }, this.#milliSeconds);
  }

  #resetTimer(): void {
    if (this.#mut_timerId !== undefined) {
      clearTimeout(this.#mut_timerId);
    }
  }

  override complete(): void {
    this.#resetTimer();
    super.complete();
  }
}
