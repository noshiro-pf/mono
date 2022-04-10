import { Maybe } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class';
import type { IntervalObservable } from '../types';

export const interval = (
  milliSeconds: number,
  startManually?: boolean
): IntervalObservable =>
  new IntervalObservableClass(milliSeconds, startManually);

class IntervalObservableClass
  extends RootObservableClass<number, 'Interval'>
  implements IntervalObservable
{
  readonly #milliSeconds: number;
  #counter: number;
  #timerId0: TimerId | undefined;
  #timerId: TimerId | undefined;
  #isStarted: boolean;

  constructor(milliSeconds: number, startManually?: boolean) {
    super({ type: 'Interval', currentValueInit: Maybe.none });
    this.#milliSeconds = milliSeconds;
    this.#counter = 0;
    this.#timerId0 = undefined;
    this.#timerId = undefined;
    this.#isStarted = false;
    if (startManually !== true) {
      this.start();
    }
  }

  start(): this {
    if (this.#isStarted) {
      console.warn('cannot start twice');
      return this;
    }
    this.#isStarted = true;
    if (this.isCompleted) {
      console.warn('cannot restart stopped IntervalObservable');
      return this;
    }

    // emit zero
    this.#timerId0 = setTimeout(() => {
      this.startUpdate(this.#counter);
    }, 0);

    this.#timerId = setInterval(() => {
      this.#counter += 1;
      this.startUpdate(this.#counter);
    }, this.#milliSeconds);

    return this;
  }

  #resetTimer(): void {
    if (this.#timerId0 !== undefined && this.#timerId !== undefined) {
      clearInterval(this.#timerId0);
      clearInterval(this.#timerId);
    }
  }

  override complete(): void {
    this.#resetTimer();
    super.complete();
  }
}
