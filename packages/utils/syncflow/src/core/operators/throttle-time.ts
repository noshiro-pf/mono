import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  InitializedToInitializedOperator,
  Observable,
  ThrottleTimeOperatorObservable,
  ToBaseOperator,
  Token,
} from '../types';

export const throttleTime =
  <A>(milliSeconds: number): ToBaseOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new ThrottleTimeObservableClass(parentObservable, milliSeconds);

export const throttleTimeI = <A>(
  milliSeconds: number
): InitializedToInitializedOperator<A, A> =>
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
      currentValueInit: parentObservable.currentValue,
    });
    this.#mut_timerId = undefined;
    this.#mut_isSkipping = false;
    this.#milliSeconds = milliSeconds;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update
    if (this.#mut_isSkipping) return; // skip update

    this.setNext(par.currentValue.value, token);

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
