import {
  branchTipsNotRead,
  decideQueue,
  readContextOf,
  readSnapshotGraphql,
  type QueueDecision,
  type Read,
  type ReadError,
  type Snapshot,
} from 'pr-report-core-v2';
import {
  createReducer,
  createState,
  type InitializedObservable,
} from 'synstate';
import { Arr, hasKey, isRecord, Result } from 'ts-data-forge';
import { defineMachine } from 'ts-fsm-forge';
import type { RelaxedExtract } from 'ts-type-forge';
import {
  delayOnShow,
  failuresOf,
  keptSnapshot,
  nextPollIntervalOver,
  POLL,
  type BudgetSample,
  type RateLimit,
  type Repo,
  type SnapshotFailures,
} from '../domain/index.mjs';
import {
  browserTransport,
  readLayerWorkflows,
  readRunningWorkflows,
  type RunningWorkflows,
  type StoredToken,
} from '../github/index.mjs';
import type { Timers } from './timers.mjs';

/** What one read brought, each part kept through failures (spec §4.1). */
export type PageReport = Readonly<{
  snapshot: Snapshot;
  decision: Read<QueueDecision>;
  /**
   * The decision the issues block reads: `decision`, or, while the pull
   * requests have never been read, one made as if there were none, so that the
   * issues read are still drawn (their PR links and claims then unknown, which
   * `failures.issues` says).
   */
  issueDecision: Read<QueueDecision>;
  /** What failed in the latest read, kept answers notwithstanding. */
  failures: SnapshotFailures;
  /**
   * The workflows the worker dispatches on each queue layer (spec §8): the last
   * read of them, none until one is read. With none, a box checked ahead says
   * only that it is.
   */
  layerWorkflows: readonly string[];
  /** When the read this report is from began. */
  readAtMs: number;
}>;

/**
 * The running workflows as read, apart from the report: a part with its own
 * budget and its own failure (spec §9), drawn whether the snapshot was read or
 * not. A failed read keeps the last runs and says why.
 */
export type RunsReport = Readonly<{
  runs: Read<RunningWorkflows>;
  /** Why the runs failed in the latest read, if they did. */
  failure: ReadError | undefined;
}>;

export type ReportStatus = Readonly<
  | { kind: 'no-token' }
  | {
      /** A token, and no read out yet: the tab was hidden when it came. */
      kind: 'waiting';
    }
  | { kind: 'first-read' }
  | {
      /**
       * Every read so far brought nothing, so there is no age to give. The
       * reason stays while the next read is out, so the page does not jump.
       */
      kind: 'failed';
      failure: string;
      reading: boolean;
    }
  | {
      kind: 'ready';
      /** When the last read that brought anything began. */
      readAtMs: number;
      reading: boolean;
      /** Why the last read brought nothing, if it did not (spec §4.1). */
      failure: string | undefined;
    }
>;

export type ReportStore = Readonly<{
  report: InitializedObservable<PageReport | undefined>;
  runs: InitializedObservable<RunsReport | undefined>;
  status: InitializedObservable<ReportStatus>;
  /**
   * Whether GitHub refused the token itself (a 401) on the latest read: the
   * token panel opens on it, since no other change on the page will help.
   */
  tokenRefused: InitializedObservable<boolean>;
  /** The GraphQL budget left, and how often the page reads (spec §3). */
  budget: InitializedObservable<
    Readonly<{ rateLimit: RateLimit | undefined; intervalMs: number }>
  >;
  /** Reads now, or as soon as the read that is out ends. */
  refresh: () => void;
  start: () => () => void;
}>;

/**
 * One read: the snapshot, the running workflows and the workflows dispatched on
 * the queue layers, each as read.
 */
export type ReportRead = Readonly<{
  snapshot: Read<Snapshot>;
  runs: Read<RunningWorkflows>;
  layerWorkflows: Read<readonly string[]>;
}>;

export type ReadReport = (
  token: string,
  nowMs: number,
  onBudget: (resource: string, limit: RateLimit) => void,
) => Promise<ReportRead>;

export type ReportDeps = Readonly<{
  token: InitializedObservable<StoredToken | undefined>;
  timers: Timers;
  isVisible: () => boolean;
  watchVisibility: (onChange: () => void) => () => void;
  read: ReadReport;
}>;

/**
 * What the page has read and when it reads again (spec §4).
 *
 * - One read is out at a time. Refresh asked during one reads again as soon as
 *   it ends.
 * - A token changed or cleared empties the page at once; whatever a read asked
 *   before then brings is dropped.
 * - A part that fails keeps its last answer ({@link keptSnapshot}); a read
 *   that brings nothing (a refused token, no network) keeps the whole report
 *   and says why.
 * - After each read the next is set one interval later, paced by the budgets
 *   the read spent from (`domain/poll`); a hidden tab has no timer, and a tab
 *   shown again reads once the rest of the interval has passed.
 */
