import { DateUtils } from '@noshiro/ts-utils';

export class Stopwatch {
  #startTime = 0;
  #endTime = 0;
  #time = 0;
  readonly #name;

  constructor(timerName = '') {
    this.#name = timerName;
  }

  start(log = false): void {
    this.#startTime = DateUtils.now();
    this.#time = 0;
    if (log) {
      console.log(`${this.#name} started.`);
    }
  }

  stop(log = false): void {
    this.#endTime = DateUtils.now();
    this.#time = this.#endTime - this.#startTime;
    if (log) {
      console.log(`${this.#name} stopped.`);
    }
  }

  result(): number {
    return this.#time;
  }

  printResult(): void {
    console.log(`${this.#name} ${this.#time} msec`);
  }
}
