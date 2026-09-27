/**
 * What the page has read, and the timers that keep it current.
 *
 * The state lives here rather than in the component that draws it, so that
 * when to read — on a token, on a timer, on a tab coming back, on Refresh —
 * is one place that a test can drive. Everything that touches the browser
 * comes in through {@link ReaderDeps}; `store.mts` passes the real ones.
 */

import {
  createState,
  filter,
  map,
  skipIfNoChange,
  type InitializedObservable,
  type Observable as SynstateObservable,
} from 'synstate';
import { Result, unknownToString } from 'ts-data-forge';
import { CLOCK_TICK_MS, POLL_INTERVAL_MS } from '../constants.mjs';
import { type Answered } from '../graphql.mjs';
import { type LoadedReport } from '../load-report.mjs';
import {
  asRefreshing,
  LOADING,
  merge,
  type LoadState,
} from '../load-state.mjs';
import { type RateLimit } from '../rate-limit.mjs';
import { type StoredToken } from '../token.mjs';

export type ReaderDeps = Readonly<{
  token: InitializedObservable<StoredToken | undefined>;
  load: (token: string, nowMs: number) => Promise<Answered<LoadedReport>>;
  now: () => number;
  /**
   * synstate's `counter`: `0` at once, then `1, 2, …` every `ms`, until it is
   * completed. A test hands in a `source` it drives itself.
   */
  counter: (ms: number) => SynstateObservable<number>;
  isVisible: () => boolean;
  /** Emits whenever the tab is shown or hidden. */
  visibilityChange: SynstateObservable<unknown>;
}>;

export type Reader = Readonly<{
  loadState: InitializedObservable<LoadState>;
  /** What GitHub last said was left of the budget. */
  rateLimit: InitializedObservable<RateLimit | undefined>;
  /**
   * The instant every "3 minutes ago" on the page is measured against.
   *
   * Its own state, ticking on its own timer, rather than fixed at the moment
   * of the read: a hidden tab stops reading, and a page that said "read just
   * now" for as long as it stayed open would be claiming a freshness it does
   * not have.
   */
  nowMs: InitializedObservable<number>;
  /**
   * Reads at once. There is nothing to hold it back for: a read costs the
   * same whether the timer or the reader asks for it, and a reader who
   * presses it wants now. The button is shut only while a read it started
   * is still out, so a double click is one read.
   */
  refresh: () => void;
  /** Starts reading, and returns what stops it. */
  start: () => () => void;
}>;

export const createReader = (deps: ReaderDeps): Reader => {
  const { token, load, now, counter, isVisible, visibilityChange } = deps;

  const [loadState, setLoadState, { updateState: updateLoadState }] =
    createState<LoadState>(LOADING);

  const [rateLimit, , { updateState: updateRateLimit }] = createState<
    RateLimit | undefined
  >(undefined);

  const [nowMs, setNowMs] = createState(0);

  const currentToken = (): string | undefined =>
    token.getSnapshot().value?.value;

  const read = (): void => {
    const tokenValue = currentToken();

    if (tokenValue === undefined) {
      return;
    }

    const startedAtMs = now();

    // An answer for a token the reader has since forgotten or replaced is
    // dropped: it would put back a report they asked to take away.
    const apply = (
      result: Result<LoadedReport, string>,
      answeredLimit: RateLimit | undefined,
    ): void => {
      if (currentToken() !== tokenValue) {
        return;
      }

      setNowMs(now());

      updateRateLimit((current) => answeredLimit ?? current);

      updateLoadState((current) => merge(current, result, startedAtMs));
    };

    load(tokenValue, startedAtMs)
      .then(({ result, rateLimit: answeredLimit }) => {
        apply(result, answeredLimit);
      })
      .catch((error: unknown) => {
        apply(Result.err(unknownToString(error)), undefined);
      });
  };

  const refresh = (): void => {
    updateLoadState(asRefreshing);

    read();
  };

  const start = (): (() => void) => {
    // The first read, and a read on every change of token, which is how a
    // reader finds out whether GitHub takes the one they pasted. Moving the
    // same token between the tab and the device is not a change.
    const tokenSubscription = token
      .pipe(map((stored) => stored?.value))
      .pipe(skipIfNoChange())
      .subscribe((tokenValue) => {
        if (tokenValue === undefined) {
          setLoadState(LOADING);
        } else {
          read();
        }
      });

    // A counter's `0` comes at once rather than after an interval, and the
    // token has just been read for, so only what follows it is a tick.
    const poll = counter(POLL_INTERVAL_MS);

    const clock = counter(CLOCK_TICK_MS);

    // A hidden tab is a tab nobody is reading, and a forgotten one would
    // otherwise go on spending the budget for the rest of the day. Coming
    // back to it is the next subscription.
    const pollSubscription = poll
      .pipe(filter((tick) => tick > 0 && isVisible()))
      .subscribe(() => {
        read();
      });

    const visibilitySubscription = visibilityChange
      .pipe(filter(() => isVisible()))
      .subscribe(() => {
        setNowMs(now());

        read();
      });

    const clockSubscription = clock
      .pipe(filter((tick) => tick > 0))
      .subscribe(() => {
        setNowMs(now());
      });

    return () => {
      tokenSubscription.unsubscribe();

      pollSubscription.unsubscribe();

      visibilitySubscription.unsubscribe();

      clockSubscription.unsubscribe();

      // Completing a counter is what clears its interval.
      poll.complete();

      clock.complete();
    };
  };

  return { loadState, rateLimit, nowMs, refresh, start };
};
