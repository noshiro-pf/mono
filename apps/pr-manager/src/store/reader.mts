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
  createValueEmitter,
  empty,
  filter,
  map,
  mapTo,
  merge,
  scan,
  skipIfNoChange,
  switchMap,
  withInitialValue,
  type InitializedObservable,
  type Observable as SynstateObservable,
} from 'synstate';
import {
  Arr,
  fastDeepEqual,
  hasKey,
  isRecord,
  replaceEqualDeep,
  Result,
  unknownToString,
} from 'ts-data-forge';
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
  READY,
  settle,
  type LoadStatus,
} from '../load-state.mjs';
import {
  pollIntervalFor,
  type BudgetSample,
  type RateLimit,
} from '../rate-limit.mjs';
import type { ReportCache } from '../report-cache.mjs';
import { ISSUES_LIMIT, ISSUES_PAGE_SIZE } from '../report-query.mjs';
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
  /**
   * The last whole report, kept on the device so that a tab opened later
   * has something to show before its first read answers — which is the
   * slowest moment of the page, every part of the report being asked for at
   * once. Kept only beside a token kept on the device: a reader who keeps
   * their token in the tab alone has asked for nothing read with it to
   * outlast the tab.
   */
  cache: ReportCache;
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
  queue: InitializedObservable<LoadedReport['queue']>;
  /**
   * What the repository has of what this one runs. Both, until a read says
   * otherwise: it is read with the pull requests, before anything is drawn.
   */
  features: InitializedObservable<LoadedReport['features']>;
  issues: InitializedObservable<LoadedReport['issues']>;
  /** The sections below the merge order that have not answered yet. */
  reading: InitializedObservable<readonly SectionPart[]>;
  /**
   * Whether a read of the report is out: the first, a poll or a Refresh.
   * What is on screen may be minutes old — kept from the last visit, or the
   * last poll before the tab was hidden — and this is what says a newer one
   * is on its way.
   */
  fetching: InitializedObservable<boolean>;
  /** The workflow runs still going, as the last read of them left them. */
  runs: InitializedObservable<RunsStatus>;
  /** How the last {@link loadMoreIssues} went. */
  moreIssues: InitializedObservable<MoreIssuesStatus>;
  /** What GitHub last said was left of the budget. */
  rateLimit: InitializedObservable<RateLimit | undefined>;
  /**
   * How long the page waits between two reads: {@link POLL_INTERVAL_MS}, or
   * longer where a read costs more than half the budget can pay for at that
   * pace (`pollIntervalFor` in `rate-limit.mts`).
   */
  pollIntervalMs: InitializedObservable<number>;
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
    cache,
  } = deps;

  // While `start` has been called and its stop has not. What only goes on
  // while reading is derived from it, so that stopping disposes it.
  const [started, setStarted] = createState(false);

  // The token on every change of it while started, and once more on each
  // start. Moving the same token between the tab and the device is not a
  // change.
  const tokenChanged = started.pipe(
    switchMap((isStarted) =>
      isStarted
        ? token.pipe(map((stored) => stored?.value))
        : empty<string | undefined>(),
    ),
  );

  const tokenForgotten = tokenChanged.pipe(
    filter((tokenValue) => tokenValue === undefined),
  );

  // Each state below is passed on only when what it is given differs from
  // what it holds. `equals` decides that where the state is held, once, so
  // nothing downstream has anything to compare. The ones a change of token
  // puts back are put back by the graph rather than by a subscriber of the
  // token, which would be a write while that change is still propagating.
  const {
    state: loadStatus,
    set: setLoadStatus,
    update: updateLoadStatus,
    getSnapshot: getLoadStatus,
  } = createResettableState<LoadStatus>(LOADING, fastDeepEqual, [
    tokenForgotten.pipe(mapTo(LOADING)),
  ]);

  const [rateLimit, , { updateState: updateRateLimit }] = createState<
    RateLimit | undefined
  >(undefined, { equals: fastDeepEqual });

  const [
    pollIntervalMs,
    setPollIntervalMs,
    { getSnapshot: getPollIntervalMs },
  ] = createState(POLL_INTERVAL_MS);

  // The budget after the last read that said what it was, which the next is
  // measured against.
  let mut_lastBudget: BudgetSample | undefined = undefined;

  const measureBudget = (answeredLimit: RateLimit | undefined): void => {
    if (answeredLimit === undefined) {
      return;
    }

    const sample: BudgetSample = {
      rateLimit: answeredLimit,
      atMs: now(),
    } as const;

    setPollIntervalMs(
      pollIntervalFor({
        intervalMs: getPollIntervalMs(),
        previous: mut_lastBudget,
        current: sample,
      }),
    );

    mut_lastBudget = sample;
  };

  const [nowMsRead, setNowMs] = createValueEmitter<number>();

  // A hidden tab has nobody to read the ages to, and coming back moves the
  // clock at once.
  const nowMsTicked = started
    .pipe(
      switchMap((isStarted) =>
        isStarted
          ? merge([counter(CLOCK_TICK_MS), visibilityChange])
          : empty<unknown>(),
      ),
    )
    .pipe(filter(() => isVisible()))
    .pipe(map(() => now()));

  const nowMs = merge([nowMsRead, nowMsTicked]).pipe(withInitialValue(0));

  // The report is held whole, and each part the page draws is taken from it.
  // `writeReport` keeps every part an answer did not change as the object
  // already held, so a part is compared by reference alone, and a card whose
  // pull request did not change is handed the object it already has.
  const {
    state: report,
    update: updateReport,
    getSnapshot: getReport,
  } = createResettableState<ReportParts>(EMPTY_PARTS, Object.is, [
    tokenForgotten.pipe(mapTo(EMPTY_PARTS)),
  ]);

  const partOf = <K extends keyof ReportParts>(
    key: K,
  ): InitializedObservable<ReportParts[K]> =>
    report.pipe(map((held) => held[key]));

  const readAt = partOf('readAtEpochMs');

  const summary = partOf('summary');

  const entries = partOf('entries');

  const roots = partOf('roots');

  const cycles = partOf('cycles');

  const merged = partOf('merged');

  const queue = partOf('queue');

  const features = partOf('features');

  const issues = partOf('issues');

  const reading = partOf('reading');

  const { state: runs, update: updateRuns } = createResettableState<RunsStatus>(
    RUNS_READING,
    fastDeepEqual,
    [tokenForgotten.pipe(mapTo(RUNS_READING))],
  );

  // When the read of the runs on screen started; `0` while none is.
  let mut_runsShownFromMs = 0;

  const {
    state: moreIssues,
    set: setMoreIssues,
    getSnapshot: getMoreIssues,
  } = createResettableState<MoreIssuesStatus>(MORE_ISSUES_IDLE, fastDeepEqual, [
    tokenChanged.pipe(mapTo(MORE_ISSUES_IDLE)),
  ]);

  // How many open issues each read lists. Raised by `loadMoreIssues`, and
  // put back when the token changes. Nothing draws it, so it is a variable
  // rather than a state.
  let mut_issueCount = ISSUES_LIMIT;

  // How many reads of the report are out.
  const [outstanding, , { updateState: updateOutstanding }] = createState(0);

  const fetching = outstanding
    .pipe(map((count) => count > 0))
    .pipe(skipIfNoChange());

  // Whether the report on screen is the one kept from the last visit, which
  // the parts of the first read must not take apart: they would put a
  // placeholder where the kept report has data. A whole read replaces it.
  let mut_showingKept = false;

  // The kept report is asked for once, by the first read: after that the
  // page has a report of its own, newer than any kept one.
  let mut_keptAsked = false;

  const getReadAt = (): number => getReport().readAtEpochMs;

  const getIssues = (): ReportParts['issues'] => getReport().issues;

  const writeReport = (next: ReportParts, withIssues: boolean): void => {
    updateReport((held) =>
      replaceEqualDeep(
        held,
        { ...next, issues: withIssues ? next.issues : held.issues },
        { key: pullRequestNumber },
      ),
    );
  };

  const currentToken = (): string | undefined =>
    token.getSnapshot().value?.value;

  const onDevice = (): boolean => token.getSnapshot().value?.store === 'device';

  /** Shows the report kept from the last visit, if nothing is shown yet. */
  const showKept = (tokenValue: string): void => {
    cache
      .load(tokenValue)
      .then((kept) => {
        if (
          kept === undefined ||
          !onDevice() ||
          currentToken() !== tokenValue ||
          getLoadStatus().type !== 'loading'
        ) {
          return;
        }

        setNowMs(now());

        writeReport(kept, true);

        mut_showingKept = true;

        setLoadStatus(READY);
      })
      .catch(() => undefined);
  };

  // The newest whole report, and when one was last kept. A whole report
  // comes every poll, and keeping it is a structured clone and a write of the
  // whole of it; the next visit needs only a recent one. So it is kept at
  // most every {@link KEEP_EVERY_MS}, and when the tab is hidden. Closing a
  // tab hides it first, but the write may not finish before the page goes,
  // so the report a later visit shows can be up to that interval older than
  // the last one this tab read.
  let mut_newestWhole: LoadedReport | undefined = undefined;

  let mut_keptAtMs: number | undefined = undefined;

  const keepNewest = (): void => {
    const tokenValue = currentToken();

    if (
      mut_newestWhole === undefined ||
      tokenValue === undefined ||
      !onDevice()
    ) {
      return;
    }

    cache.save(mut_newestWhole, tokenValue);

    mut_newestWhole = undefined;

    mut_keptAtMs = now();
  };

  /** Keeps a whole report for the next visit, where the token is kept too. */
  const keep = (whole: LoadedReport): void => {
    mut_newestWhole = whole;

    if (mut_keptAtMs === undefined || now() - mut_keptAtMs >= KEEP_EVERY_MS) {
      keepNewest();
    }
  };

  const read = (): void => {
    const tokenValue = currentToken();

    if (tokenValue === undefined) {
      return;
    }

    const startedAtMs = now();

    const issueCount = mut_issueCount;

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

      measureBudget(answeredLimit);

      // The report kept from the last visit is not this page's own read:
      // the first read is settled as if nothing were shown. Its failure is
      // the page's failure, said as loudly as it would be with nothing kept —
      // a token that has expired since is otherwise a page quietly showing a
      // report days old — and a kept report read by a clock that has since
      // been put back cannot outrank the read that replaces it.
      const showingKept = mut_showingKept;

      const settled = settle(
        showingKept ? LOADING : getLoadStatus(),
        getReadAt(),
        result,
        startedAtMs,
      );

      // Settled as a first read, it either failed or brought a report:
      // either way the kept one is no longer what the page shows.
      mut_showingKept = false;

      // The report before the status, so that a page shown for the first
      // time is shown with its parts already in place. Its issues are left
      // out when it was asked for before `loadMoreIssues` added a page: it
      // lists fewer than the page now shows, and would take that page away.
      if (settled.report !== undefined) {
        // Over the kept report, its issues go too, even where a page was
        // listed after them meanwhile: that page was read on from an old
        // list. The count it raised stays, so the next read lists as many.
        writeReport(
          settled.report,
          showingKept || issueCount >= mut_issueCount,
        );

        keep(settled.report);
      }

      setLoadStatus(settled.status);
    };

    const onProgress = progressive
      ? (partial: LoadedReport): void => {
          if (mut_showingKept || currentToken() !== tokenValue) {
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

          writeReport(settled.report, issueCount >= mut_issueCount);

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

    if (!mut_keptAsked && progressive && onDevice()) {
      showKept(tokenValue);
    }

    mut_keptAsked = true;

    updateOutstanding((count) => count + 1);

    // Called by an async function, so that a `load` that throws rather than
    // rejects still settles it, and the count still goes down.
    const loading = async (): Promise<Answered<LoadedReport>> =>
      load(tokenValue, startedAtMs, issueCount, onProgress);

    loading()
      .then(({ result, rateLimit: answeredLimit }) => {
        apply(result, answeredLimit);
      })
      .catch((error: unknown) => {
        apply(Result.err(unknownToString(error)), undefined);
      })
      .finally(() => {
        updateOutstanding((count) => count - 1);
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
      mut_issueCount += ISSUES_PAGE_SIZE;

      // A read that answered meanwhile has listed these already, from where
      // its own list ended; the page goes only where it was asked for.
      const current = getIssues();

      if (current.endCursor === after) {
        updateReport((held) => ({
          ...held,
          issues: appendIssues(current, result.value),
        }));
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
    // Nothing read with a token is kept past a tab the reader keeps it in
    // alone, or past forgetting it. Moving a token from the device to the
    // tab is not a change of token, so this follows where it is kept rather
    // than {@link tokenChanged}. Cleared on the first value too, when it is
    // not a device token: one kept earlier may have left a report behind. A
    // token replaced by another is the cache's to tell apart
    // (`report-cache.mts`), since another tab may still be reading with it.
    const keptSubscription = token.subscribe((stored) => {
      if (stored?.store === 'device') {
        return;
      }

      mut_newestWhole = undefined;

      cache.clear();
    });

    // The first read, and a read on every change of token, which is how a
    // reader finds out whether GitHub takes the one they pasted.
    const tokenSubscription = tokenChanged.subscribe((tokenValue) => {
      mut_issueCount = ISSUES_LIMIT;

      if (tokenValue === undefined) {
        mut_runsShownFromMs = 0;

        mut_showingKept = false;
      } else {
        read();
      }
    });

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

      const everyMs = getPollIntervalMs();

      mut_poll = { ...pollEvery(counter(everyMs), read), everyMs };
    };

    if (isVisible()) {
      startPolling();
    }

    // A read that finds a read costing more, or less, sets the timer going
    // again at the new interval, from that read.
    const intervalSubscription = pollIntervalMs.subscribe((everyMs) => {
      if (mut_poll !== undefined && mut_poll.everyMs !== everyMs) {
        startPolling();
      }
    });

    const visibilitySubscription = visibilityChange.subscribe(() => {
      if (isVisible()) {
        read();

        startPolling();
      } else {
        stopPolling();

        keepNewest();
      }
    });

    setStarted(true);

    return () => {
      tokenSubscription.unsubscribe();

      keptSubscription.unsubscribe();

      visibilitySubscription.unsubscribe();

      intervalSubscription.unsubscribe();

      stopPolling();

      // Switching away disposes the clock, and completing a counter is what
      // clears its interval.
      setStarted(false);
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
    queue,
    features,
    issues,
    reading,
    fetching,
    runs,
    moreIssues,
    rateLimit,
    pollIntervalMs,
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
  | 'queue'
  | 'features'
  | 'issues'
  | 'reading'
>;

/**
 * What an item of the report's arrays is matched by when an answer is
 * written over the report held: its number, when it is a pull request or an
 * issue. A pull request opening or merging moves every one after it, and one
 * that only moved has not changed.
 */
const pullRequestNumber = (item: unknown): unknown =>
  isRecord(item) && hasKey(item, 'number') ? item.number : undefined;

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
    pending: 0,
  },
  entries: [],
  roots: [],
  cycles: [],
  merged: [],
  queue: undefined,
  features: { requiredChecks: true, codeOwnerReview: true, queue: true },
  issues: {
    items: [],
    totalCount: 0,
    endCursor: undefined,
    referenced: [],
  },
  reading: [],
} as const;

/** How often at most a whole report is kept for the next visit. */
const KEEP_EVERY_MS = 60_000;

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
    ...Arr.generate(function* () {
      for (const { comparison } of entries) {
        if (comparison === undefined) {
          continue;
        }

        yield comparison.aheadBy;

        yield comparison.behindBy;
      }
    }),
  );

type PollTimer = Readonly<{ stop: () => void; everyMs?: number }>;

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

type ResettableState<S> = Readonly<{
  state: InitializedObservable<S>;
  set: (next: S) => void;
  update: (updater: (held: S) => S) => void;
  getSnapshot: () => S;
}>;

/**
 * A state that is written by `set` and `update`, and that each of `resets`
 * puts back to what it emits, within the propagation that emitted it.
 */
const createResettableState = <S,>(
  initialState: S,
  equals: (x: S, y: S) => boolean,
  resets: readonly SynstateObservable<S>[],
): ResettableState<S> => {
  const [updated, update] = createValueEmitter<(held: S) => S>();

  const state = merge(
    Arr.toUnshifted(updated)(
      resets.map((reset) => reset.pipe(map((next) => (): S => next))),
    ),
  )
    .pipe(
      scan((held: S, updater: (prev: S) => S) => updater(held), initialState),
    )
    .pipe(skipIfNoChange(equals));

  return {
    state,
    set: (next) => {
      update(() => next);
    },
    update,
    getSnapshot: () => state.getSnapshot().value,
  };
};