export const createReportStore = (deps: ReportDeps): ReportStore => {
  const [report, setReport, { getSnapshot: getReport }] = createState<
    PageReport | undefined
  >(undefined);

  const [runs, setRuns, { getSnapshot: getRuns }] = createState<
    RunsReport | undefined
  >(undefined);

  const [status, dispatchStatus, { getSnapshot: getStatus }] = createReducer(
    statusMachine.reducer,
    noToken,
  );

  const [tokenRefused, setTokenRefused] = createState(false);

  const [budget, setBudget, { getSnapshot: getBudget }] = createState<
    Readonly<{ rateLimit: RateLimit | undefined; intervalMs: number }>
  >({ rateLimit: undefined, intervalMs: POLL.minMs });

  let mut_token: string | undefined = undefined;

  /** Rises with every token, so that a read asked with an older one is dropped. */
  let mut_generation = 0;

  let mut_again = false;

  let mut_started = false;

  let mut_cancelTimer: (() => void) | undefined = undefined;

  let mut_lastReadAtMs: number | undefined = undefined;

  /** The budgets as the read before last left them, by resource. */
  let mut_samples = new Map<string, BudgetSample>();

  const cancelTimer = (): void => {
    mut_cancelTimer?.();

    mut_cancelTimer = undefined;
  };

  const scheduleNext = (delayMs: number): void => {
    cancelTimer();

    if (mut_started && mut_token !== undefined && deps.isVisible()) {
      mut_cancelTimer = deps.timers.setTimer(delayMs, readNow);
    }
  };

  const finish = (
    read: ReportRead,
    startedAtMs: number,
    budgets: ReadonlyMap<string, RateLimit>,
  ): void => {
    const nowMs = deps.timers.now();

    mut_lastReadAtMs = nowMs;

    // Whatever drawing the read throws, the page still paces and reads again.
    try {
      show(read, startedAtMs);
    } catch (error: unknown) {
      const failure =
        `Could not draw what was read: ${threw(error).message}` as const;

      // What is on screen is the last report drawn, and as old as it was:
      // the report may have been kept before its drawing threw.
      dispatchStatus({
        kind: 'drawFailed',
        failure,
        drawnAtMs: getReport()?.readAtMs,
      });
    }

    pace(budgets);
  };

  /** Puts what one read brought on the page. */
  const show = (read: ReportRead, startedAtMs: number): void => {
    const previous = getReport();

    const previousRuns = getRuns()?.runs;

    setTokenRefused(
      Result.isErr(read.snapshot) && isUnauthorized(read.snapshot.value),
    );

    setRuns({
      runs:
        previousRuns !== undefined &&
        Result.isErr(read.runs) &&
        Result.isOk(previousRuns)
          ? previousRuns
          : read.runs,
      failure: Result.isErr(read.runs) ? read.runs.value : undefined,
    });

    if (Result.isErr(read.snapshot)) {
      // What stays on screen is the last report, as old as it was.
      dispatchStatus({
        kind: 'readFailed',
        failure: describeReadError(read.snapshot.value),
      });
    } else {
      const snapshot = keptSnapshot(previous?.snapshot, read.snapshot.value);

      const decide = (from: Snapshot): Read<QueueDecision> =>
        decideQueue(from, {
          nowEpochMs: startedAtMs,
          demoted: new Set<number>(),
        });

      const decision = decide(snapshot);

      const failures = failuresOf(read.snapshot.value);

      const pullsUnread = Result.isErr(snapshot.pullRequests)
        ? snapshot.pullRequests.value
        : undefined;

      setReport({
        snapshot,
        decision,
        issueDecision:
          pullsUnread === undefined
            ? decision
            : decide({ ...snapshot, pullRequests: Result.ok([]) }),
        failures:
          pullsUnread === undefined
            ? failures
            : {
                ...failures,
                issues: Arr.toUnshifted(pullsUnread)(failures.issues),
              },
        layerWorkflows: Result.isOk(read.layerWorkflows)
          ? read.layerWorkflows.value
          : (previous?.layerWorkflows ?? []),
        readAtMs: startedAtMs,
      });

      dispatchStatus({ kind: 'readSucceeded', readAtMs: startedAtMs });
    }
  };

  /** Sets the next read from the budgets this one left. */
  const pace = (budgets: ReadonlyMap<string, RateLimit>): void => {
    const samples = new Map<string, BudgetSample>(
      Array.from(budgets, ([resource, rateLimit]) => [resource, { rateLimit }]),
    );

    setBudget({
      rateLimit: budgets.get('graphql') ?? getBudget().rateLimit,
      intervalMs: nextPollIntervalOver(
        getBudget().intervalMs,
        mut_samples,
        samples,
      ),
    });

    mut_samples = new Map<string, BudgetSample>([...mut_samples, ...samples]);

    if (mut_again) {
      mut_again = false;

      readNow();
    } else {
      scheduleNext(getBudget().intervalMs);
    }
  };

  const readNow = (): void => {
    const token = mut_token;

    if (token === undefined || !mut_started) {
      return;
    }

    cancelTimer();

    const generation = mut_generation;

    dispatchStatus({ kind: 'readStarted' });

    const startedAtMs = deps.timers.now();

    // The lowest each budget reached in this read: answers land in any order.
    const mut_budgets = new Map<string, RateLimit>();

    const onBudget = (resource: string, limit: RateLimit): void => {
      const known = mut_budgets.get(resource);

      if (
        known === undefined ||
        limit.resetAtMs > known.resetAtMs ||
        (limit.resetAtMs === known.resetAtMs &&
          limit.remaining < known.remaining)
      ) {
        mut_budgets.set(resource, limit);
      }
    };

    deps
      .read(token, startedAtMs, onBudget)
      .catch((error: unknown): ReportRead => ({
        snapshot: Result.err(threw(error)),
        runs: Result.err(threw(error)),
        layerWorkflows: Result.err(threw(error)),
      }))
      .then((read) => {
        if (generation === mut_generation) {
          finish(read, startedAtMs, mut_budgets);
        }
      })
      .catch(() => undefined);
  };

  const useToken = (token: StoredToken | undefined): void => {
    cancelTimer();

    mut_generation += 1;

    mut_token = token?.value;

    mut_again = false;

    mut_lastReadAtMs = undefined;

    mut_samples = new Map<string, BudgetSample>();

    setReport(undefined);

    setTokenRefused(false);

    setRuns(undefined);

    setBudget({ rateLimit: undefined, intervalMs: POLL.minMs });

    dispatchStatus({ kind: 'tokenSet', present: token !== undefined });

    // A tab opened in the background reads once it is shown (onVisibility).
    if (deps.isVisible()) {
      readNow();
    }
  };

  const onVisibility = (): void => {
    if (!deps.isVisible()) {
      // What the account spends while the tab is hidden is not the page's.
      mut_samples = new Map<string, BudgetSample>();
    }

    if (isReading(getStatus())) {
      return;
    }

    if (deps.isVisible()) {
      scheduleNext(
        delayOnShow(
          getBudget().intervalMs,
          mut_lastReadAtMs,
          deps.timers.now(),
        ),
      );
    } else {
      cancelTimer();
    }
  };

  return {
    report,
    runs,
    status,
    tokenRefused,
    budget,
    refresh: () => {
      if (isReading(getStatus())) {
        mut_again = true;
      } else {
        readNow();
      }
    },
    start: () => {
      mut_started = true;

      const subscription = deps.token.subscribe(useToken);

      const stopWatching = deps.watchVisibility(onVisibility);

      return () => {
        mut_started = false;

        mut_again = false;

        // A read still out when the store stops is dropped, as for a new token.
        // The status may go on saying it is out; `start` sets it again from the
        // token, and nothing reads or draws it before then.
        mut_generation += 1;

        subscription();

        stopWatching();

        cancelTimer();
      };
    },
  };
};

