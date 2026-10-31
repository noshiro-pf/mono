/**
 * The time the page shows the state at.
 *
 * Read again when the state changes (a task just marked done has to unblock
 * what waits for it with the time it was marked, not the time of the last
 * tick), when the page comes back into view, and when the next change the clock
 * alone makes is due — `nextTickDelay`, which never waits longer than
 * `maxDelayMs`. Between those nothing can change, so nothing is re-rendered.
 */

import {
  createEventEmitter,
  createState,
  empty,
  map,
  merge,
  switchMap,
  withInitialValue,
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
  // While `start` has been called and its stop has not. The listeners are
  // derived from it, so that stopping disposes them.
  const [started, setStarted] = createState(false);

  const [timerFired, fireTimer] = createEventEmitter();

  // Once on starting, then on every change of the state and every wake. Read as
  // part of the update that asks for it, rather than written from a subscriber
  // of it, which would be a write while that update propagates.
  const listened = started.pipe(
    switchMap((isStarted) =>
      isStarted
        ? merge([deps.state, deps.wake]).pipe(withInitialValue(undefined))
        : empty<unknown>(),
    ),
  );

  const now = merge([timerFired, listened])
    .pipe(map(() => deps.now()))
    .pipe(withInitialValue(deps.now()));

  const start = (): (() => void) => {
    let mut_timer: H | undefined = undefined;

    const clearTimer = (): void => {
      if (mut_timer !== undefined) {
        deps.clearTimer(mut_timer);
      }

      mut_timer = undefined;
    };

    setStarted(true);

    // Subscribed after starting, so that its first call is the time just read
    // rather than the one the store was made with.
    const nowSubscription = now.subscribe((current) => {
      clearTimer();

      mut_timer = deps.setTimer(
        fireTimer,
        nextTickDelay(deps.state.getSnapshot().value, current, deps.maxDelayMs),
      );
    });

    return () => {
      nowSubscription.unsubscribe();

      setStarted(false);

      clearTimer();
    };
  };

  return { now, start };
};
