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
import { fastDeepEqual, Result, unknownToString } from 'ts-data-forge';
import { type StrictPick } from 'ts-type-forge';
import { CLOCK_TICK_MS, POLL_INTERVAL_MS } from '../constants.mjs';
import { type Answered } from '../graphql.mjs';
import {
  type Entry,
  type LoadedReport,
  type PageSummary,
} from '../load-report.mjs';
import {
  asRefreshing,
  LOADING,
  settle,
  type LoadStatus,
} from '../load-state.mjs';
import { type RateLimit } from '../rate-limit.mjs';
import { sameItemsIfEqual } from '../share.mjs';
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
  /** How the reading went, which changes only when that does. */
  loadStatus: InitializedObservable<LoadStatus>;
  /**
   * The report, in the parts the page draws, each its own state and passed
   * on only when a read changed it (`equals`): a poll that found nothing new
   * writes {@link readAt} and nothing else, and a part a read left alone
   * keeps the object it had. The pull requests are kept one by one — each
   * is its own card — and a part is empty while there is no report.
   */
  readAt: InitializedObservable<number>;
  summary: InitializedObservable<PageSummary>;
  entries: InitializedObservable<readonly Entry[]>;
  /** The entries by number, for the merge order to look them up. */
  byNumber: InitializedObservable<ReadonlyMap<number, Entry>>;
  /**
   * One scale for every divergence bar on the page, so that a bar on one
   * card can be compared with a bar on another. Per-card, `-2` and `-39`
   * would be drawn the same length, which is the one thing the bars are for.
   */
  scaleMax: InitializedObservable<number>;
  roots: InitializedObservable<LoadedReport['roots']>;
  cycles: InitializedObservable<LoadedReport['cycles']>;
  merged: InitializedObservable<LoadedReport['merged']>;
  issues: InitializedObservable<LoadedReport['issues']>;
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

  // Each state below is passed on only when what it is given differs from
  // what it holds. `equals` decides that where the state is held, once, so
  // nothing downstream has anything to compare.
  const [
    loadStatus,
    setLoadStatus,
    { updateState: updateLoadStatus, getSnapshot: getLoadStatus },
  ] = createState<LoadStatus>(LOADING, { equals: fastDeepEqual });

  const [rateLimit, , { updateState: updateRateLimit }] = createState<
    RateLimit | undefined
  >(undefined, { equals: fastDeepEqual });

  const [nowMs, setNowMs] = createState(0);

  const [readAt, setReadAt, { getSnapshot: getReadAt }] = createState(
    EMPTY_PARTS.readAtEpochMs,
    { equals: Object.is },
  );

  const [summary, setSummary] = createState(EMPTY_PARTS.summary, {
    equals: fastDeepEqual,
  });

  // The pull requests are kept one by one, each being its own card. What
  // `sameItemsIfEqual` makes of an answer that changed nothing is the array
  // already held, which `equals` then stops.
  const [entries, , { updateState: updateEntries }] = createState(
    EMPTY_PARTS.entries,
    { equals: Object.is },
  );

  const [roots, setRoots] = createState(EMPTY_PARTS.roots, {
    equals: fastDeepEqual,
  });

  const [cycles, setCycles] = createState(EMPTY_PARTS.cycles, {
    equals: fastDeepEqual,
  });

  const [merged, setMerged] = createState(EMPTY_PARTS.merged, {
    equals: fastDeepEqual,
  });

  const [issues, setIssues] = createState(EMPTY_PARTS.issues, {
    equals: fastDeepEqual,
  });

  const writeReport = (report: ReportParts): void => {
    setReadAt(report.readAtEpochMs);

    setSummary(report.summary);

    updateEntries((held) => sameItemsIfEqual(held, report.entries));

    setRoots(report.roots);

    setCycles(report.cycles);

    setMerged(report.merged);

    setIssues(report.issues);
  };

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

      const settled = settle(getLoadStatus(), getReadAt(), result, startedAtMs);

      // The report before the status, so that a page shown for the first
      // time is shown with its parts already in place.
      if (settled.report !== undefined) {
        writeReport(settled.report);
      }

      setLoadStatus(settled.status);
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
    updateLoadStatus(asRefreshing);

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
          setLoadStatus(LOADING);

          writeReport(EMPTY_PARTS);
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

    // Nor is there anyone to read the ages to, and coming back moves the
    // clock at once.
    const clockSubscription = clock
      .pipe(filter((tick) => tick > 0 && isVisible()))
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

  return {
    loadStatus,
    readAt,
    summary,
    entries,
    byNumber: entries.pipe(
      map((list) => new Map(list.map((entry) => [entry.number, entry]))),
    ),
    scaleMax: entries.pipe(map(divergenceScale)),
    roots,
    cycles,
    merged,
    issues,
    rateLimit,
    nowMs,
    refresh,
    start,
  };
};

/** What of a report the page draws. */
type ReportParts = StrictPick<
  LoadedReport,
  | 'readAtEpochMs'
  | 'summary'
  | 'entries'
  | 'roots'
  | 'cycles'
  | 'merged'
  | 'issues'
>;

/** What the page shows while there is no report. */
const EMPTY_PARTS: ReportParts = {
  readAtEpochMs: 0,
  summary: {
    open: 0,
    queued: 0,
    draft: 0,
    failing: 0,
    behind: 0,
    setAside: 0,
    awaitingReview: 0,
  },
  entries: [],
  roots: [],
  cycles: [],
  merged: [],
  issues: { items: [], totalCount: 0 },
} as const;

const divergenceScale = (entries: readonly Entry[]): number =>
  Math.max(
    1,
    ...entries.flatMap(({ comparison }) =>
      comparison === undefined ? [] : [comparison.aheadBy, comparison.behindBy],
    ),
  );
