import { createState, type InitializedObservable } from 'synstate';
import type { Timers } from './timers.mjs';

export type ClockStore = Readonly<{
  /** Now, in epoch milliseconds, moved every second while the tab is shown. */
  now: InitializedObservable<number>;
  start: () => () => void;
}>;

/**
 * The one clock every age on the page is measured against (spec §4.2). It stops
 * while the tab is hidden, and catches up as soon as it is shown again, so a
 * tab that stopped reading does not go on looking fresh.
 */
export const createClockStore = (
  deps: Readonly<{
    timers: Timers;
    isVisible: () => boolean;
    /** Calls back on every visibility change; returns a stop. */
    watchVisibility: (onChange: () => void) => () => void;
  }>,
): ClockStore => {
  const [now, setNow] = createState(deps.timers.now());

  return {
    now,
    start: () => {
      let mut_cancel: (() => void) | undefined = undefined;

      const tick = (): void => {
        setNow(deps.timers.now());

        mut_cancel = deps.isVisible()
          ? deps.timers.setTimer(TICK_MS, tick)
          : undefined;
      };

      tick();

      const stopWatching = deps.watchVisibility(() => {
        mut_cancel?.();

        tick();
      });

      return () => {
        mut_cancel?.();

        stopWatching();
      };
    },
  };
};

const TICK_MS = 1000;
