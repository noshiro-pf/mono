/**
 * Time, as the stores see it: what time it is and a timer that can be called
 * off. Passed in so that a test can drive it ({@link manualTimers}).
 */
export type Timers = Readonly<{
  now: () => number;
  /** Runs `run` after `delayMs`; the returned function calls it off. */
  setTimer: (delayMs: number, run: () => void) => () => void;
}>;

export const browserTimers: Timers = {
  now: () => Date.now(),
  setTimer: (delayMs, run) => {
    const id = globalThis.setTimeout(run, delayMs);

    return () => {
      globalThis.clearTimeout(id);
    };
  },
} as const;

/** Timers whose time moves only when {@link ManualTimers.advance} says. */
export type ManualTimers = Timers &
  Readonly<{
    advance: (ms: number) => void;
    pending: () => number;
  }>;

export const manualTimers = (startMs = 0): ManualTimers => {
  let mut_now = startMs;

  let mut_nextId = 0;

  const mut_timers = new Map<
    number,
    Readonly<{ at: number; run: () => void }>
  >();

  const advance = (ms: number): void => {
    const until = mut_now + ms;

    for (;;) {
      const due = Array.from(mut_timers)
        .filter(([, waiting]) => waiting.at <= until)
        .toSorted(([, a], [, b]) => a.at - b.at)[0];

      if (due === undefined) {
        break;
      }

      const [id, entry] = due;

      mut_timers.delete(id);

      mut_now = entry.at;

      entry.run();
    }

    mut_now = until;
  };

  return {
    now: () => mut_now,
    setTimer: (delayMs, run) => {
      const id = mut_nextId;

      mut_nextId += 1;

      mut_timers.set(id, { at: mut_now + Math.max(0, delayMs), run });

      return () => {
        mut_timers.delete(id);
      };
    },
    advance,
    pending: () => mut_timers.size,
  };
};
