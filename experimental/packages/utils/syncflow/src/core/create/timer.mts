import { Maybe } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class/index.mjs';
import { type TimerObservable } from '../types/index.mjs';

export const timer = (
  milliSeconds: number,
  startManually: boolean = false,
): TimerObservable => new TimerObservableClass(milliSeconds, startManually);

class TimerObservableClass
  extends RootObservableClass<0>
  implements TimerObservable
{
  readonly #milliSeconds: number;
  #timerId: TimerId | undefined;
  #isStarted: boolean;

  constructor(milliSeconds: number, startManually: boolean) {
    super({ initialValue: Maybe.none });
    this.#milliSeconds = milliSeconds;
    this.#timerId = undefined;
    this.#isStarted = false;
    if (!startManually) {
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
      console.warn('cannot restart stopped TimerObservable');
      return this;
    }
    this.#timerId = setTimeout(() => {
      this.startUpdate(0);
      this.complete();
    }, this.#milliSeconds);
    return this;
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
