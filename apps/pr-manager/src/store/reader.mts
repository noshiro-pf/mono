/**
 * What the page has read, and the timers that keep it current.
 *
 * The state lives here rather than in the component that draws it, so that when
 * to read — on a token, on a timer, on a tab coming back, on Refresh — is one
 * place that a test can drive. Everything that touches the browser comes in
 * through {@link ReaderDeps}; `store.mts` passes the real ones.
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
  Obj,
  replaceEqualDeep,
  Result,
  unknownToString,
} from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { CLOCK_TICK_MS, POLL_INTERVAL_MS } from '../constants.mjs';
import type { Answered } from '../graphql.mjs';
import {
  appendIssues,
  PARTS_OF_GROUP,
  type Entry,
  type HeldParts,
  type IssueList,
  type KnownParts,
  type LoadedReport,
  type PageSummary,
  type PartFailures,
  type ReadGroup,
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
import { ISSUES_LIMIT, ISSUES_PAGE_SIZE } from '../report-query.mjs';
import type { StoredToken } from '../token.mjs';
import type { WorkflowRunList } from '../workflow-runs.mjs';

export type ReaderDeps = Readonly<{
  token: InitializedObservable<StoredToken | undefined>;
  /** A read of some groups of the report (`loadReport`). */
  load: (request: GroupRead) => Promise<Answered<LoadedReport>>;
  /**
   * The workflow runs still going (`workflow-runs.mts`), read beside the report
   * on every read rather than as a part of it: a different API, with its own
   * budget, whose failure is no reason to say the report failed.
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

/** What the reader asks `load` for. */
export type GroupRead = Readonly<{
  token: string;
  nowMs: number;
  groups: readonly ReadGroup[];
  /** How many open issues to list, where the issues are read. */
  issueCount: number;
  /** What the page had when the read was sent, for a part it cannot read. */
  previous: KnownParts;
  /** What the page holds now, for the groups it does not read. */
  held: () => HeldParts;
  /**
   * Handed the report as it stands each time a part answers before the last;
   * only for a read of a page with nothing on it yet.
   */
  onProgress: ((report: LoadedReport) => void) | undefined;
}>;

/**
 * What a pane reads on its own: a group of the report, or the workflow runs.
 * The merge order and the queue are both drawn from `pulls`.
 */
export type PaneRead = ReadGroup | 'runs';

