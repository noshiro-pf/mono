/**
 * The time the page shows the state at.
 *
 * Read again when the state changes (a task just marked done has to unblock
 * what waits for it with the time it was marked, not the time of the last
 * tick), when the page comes back into view, and when the next change the
 * clock alone makes is due — `nextTickDelay`, which never waits longer than
 * `maxDelayMs`. Between those nothing can change, so nothing is re-rendered.
 */

import {
  createState,
  type InitializedObservable,
  type Observable as SynstateObservable,
} from 'synstate';
import type { DomainState } from '../domain/index.mjs';
import { nextTickDelay } from '../view-model/index.mjs';

/** `H` is whatever `setTimer` hands back for `clearTimer` to take. */
export type ClockDeps<H> = Readonly<{
  state: InitializedObservable<DomainState>;
  now: () => number;
  maxDelayMs: number;
  setTimer: (callback: () => void, delayMs: number) => H;
  clearTimer: (handle: H) => void;
  /** The page came back into view; timers may not have run while it was not. */
  wake: SynstateObservable<unknown>;
}>;

export type ClockStore = Readonly<{
  now: InitializedObservable<number>;
  /** Starts the timer and the listeners, and returns what stops them. */
  start: () => () => void;
}>;

export const createClockStore = <H,>(deps: ClockDeps<H>): ClockStore => {
  const [now, setNow] = createState(deps.now());

  const start = (): (() => void) => {
    let mut_timer: H | undefined = undefined;

    const tick = (): void => {
      if (mut_timer !== undefined) {
        deps.clearTimer(mut_timer);
      }

      const current = deps.now();

      setNow(current);

      mut_timer = deps.setTimer(
        tick,
        nextTickDelay(deps.state.getSnapshot().value, current, deps.maxDelayMs),
      );
    };

    const stateSubscription = deps.state.subscribe(tick);

    const wakeSubscription = deps.wake.subscribe(tick);

    return () => {
      stateSubscription.unsubscribe();

      wakeSubscription.unsubscribe();

      if (mut_timer !== undefined) {
        deps.clearTimer(mut_timer);
      }
    };
  };

  return { now, start };
};
