import { noValue, view, type Observable } from '../core/index.mjs';
import { AsyncSourceClass } from './async-source-class.mjs';

/**
 * Emits `0` once, `milliseconds` after it is created, and settles. Disposing it
 * clears the timer.
 */
export const timer = (milliseconds: number): Observable<number> =>
  view(new TimerClass(milliseconds));

/**
 * Emits `0` in the task after it is created (or, with `emitInitial: false`, `1`
 * one interval later), then the next integer every `milliseconds`. With `times`
 * (a positive integer, or `Infinity`, the default), it settles after that many
 * values and clears its timers; otherwise it runs until disposed. Any count is
 * accepted, beyond `Number.MAX_SAFE_INTEGER` too.
 */
export const counter = (
  milliseconds: number,
  options?: Readonly<{ emitInitial?: boolean; times?: number }>,
): Observable<number> => {
  const times = options?.times ?? Number.POSITIVE_INFINITY;

  if (!isValidTimes(times)) {
    throw new RangeError(
      `synstate-next: \`times\` must be a positive integer or Infinity, but was ${times}.`,
    );
  }

  return view(
    new CounterClass(milliseconds, options?.emitInitial ?? true, times),
  );
};

class TimerClass extends AsyncSourceClass<number> {
  #mut_timer: ReturnType<typeof setTimeout> | undefined;

  constructor(milliseconds: number) {
    super(noValue);

    this.#mut_timer = setTimeout(() => {
      this.#mut_timer = undefined;

      this.deliver(0, true);
    }, milliseconds);
  }

  protected override teardown(): void {
    clearTimeout(this.#mut_timer);

    this.#mut_timer = undefined;
  }
}

class CounterClass extends AsyncSourceClass<number> {
  readonly #times: number;

  #mut_next: number;

  #mut_emitted: number;

  #mut_initial: ReturnType<typeof setTimeout> | undefined;

  #mut_interval: ReturnType<typeof setInterval> | undefined;

  constructor(milliseconds: number, emitInitial: boolean, times: number) {
    super(noValue);

    this.#times = times;

    this.#mut_next = emitInitial ? 0 : 1;

    this.#mut_emitted = 0;

    this.#mut_initial = emitInitial
      ? setTimeout(() => {
          this.#mut_initial = undefined;

          this.#tick();
        }, 0)
      : undefined;

    this.#mut_interval = setInterval(() => {
      this.#tick();
    }, milliseconds);
  }

  #tick(): void {
    const value = this.#mut_next;

    this.#mut_next += 1;

    this.#mut_emitted += 1;

    const last = this.#mut_emitted >= this.#times;

    if (last) {
      this.#clear();
    }

    this.deliver(value, last);
  }

  #clear(): void {
    clearTimeout(this.#mut_initial);

    clearInterval(this.#mut_interval);

    this.#mut_initial = undefined;

    this.#mut_interval = undefined;
  }

  protected override teardown(): void {
    this.#clear();
  }
}

const isValidTimes = (times: number): boolean =>
  // `isInteger`, not `isSafeInteger`: a count beyond the safe range only means
  // that it never ends.
  // eslint-disable-next-line unicorn/prefer-number-is-safe-integer
  times === Number.POSITIVE_INFINITY || (Number.isInteger(times) && times >= 1);