export type Reader = Readonly<{
  /** How the reading went, which changes only when that does. */
  loadStatus: InitializedObservable<LoadStatus>;
  /**
   * The report, in the parts the page draws, each its own state and passed on
   * only when a read changed it (`equals`): a poll that found nothing new
   * writes {@link readAt} and nothing else, and a part a read left alone keeps
   * the object it had. The pull requests are kept one by one — each is its own
   * card — and a part is empty while there is no report.
   */
  readAt: InitializedObservable<number>;
  summary: InitializedObservable<PageSummary>;
  entries: InitializedObservable<readonly Entry[]>;
  /** The entries by number, for the merge order to look them up. */
  byNumber: InitializedObservable<ReadonlyMap<number, Entry>>;
  /**
   * One scale for every divergence bar on the page, so that a bar on one card
   * can be compared with a bar on another. Per-card, `-2` and `-39` would be
   * drawn the same length, which is the one thing the bars are for.
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
   * The parts the last read shown could not read, each said in the panel that
   * draws it rather than over the whole page.
   */
  failed: InitializedObservable<PartFailures>;
  /**
   * Whether a read of the report is out: the first, a poll or a Refresh.
   * What is on screen may be minutes old — the last poll before the tab was
   * hidden — and this is what says a newer one is on its way.
   */
  fetching: InitializedObservable<boolean>;
  /**
   * What is being read, pane by pane. A pane's Refresh is shut while its own
   * read is out: one more would pay for the same answer twice.
   */
  paneReading: InitializedObservable<ReadonlySet<PaneRead>>;
  /** The workflow runs still going, as the last read of them left them. */
  runs: InitializedObservable<RunsStatus>;
  /** How the last {@link loadMoreIssues} went. */
  moreIssues: InitializedObservable<MoreIssuesStatus>;
  /** What GitHub last said was left of the budget. */
  rateLimit: InitializedObservable<RateLimit | undefined>;
  /**
   * How long the page waits between two reads: {@link POLL_INTERVAL_MS}, or
   * longer where a read costs more than a quarter of the budget can pay for at
   * that pace (`pollIntervalFor` in `rate-limit.mts`).
   */
  pollIntervalMs: InitializedObservable<number>;
  /**
   * The instant every "3 minutes ago" on the page is measured against.
   *
   * Its own state, ticking on its own timer, rather than fixed at the moment of
   * the read: a hidden tab stops reading, and a page that said "read just now"
   * for as long as it stayed open would be claiming a freshness it does not
   * have.
   */
  nowMs: InitializedObservable<number>;
  /**
   * Reads at once. There is nothing to hold it back for: a read costs the same
   * whether the timer or the reader asks for it, and a reader who presses it
   * wants now. The button is shut only while a read it started is still out, so
   * a double click is one read.
   *
   * Every pane is asked for at once, and the first read draws each as it
   * answers, the merge order as soon as the pull requests have. A pane already
   * being read is not asked for again: the read out brings it.
   */
  refresh: () => void;
  /**
   * Reads what one pane is drawn from, and nothing else, unless it is being
   * read already. Nothing until the page has shown a report.
   */
  refreshPane: (pane: PaneRead) => void;
  /**
   * Lists the next {@link ISSUES_PAGE_SIZE} open issues, and every read after
   * it lists them too, until the token changes. The page is read on its own
   * rather than by a read of the whole report, which would take as long as
   * Refresh does.
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

  // While `start` has been called and its stop has not. What only goes on while
  // reading is derived from it, so that stopping disposes it.
  const [started, setStarted] = createState(false);

  // The token on every change of it while started, and once more on each start.
  // Moving the same token between the tab and the device is not a change.
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

  // Each state below is passed on only when what it is given differs from what
  // it holds. `equals` decides that where the state is held, once, so nothing
  // downstream has anything to compare. The ones a change of token puts back
  // are put back by the graph rather than by a subscriber of the token, which
  // would be a write while that change is still propagating.
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

  const failed = partOf('failed');

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

  // What the page holds of each part, and which failed on the read that last
  // asked for it, which the next read keeps of a part it cannot read. Put back
  // when the token changes: another token's report is not one to fall back to.
  let mut_held: Readonly<{ known: KnownParts; failed: PartFailures }> =
    NOTHING_KNOWN;

  // How many open issues each read lists. Raised by `loadMoreIssues`, and put
  // back when the token changes. Nothing draws it, so it is a variable rather
  // than a state.
  let mut_issueCount = ISSUES_LIMIT;

  // What is being read, pane by pane, each by the read it was claimed for: a
  // read that answers for a token since replaced, whose claim was put back with
  // the token, releases nothing of the next token's.
  let mut_claims: ReadonlyMap<PaneRead, Claim> = new Map<PaneRead, Claim>();

  const [paneReading, setPaneReading] = createState<ReadonlySet<PaneRead>>(
    new Set<PaneRead>(),
    { equals: sameMembers },
  );

  const publishClaims = (): void => {
    setPaneReading(new Set(mut_claims.keys()));
  };

  /** A claim on `pane`, or `undefined` where a read of it is out already. */
  const claim = (pane: PaneRead): Claim | undefined => {
    if (mut_claims.has(pane)) {
      return undefined;
    }

    const claimed: Claim = { pane } as const;

    const mut_more = new Map<PaneRead, Claim>(mut_claims);

    mut_more.set(pane, claimed);

    mut_claims = mut_more;

    publishClaims();

    return claimed;
  };

  const release = (claimed: Claim): void => {
    if (mut_claims.get(claimed.pane) !== claimed) {
      return;
    }

    const mut_rest = new Map<PaneRead, Claim>(mut_claims);

    mut_rest.delete(claimed.pane);

    mut_claims = mut_rest;

    publishClaims();
  };

  const isClaimed = (claimed: Claim): boolean =>
    mut_claims.get(claimed.pane) === claimed;

  const fetching = paneReading
    .pipe(map((panes) => Array.from(panes).some(isReadGroup)))
    .pipe(skipIfNoChange());

  const getIssues = (): ReportParts['issues'] => getReport().issues;

  /**
   * Writes a report a read of `groups` answered with. Of the issues, only where
   * it asked for them; of the time of reading, only where it read the pull
   * requests, which is what the page says it was read at: a section read on its
   * own leaves the merge order as old as it was.
   */
  const writeReport = (
    next: LoadedReport,
    groups: readonly ReadGroup[],
  ): void => {
    updateReport((held) =>
      replaceEqualDeep(
        held,
        {
          readAtEpochMs: groups.includes('pulls')
            ? next.readAtEpochMs
            : held.readAtEpochMs,
          summary: next.summary,
          entries: next.entries,
          roots: next.roots,
          cycles: next.cycles,
          merged: next.merged,
          queue: next.queue,
          features: next.features,
          issues: groups.includes('issues') ? next.issues : held.issues,
          reading: next.reading,
          failed: next.failed,
        },
        { key: pullRequestNumber },
      ),
    );
  };

  /** Keeps what a read of `groups` answered of them. */
  const hold = (next: LoadedReport, groups: readonly ReadGroup[]): void => {
    const keys = groups.flatMap((group) => PARTS_OF_GROUP[group]);

    mut_held = {
      known: {
        ...Obj.omit(mut_held.known, keys),
        ...Obj.pick(next.parts, keys),
      },
      failed: {
        ...Obj.omit(mut_held.failed, keys),
        ...Obj.pick(next.failed, keys),
      },
    };
  };

  const heldNow = (): HeldParts =>
    ({
      ...mut_held,
      reading: new Set<ReadGroup>(
        Array.from(mut_claims.keys()).filter(isReadGroup),
      ),
    }) as const;

  const currentToken = (): string | undefined =>
    token.getSnapshot().value?.value;

  // When the last read of the page was sent, for a tab shown again to tell
  // whether the next is due yet.
  let mut_lastReadAtMs: number | undefined = undefined;

  /** What a read that could not be read at all makes of the status. */
  const failStatus = (message: string): void => {
    updateLoadStatus((current) =>
      current.type === 'ready'
        ? { ...current, refreshing: false, pollError: message }
        : { type: 'failed', message },
    );
  };

  /**
   * Reads `groups`, which `claimed` holds, for `tokenValue`: for the page, a
   * poll's or Refresh's — every group no other read has out — or for a pane.
   */
  const readGroups = async (
    tokenValue: string,
    groups: readonly ReadGroup[],
    claimed: readonly Claim[],
    ofPage: boolean,
  ): Promise<void> => {
    const startedAtMs = now();

    const issueCount = mut_issueCount;

    // A page with nothing on it yet is drawn as the parts of the first read
    // answer, the merge order first; once it shows a report, a read replaces it
    // whole, so that a poll never puts a placeholder where data was.
    const progressive =
      groups.includes('pulls') && getLoadStatus().type !== 'ready';

    // An answer whose claims were put back — the token forgotten or replaced,
    // even by the same one pasted again — is dropped: a newer read holds them,
    // or the reader asked for the page to be taken away.
    const isCurrent = (): boolean =>
      currentToken() === tokenValue && claimed.every(isClaimed);

    const apply = (
      result: Result<LoadedReport, string>,
      answeredLimit: RateLimit | undefined,
    ): void => {
      if (!isCurrent()) {
        return;
      }

      setNowMs(now());

      updateRateLimit((current) => answeredLimit ?? current);

      // A pane's read, moments after a read of the page, would be taken for a
      // whole read's cost spent in that moment.
      if (ofPage) {
        measureBudget(answeredLimit);
      }

      if (Result.isOk(result)) {
        // Its issues are left out when it was asked for before `loadMoreIssues`
        // added a page: it lists fewer than the page now shows, and would take
        // that page away.
        const taken =
          issueCount >= mut_issueCount
            ? groups
            : groups.filter((group) => group !== 'issues');

        // The report before the status, so that a page shown for the first time
        // is shown with its parts already in place.
        hold(result.value, taken);

        writeReport(result.value, taken);
      }

      if (Result.isErr(result)) {
        // Nothing the read asked for is coming any more, and each part of it
        // says why, beside what is kept of it.
        const failures: PartFailures = Object.fromEntries(
          groups
            .flatMap((group) => PARTS_OF_GROUP[group])
            .map((part) => [
              part,
              {
                message: result.value,
                kept: mut_held.known[part] !== undefined,
              },
            ]),
        );

        updateReport((held) => ({
          ...held,
          reading: held.reading.filter((section) => !groups.includes(section)),
          failed: { ...held.failed, ...failures },
        }));
      }

      // What the page says of its reading is a read of the page's: a pane's
      // answer leaves a Refresh or a failed poll as they were, unless it could
      // not be read at all.
      if (ofPage) {
        // Two reads of a group are never out at once, so none is older than
        // what is shown of it.
        setLoadStatus(settle(getLoadStatus(), 0, result, startedAtMs).status);
      } else if (Result.isErr(result)) {
        failStatus(result.value);
      }
    };

    const onProgress = progressive
      ? (partial: LoadedReport): void => {
          if (!isCurrent()) {
            return;
          }

          setNowMs(now());

          writeReport(partial, groups);

          setLoadStatus(READY);
        }
      : undefined;

    try {
      const { result, rateLimit: answeredLimit } = await load({
        token: tokenValue,
        nowMs: startedAtMs,
        groups,
        issueCount,
        previous: mut_held.known,
        held: heldNow,
        onProgress,
      });

      apply(result, answeredLimit);
    } catch (error: unknown) {
      apply(Result.err(unknownToString(error)), undefined);
    } finally {
      for (const each of claimed) {
        release(each);
      }
    }
  };

  /** Reads the workflow runs, which `claimed` holds. */
  const readRuns = async (
    tokenValue: string,
    claimed: Claim,
  ): Promise<void> => {
    const startedAtMs = now();

    const applyRuns = (result: Result<WorkflowRunList, string>): void => {
      if (currentToken() !== tokenValue || startedAtMs < mut_runsShownFromMs) {
        return;
      }

      if (Result.isOk(result)) {
        mut_runsShownFromMs = startedAtMs;
      }

      updateRuns((held) => settleRuns(held, result));
    };

    try {
      applyRuns(await loadRuns(tokenValue));
    } catch (error: unknown) {
      applyRuns(Result.err(unknownToString(error)));
    } finally {
      release(claimed);
    }
  };

  /**
   * Reads each of `panes` that is not being read already, all at once: the
   * report's groups in one read, and the workflow runs beside it. Answers what
   * it asked for.
   */
  const readPanes = (
    panes: readonly PaneRead[],
    ofPage: boolean,
  ): readonly PaneRead[] => {
    const tokenValue = currentToken();

    if (tokenValue === undefined) {
      return [];
    }

    const claimed = Arr.generate(function* () {
      for (const pane of panes) {
        const each = claim(pane);

        if (each !== undefined) {
          yield each;
        }
      }
    });

    const groupClaims = claimed.filter(
      (each): each is Claim & Readonly<{ pane: ReadGroup }> =>
        isReadGroup(each.pane),
    );

    if (Arr.isNonEmpty(groupClaims)) {
      readGroups(
        tokenValue,
        groupClaims.map(({ pane }) => pane),
        groupClaims,
        ofPage,
      ).catch(() => undefined);
    }

    const runsClaim = claimed.find(({ pane }) => pane === 'runs');

    if (runsClaim !== undefined) {
      readRuns(tokenValue, runsClaim).catch(() => undefined);
    }

    return claimed.map(({ pane }) => pane);
  };

  /** Reads the page, and answers whether it asked for any of the report. */
  const read = (): boolean => {
    const asked = readPanes(ALL_PANES, true);

    // Not a read when every pane is being read already: the one out is.
    if (Arr.isNonEmpty(asked)) {
      mut_lastReadAtMs = now();
    }

    return asked.some(isReadGroup);
  };

  const refresh = (): void => {
    updateLoadStatus(asRefreshing);

    // Every group being read already, by a pane: no read of the page is out to
    // settle it.
    if (!read()) {
      updateLoadStatus(settledRefresh);
    }
  };

  const refreshPane = (pane: PaneRead): void => {
    // The runs are read apart from the report, and are there to read again
    // whatever became of it.
    if (pane === 'runs' || getLoadStatus().type === 'ready') {
      readPanes([pane], false);
    }
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

      // Raised only now, so that a read that went out before the page came back
      // is not taken for one that lists it.
      mut_issueCount += ISSUES_PAGE_SIZE;

      // A read that answered meanwhile has listed these already, from where its
      // own list ended; the page goes only where it was asked for.
      const current = getIssues();

      if (current.endCursor === after) {
        const appended = appendIssues(current, result.value);

        updateReport((held) => ({ ...held, issues: appended }));

        // So that a read whose issues fail keeps the page too.
        mut_held = {
          ...mut_held,
          known: { ...mut_held.known, issues: appended },
        };
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
    // reader finds out whether GitHub takes the one they pasted.
    const tokenSubscription = tokenChanged.subscribe((tokenValue) => {
      mut_issueCount = ISSUES_LIMIT;

      mut_held = NOTHING_KNOWN;

      // A read still out for the last token answers to nothing, and holds
      // nothing back from this one.
      mut_claims = new Map<PaneRead, Claim>();

      publishClaims();

      if (tokenValue === undefined) {
        mut_runsShownFromMs = 0;
      } else {
        read();
      }
    });

    // A hidden tab is a tab nobody is reading, and a forgotten one would
    // otherwise go on spending the budget for the rest of the day. So the poll
    // timer exists only while the tab is shown, and is completed when it is
    // hidden. Shown, it reads once the next read is due: at once when an
    // interval has passed since the last, and otherwise when the rest of it has
    // — every read costs the whole report's points, and a tab is shown again
    // every time its reader comes back from a link to GitHub. Each read after
    // that is one interval after the one before, rather than wherever an older
    // period had got to.
    let mut_poll: PollTimer | undefined = undefined;

    const stopPolling = (): void => {
      mut_poll?.stop();

      mut_poll = undefined;
    };

    /** Polls every interval from now. */
    const startPolling = (): void => {
      stopPolling();

      const everyMs = getPollIntervalMs();

      mut_poll = { ...pollEvery(counter(everyMs), read), everyMs };
    };

    const readAndPoll = (): void => {
      read();

      startPolling();
    };

    // How long until the next read is due, from the one sent last; none when
    // there was none. A read that failed waits too: a failure can repeat on
    // every read and cost points each time, and Refresh is there for a reader
    // who wants to try again now.
    const dueInMs = (): number => {
      if (mut_lastReadAtMs === undefined) {
        return 0;
      }

      const everyMs = getPollIntervalMs();

      // At most an interval, for a clock that has been put back.
      return Math.min(everyMs, everyMs - (now() - mut_lastReadAtMs));
    };

    /**
     * Reads once the next read is due, and polls every interval from that read:
     * at once if it is due now, and otherwise on a timer of its own for the
     * rest of the interval.
     */
    const pollFromLastRead = (): void => {
      const remainingMs = dueInMs();

      if (remainingMs > 0) {
        stopPolling();

        mut_poll = {
          ...pollEvery(counter(remainingMs), readAndPoll),
          everyMs: getPollIntervalMs(),
        };
      } else {
        readAndPoll();
      }
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
        pollFromLastRead();
      } else {
        stopPolling();
      }
    });

    setStarted(true);

    return () => {
      tokenSubscription.unsubscribe();

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
    failed,
    fetching,
    paneReading,
    runs,
    moreIssues,
    rateLimit,
    pollIntervalMs,
    nowMs,
    refresh,
    refreshPane,
    loadMoreIssues,
    start,
  };
};

/** A read's hold on a pane, which only it can release. */
type Claim = Readonly<{ pane: PaneRead }>;

/** What a read of the page reads, all at once. */
const ALL_PANES = [
  'pulls',
  'merged',
  'issues',
  'runs',
] as const satisfies readonly PaneRead[];

const NOTHING_KNOWN = { known: {}, failed: {} } as const;

const isReadGroup = (pane: PaneRead): pane is ReadGroup => pane !== 'runs';

/** A Refresh with nothing of its own to wait for. */
const settledRefresh = (current: LoadStatus): LoadStatus =>
  current.type === 'ready'
    ? ({ ...current, refreshing: false } as const)
    : current;

const sameMembers = <T,>(a: ReadonlySet<T>, b: ReadonlySet<T>): boolean =>
  a.size === b.size && a.isSubsetOf(b);

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
  | 'failed'
>;

/**
 * What an item of the report's arrays is matched by when an answer is written
 * over the report held: its number, when it is a pull request or an issue. A
 * pull request opening or merging moves every one after it, and one that only
 * moved has not changed.
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
  failed: {},
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

/** Reads on every tick of `poll`. */
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
 * A state that is written by `set` and `update`, and that each of `resets` puts
 * back to what it emits, within the propagation that emitted it.
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