/** The browser's reader: `pr-report-core-v2` over `fetch`. */
export const browserReadReport =
  (repo: Repo): ReadReport =>
  async (token, nowMs, onBudget) => {
    const context = readContextOf({
      transport: browserTransport(onBudget),
      owner: repo.owner,
      name: repo.name,
      token,
    });

    const [snapshot, runs, layerWorkflows] = await Promise.all([
      readSnapshotGraphql(context, {
        nowEpochMs: nowMs,
        issuesLimit: ISSUES_LIMIT,
        mergedLimit: MERGED_LIMIT,
        mergedDays: MERGED_DAYS,
        follow: [],
        readBranchTips: branchTipsNotRead,
      }),
      readRunningWorkflows(context),
      readLayerWorkflows(context),
    ]);

    return { snapshot, runs, layerWorkflows };
  };

/** Whether a read is out, as the header's ring and Refresh show it. */
export const isReading = (status: ReportStatus): boolean =>
  status.kind === 'first-read' ||
  ((status.kind === 'ready' || status.kind === 'failed') && status.reading);

/** A failure as one line: what was being read, and why it was not. */
export const describeReadError = (error: ReadError): string =>
  `Could not read ${error.what}: ${error.message}` as const;

type StatusAction = Readonly<
  | { kind: 'drawFailed'; failure: string; drawnAtMs: number | undefined }
  | { kind: 'readFailed'; failure: string }
  | { kind: 'readStarted' }
  | { kind: 'readSucceeded'; readAtMs: number }
  | { kind: 'tokenSet'; present: boolean }
