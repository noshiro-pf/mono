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
import type { StrictPick } from 'ts-type-forge';
import { CLOCK_TICK_MS, POLL_INTERVAL_MS } from '../constants.mjs';
import type { Answered } from '../graphql.mjs';
import {
  appendIssues,
  type Entry,
  type IssueList,
  type LoadedReport,
  type PageSummary,
  type SectionPart,
} from '../load-report.mjs';
import {
  asRefreshing,
  LOADING,
  settle,
  type LoadStatus,
} from '../load-state.mjs';
import type { RateLimit } from '../rate-limit.mjs';
import { ISSUES_LIMIT, ISSUES_PAGE_SIZE } from '../report-query.mjs';
import { sameItemsIfEqual } from '../share.mjs';
import type { StoredToken } from '../token.mjs';
import type { WorkflowRunList } from '../workflow-runs.mjs';

export type ReaderDeps = Readonly<{
  token: InitializedObservable<StoredToken | undefined>;
  /**
   * A read of the report, listing the first `issueCount` open issues. When
   * `onProgress` is given, it is handed the report as it stands each time a
   * part of it answers before the last.
   */
  load: (
    token: string,
    nowMs: number,
    issueCount: number,
    onProgress: ((report: LoadedReport) => void) | undefined,
  ) => Promise<Answered<LoadedReport>>;
  /**
   * The workflow runs still going (`workflow-runs.mts`), read beside the
   * report on every read rather than as a part of it: a different API, with
   * its own budget, whose failure is no reason to say the report failed.
   */
  loadRuns: (token: string) => Promise<Result<WorkflowRunList, string>>;
  /** The `first` open issues after `after`. */
  loadIssues: (
    token: string,
    after: string,
    first: number,
  ) => Promise<Answered<IssueList>>;
  now: () => number;
  /**
   * synstate's `counter` without its initial `0`: `1, 2, …` every `ms`, until
   * it is completed. A test hands in a `source` it drives itself.
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
  /** The sections below the merge order that have not answered yet. */
  reading: InitializedObservable<readonly SectionPart[]>;
  /** The workflow runs still going, as the last read of them left them. */
  runs: InitializedObservable<RunsStatus>;
  /** How the last {@link loadMoreIssues} went. */
  moreIssues: InitializedObservable<MoreIssuesStatus>;
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
  /**
   * Lists the next {@link ISSUES_PAGE_SIZE} open issues, and every read
   * after it lists them too, until the token changes. The page is read on
   * its own rather than by a read of the whole report, which would take as
   * long as Refresh does.
   */
  loadMoreIssues: () => void;
  /** Starts reading, and returns what stops it. */
  start: () => () => void;
}>;

/**
 * The workflow runs, held by the same two rules as the report
 * (`load-state.mts`): a read that fails keeps the list on screen and says so
 * beside it, and an older read never replaces a newer one.
 */
export type RunsStatus = Readonly<
  | { type: 'reading' }
  | { type: 'failed'; message: string }
  | {
      type: 'ready';
      list: WorkflowRunList;
      /** The last read failing, while the list is the one before it. */
      error: string | undefined;
    }
>;

export type MoreIssuesStatus = Readonly<
  { type: 'idle' } | { type: 'loading' } | { type: 'failed'; message: string }
>;