>;

const noToken: ReportStatus = { kind: 'no-token' } as const;

/** A token set or cleared starts the status over, from whatever state. */
const onToken = (
  _s: ReportStatus,
  { present }: RelaxedExtract<StatusAction, Readonly<{ kind: 'tokenSet' }>>,
): RelaxedExtract<ReportStatus, Readonly<{ kind: 'no-token' | 'waiting' }>> =>
  present ? ({ kind: 'waiting' } as const) : noToken;

const failedWith = (
  failure: string,
): RelaxedExtract<ReportStatus, Readonly<{ kind: 'failed' }>> =>
  ({ kind: 'failed', failure, reading: false }) as const;

const readyAt = (
  readAtMs: number,
): RelaxedExtract<ReportStatus, Readonly<{ kind: 'ready' }>> =>
  ({ kind: 'ready', readAtMs, reading: false, failure: undefined }) as const;

const drawFailed = ({
  failure,
  drawnAtMs,
}: RelaxedExtract<
  StatusAction,
  Readonly<{ kind: 'drawFailed' }>
>): RelaxedExtract<ReportStatus, Readonly<{ kind: 'failed' | 'ready' }>> =>
  drawnAtMs === undefined
    ? failedWith(failure)
    : ({
        kind: 'ready',
        readAtMs: drawnAtMs,
        reading: false,
        failure,
      } as const);

/**
 * How the status moves (spec §4). A token, set or cleared, starts it over from
 * any state. A read starts from `waiting` as the first one, or again from
 * `ready` or `failed`, which keep what they show while it is out; it ends in
 * `ready` once one has brought anything, `failed` until then. `no-token` and
 * `first-read` take no other read, so a second one is not marked as started.
 */
const statusMachine = defineMachine<ReportStatus, StatusAction, 'kind'>('kind')(
  {
    'no-token': { tokenSet: ['no-token', 'waiting'] },
    waiting: { tokenSet: ['no-token', 'waiting'], readStarted: 'first-read' },
    'first-read': {
      tokenSet: ['no-token', 'waiting'],
      readSucceeded: 'ready',
      readFailed: 'failed',
      drawFailed: ['failed', 'ready'],
    },
    failed: {
      tokenSet: ['no-token', 'waiting'],
      readStarted: 'failed',
      readSucceeded: 'ready',
      readFailed: 'failed',
      drawFailed: ['failed', 'ready'],
    },
    ready: {
      tokenSet: ['no-token', 'waiting'],
      readStarted: 'ready',
      readSucceeded: 'ready',
      readFailed: 'ready',
      drawFailed: ['failed', 'ready'],
    },
  },
  {
    'no-token': { tokenSet: onToken },
    waiting: {
      tokenSet: onToken,
      readStarted: () => ({ kind: 'first-read' }),
    },
    'first-read': {
      tokenSet: onToken,
      readSucceeded: (_s, a) => readyAt(a.readAtMs),
      readFailed: (_s, a) => failedWith(a.failure),
      drawFailed: (_s, a) => drawFailed(a),
    },
    failed: {
      tokenSet: onToken,
      readStarted: (s) => ({ ...s, reading: true }),
      readSucceeded: (_s, a) => readyAt(a.readAtMs),
      readFailed: (_s, a) => failedWith(a.failure),
      drawFailed: (_s, a) => drawFailed(a),
    },
    ready: {
      tokenSet: onToken,
      readStarted: (s) => ({ ...s, reading: true }),
      readSucceeded: (_s, a) => readyAt(a.readAtMs),
      readFailed: (s, a) => ({ ...s, reading: false, failure: a.failure }),
      drawFailed: (_s, a) => drawFailed(a),
    },
  },
);

/** As many open issues as a read takes; more is said to be cut short. */
const ISSUES_LIMIT = 1000;

/** The merged block's window (spec §10). */
const MERGED_DAYS = 7;

const MERGED_LIMIT = 300;

const threw = (error: unknown): ReadError =>
  ({
    kind: 'malformed',
    what: 'the repository',
    message:
      isRecord(error) &&
      hasKey(error, 'message') &&
      typeof error.message === 'string'
        ? error.message
        : ('the read threw' as const),
  }) as const;

/**
 * A 401: the token itself is wrong, expired or revoked. It reads the
 * `<status>: ` spelling `pr-report-core-v2`'s `classify.mts` writes, as that
 * file's `isNotFound` does; it belongs beside it once that package (the merge
 * queue rebuild's) takes it.
 */
const isUnauthorized = (error: ReadError): boolean =>
  error.kind === 'refused' && error.message.startsWith('401:');