export const createReader = (deps: ReaderDeps): Reader => {
  const {
    token,
    load,
    loadRuns,
    loadIssues,
    now,
    counter,
    isVisible,
    visibilityChange,
  } = deps;

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

  const [issues, setIssues, { getSnapshot: getIssues }] = createState(
    EMPTY_PARTS.issues,
    { equals: fastDeepEqual },
  );

  const [reading, setReading] = createState(EMPTY_PARTS.reading, {
    equals: fastDeepEqual,
  });

  const [runs, setRuns, { updateState: updateRuns }] = createState<RunsStatus>(
    RUNS_READING,
    { equals: fastDeepEqual },
  );

  // When the read of the runs on screen started; `0` while none is.
  let mut_runsShownFromMs = 0;

  const [moreIssues, setMoreIssues, { getSnapshot: getMoreIssues }] =
    createState<MoreIssuesStatus>(MORE_ISSUES_IDLE, { equals: fastDeepEqual });

  // How many open issues each read lists. Raised by `loadMoreIssues`, and
  // put back when the token changes.
  const [, setIssueCount, { getSnapshot: getIssueCount }] =
    createState(ISSUES_LIMIT);

  const writeReport = (
    report: ReportParts,
    withIssues: boolean = true,
  ): void => {
    setReadAt(report.readAtEpochMs);

    setSummary(report.summary);

    updateEntries((held) => sameItemsIfEqual(held, report.entries));

    setRoots(report.roots);

    setCycles(report.cycles);

    setMerged(report.merged);

    if (withIssues) {
      setIssues(report.issues);
    }

    setReading(report.reading);
  };

  const currentToken = (): string | undefined =>
    token.getSnapshot().value?.value;

  const read = (): void => {
    const tokenValue = currentToken();

    if (tokenValue === undefined) {
      return;
    }

    const startedAtMs = now();

    const issueCount = getIssueCount();

    // A page with nothing on it yet is drawn as the parts of the first read
    // answer, the merge order first; once it shows a report, a read replaces
    // it whole, so that a poll never puts a placeholder where data was.
    const progressive = getLoadStatus().type !== 'ready';

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
      // time is shown with its parts already in place. Its issues are left
      // out when it was asked for before `loadMoreIssues` added a page: it
      // lists fewer than the page now shows, and would take that page away.
      if (settled.report !== undefined) {
        writeReport(settled.report, issueCount >= getIssueCount());
      }

      setLoadStatus(settled.status);
    };

    const onProgress = progressive
      ? (partial: LoadedReport): void => {
          if (currentToken() !== tokenValue) {
            return;
          }

          const settled = settle(
            getLoadStatus(),
            getReadAt(),
            Result.ok(partial),
            startedAtMs,
          );

          if (settled.report === undefined) {
            return;
          }

          setNowMs(now());

          writeReport(settled.report, issueCount >= getIssueCount());

          setLoadStatus(settled.status);
        }
      : undefined;

    const applyRuns = (result: Result<WorkflowRunList, string>): void => {
      if (currentToken() !== tokenValue || startedAtMs < mut_runsShownFromMs) {
        return;
      }

      if (Result.isOk(result)) {
        mut_runsShownFromMs = startedAtMs;
      }

      updateRuns((held) => settleRuns(held, result));
    };

    loadRuns(tokenValue)
      .then(applyRuns)
      .catch((error: unknown) => {
        applyRuns(Result.err(unknownToString(error)));
      });

    load(tokenValue, startedAtMs, issueCount, onProgress)
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

  const loadMoreIssues = (): void => {
    const tokenValue = currentToken();

    const after = getIssues().endCursor;

    if (
      tokenValue === undefined ||
      after === undefined ||
      getMoreIssues().type === 'loading'
    ) {
      return;
    }

    setMoreIssues(MORE_ISSUES_LOADING);

    const apply = (
      result: Result<IssueList, string>,
      answeredLimit: RateLimit | undefined,
    ): void => {
      if (currentToken() !== tokenValue) {
        return;
      }

      updateRateLimit((last) => answeredLimit ?? last);

      if (Result.isErr(result)) {
        setMoreIssues({ type: 'failed', message: result.value });

        return;
      }

      // Raised only now, so that a read that went out before the page came
      // back is not taken for one that lists it.
      setIssueCount(getIssueCount() + ISSUES_PAGE_SIZE);

      // A read that answered meanwhile has listed these already, from where
      // its own list ended; the page goes only where it was asked for.
      const current = getIssues();

      if (current.endCursor === after) {
        setIssues(appendIssues(current, result.value));
      }

      setMoreIssues(MORE_ISSUES_IDLE);
    };

    loadIssues(tokenValue, after, ISSUES_PAGE_SIZE)
      .then(({ result, rateLimit: answeredLimit }) => {
        apply(result, answeredLimit);
      })
      .catch((error: unknown) => {
        apply(Result.err(unknownToString(error)), undefined);
      });
  };

  const start = (): (() => void) => {
    // The first read, and a read on every change of token, which is how a
    // reader finds out whether GitHub takes the one they pasted. Moving the
    // same token between the tab and the device is not a change.
    const tokenSubscription = token
      .pipe(map((stored) => stored?.value))
      .pipe(skipIfNoChange())
      .subscribe((tokenValue) => {
        setIssueCount(ISSUES_LIMIT);

        setMoreIssues(MORE_ISSUES_IDLE);

        if (tokenValue === undefined) {
          setLoadStatus(LOADING);

          writeReport(EMPTY_PARTS);

          setRuns(RUNS_READING);

          mut_runsShownFromMs = 0;
        } else {
          read();
        }
      });

    const clock = counter(CLOCK_TICK_MS);

    // A hidden tab is a tab nobody is reading, and a forgotten one would
    // otherwise go on spending the budget for the rest of the day. So the
    // poll timer exists only while the tab is shown: made when it is shown,
    // right after the read that showing it asks for, so the next read is one
    // interval after that one rather than wherever an older period had got
    // to; and completed when it is hidden.
    let mut_poll: PollTimer | undefined = undefined;

    const stopPolling = (): void => {
      mut_poll?.stop();

      mut_poll = undefined;
    };

    const startPolling = (): void => {
      stopPolling();

      mut_poll = pollEvery(counter(POLL_INTERVAL_MS), read);
    };

    if (isVisible()) {
      startPolling();
    }

    const visibilitySubscription = visibilityChange.subscribe(() => {
      if (isVisible()) {
        setNowMs(now());

        read();

        startPolling();
      } else {
        stopPolling();
      }
    });

    // Nor is there anyone to read the ages to, and coming back moves the
    // clock at once.
    const clockSubscription = clock
      .pipe(filter(() => isVisible()))
      .subscribe(() => {
        setNowMs(now());
      });

    return () => {
      tokenSubscription.unsubscribe();

      visibilitySubscription.unsubscribe();

      clockSubscription.unsubscribe();

      stopPolling();

      // Completing a counter is what clears its interval.
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
    reading,
    runs,
    moreIssues,
    rateLimit,
    nowMs,
    refresh,
    loadMoreIssues,
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
  | 'reading'
>;

/** What the page shows while there is no report. */
const EMPTY_PARTS: ReportParts = {
  readAtEpochMs: 0,
  summary: {
    open: 0,
    queued: 0,
    draft: 0,
    failing: 0,
    setAside: 0,
    awaitingReview: 0,
  },
  entries: [],
  roots: [],
  cycles: [],
  merged: [],
  issues: {
    items: [],
    totalCount: 0,
    endCursor: undefined,
    referenced: [],
  },
  reading: [],
} as const;

const RUNS_READING: RunsStatus = { type: 'reading' } as const;

/** What a read of the runs makes of the ones held. */
const settleRuns = (
  held: RunsStatus,
  answer: Result<WorkflowRunList, string>,
): RunsStatus =>
  Result.isOk(answer)
    ? ({ type: 'ready', list: answer.value, error: undefined } as const)
    : held.type === 'ready'
      ? ({ ...held, error: answer.value } as const)
      : ({ type: 'failed', message: answer.value } as const);

const MORE_ISSUES_IDLE: MoreIssuesStatus = { type: 'idle' } as const;

const MORE_ISSUES_LOADING: MoreIssuesStatus = { type: 'loading' } as const;

const divergenceScale = (entries: readonly Entry[]): number =>
  Math.max(
    1,
    ...entries.flatMap(({ comparison }) =>
      comparison === undefined ? [] : [comparison.aheadBy, comparison.behindBy],
    ),
  );

type PollTimer = Readonly<{ stop: () => void }>;

/**
 * Reads on every tick of `poll`. Whoever starts the timer has just read, so
 * the first tick comes one interval later.
 */
const pollEvery = (
  poll: SynstateObservable<number>,
  read: () => void,
): PollTimer => {
  const subscription = poll.subscribe(() => {
    read();
  });

  return {
    stop: () => {
      subscription.unsubscribe();

      // Completing a counter is what clears its interval.
      poll.complete();
    },
  };
};
