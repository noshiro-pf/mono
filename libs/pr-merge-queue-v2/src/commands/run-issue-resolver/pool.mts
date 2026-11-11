/** How many sessions run at once, and when the issues are looked at again. */

import {
  Arr,
  asPositiveInt,
  Num,
  Result,
  unknownToString,
} from 'ts-data-forge';
import type { NonEmptyArray } from 'ts-type-forge';

/**
 * Runs sessions on what `steps.survey` finds, up to `limits.concurrency` at
 * once and never two on one issue, until `limits.maxSessions` have run, a stop
 * is requested, or a failure is fatal; then waits for the ones running, and
 * resolves to that failure, if any.
 *
 * The issues are looked at again as soon as a session ends, and otherwise every
 * `limits.intervalMs`, which a session ending cuts short. A session counts
 * against `limits.maxSessions` from when it starts, so that the sessions
 * running never take the total past it, and stops counting if it ends having
 * spent nothing. An issue whose session failed without being fatal (a 5xx when
 * it was labelled, say) is not handed on again until the interval has passed,
 * so that it is not retried as fast as it fails. With `limits.once`, there is
 * one look, and any failure is returned.
 *
 * Each session is capped at what {@link capForNext} gives it, and starts only
 * when it gives one: that cap is held for the session while it runs, out of
 * `limits.totalUsd`, so that the sessions running never take the run past it.
 * One that ends gives back what it did not spend, by the cost its result
 * reports; one whose result reports none, or whose run threw, counts as its
 * whole cap. The cost of each that resolved its issue is what later caps
 * follow.
 */
export const runPool = async <C extends Readonly<{ number: number }>>(
  limits: PoolLimits,
  steps: PoolSteps<C>,
): Promise<Result<undefined, string>> => {
  // Each issue a session is running on, settled once it has ended and been
  // accounted for.
  const mut_running = new Map<number, Promise<void>>();

  // Issues whose session failed, and when they may be handed on again.
  const mut_retryAt = new Map<number, number>();

  // The cap held for each session running.
  const mut_held = new Map<number, number>();

  // What each session that resolved its issue reported it cost.
  const mut_resolvedCosts: number[] = [];

  const mut_state: {
    counted: number;
    failure: string | undefined;
    spentUsd: number;
    /** Why the budget, and nothing else, held a slot back last time. */
    budgetHeld: CapDecision['kind'] | undefined;
  } = { counted: 0, failure: undefined, spentUsd: 0, budgetHeld: undefined };

  const decideCap = (): CapDecision =>
    capForNext({
      totalUsd: limits.totalUsd,
      spentUsd: mut_state.spentUsd,
      heldUsd: Arr.sum(Array.from(mut_held.values())),
      running: mut_running.size,
      resolvedCosts: mut_resolvedCosts,
    });

  // What the last look said it is waiting on.
  let mut_lastNotes = '';

  const start = (candidate: C, capUsd: number): void => {
    mut_state.counted += 1;

    mut_held.set(candidate.number, capUsd);

    const settled = steps
      .run(candidate, capUsd)
      .catch((error: unknown): Result<never, RunError> => {
        // Thrown rather than returned: whether its session spent is unknown.
        mut_state.spentUsd += capUsd;

        return Result.err({ fatal: false, message: unknownToString(error) });
      })
      .then((outcome) => {
        mut_running.delete(candidate.number);

        mut_held.delete(candidate.number);

        if (Result.isOk(outcome) && outcome.value.spent) {
          const { costUsd, resolved } = outcome.value;

          mut_state.spentUsd += costUsd ?? capUsd;

          if (resolved && costUsd !== undefined) {
            mut_resolvedCosts.push(costUsd);
          }

          steps.log(
            `${usd(mut_state.spentUsd)} of ${usd(limits.totalUsd)} spent so far${Arr.isNonEmpty(mut_resolvedCosts) ? `; an issue resolved has cost ${usd(average(mut_resolvedCosts))} on average` : ''}.`,
          );

          return;
        }

        mut_state.counted -= 1;

        if (Result.isOk(outcome)) {
          return;
        }

        if (outcome.value.fatal || limits.once) {
          mut_state.failure ??= outcome.value.message;

          if (mut_running.size > 0) {
            steps.log(
              `${outcome.value.message}\nStarting no more sessions; waiting for the ${mut_running.size} running.`,
            );
          }

          return;
        }

        steps.log(outcome.value.message);

        mut_retryAt.set(candidate.number, steps.now() + limits.intervalMs);
      });

    mut_running.set(candidate.number, settled);
  };

  // One at a time: each one started holds its cap, which the next one's is
  // decided after. Resolves to the ones started.
  const startWhileTheBudgetHolds = (ready: readonly C[]): readonly C[] => {
    const mut_started: C[] = [];

    for (const candidate of ready) {
      const decided = decideCap();

      if (decided.kind !== 'start') {
        break;
      }

      start(candidate, decided.capUsd);

      mut_started.push(candidate);
    }

    return mut_started;
  };

  // Said once, while the budget, and nothing else, keeps a slot empty.
  const sayWhatTheBudgetHolds = (): void => {
    const free =
      0 < mut_running.size &&
      mut_running.size < limits.concurrency &&
      mut_state.counted < limits.maxSessions;

    const decided = decideCap();

    const heldBy = free && decided.kind !== 'start' ? decided.kind : undefined;

    if (heldBy !== undefined && heldBy !== mut_state.budgetHeld) {
      steps.log(
        heldBy === 'first'
          ? 'Waiting for a session to resolve an issue before starting another: what one costs is not known yet.'
          : `Waiting for a session to end: ${usd(mut_state.spentUsd)} of ${usd(limits.totalUsd)} spent, and what is left besides the caps of the ${mut_running.size} running is less than an issue has cost on average.`,
      );
    }

    mut_state.budgetHeld = heldBy;
  };

  // Read through a call: a session that ends while a look is awaited can set
  // the failure, and a signal the stop.
  const over = (): boolean =>
    steps.stopRequested() || mut_state.failure !== undefined;

  while (!over()) {
    const bySessions = limits.maxSessions - mut_state.counted;

    const slots = Math.min(limits.concurrency - mut_running.size, bySessions);

    const startable = slots > 0 && decideCap().kind === 'start';

    if (!startable && mut_running.size === 0) {
      steps.log(
        slots <= 0
          ? `${mut_state.counted} sessions have run, as many as --max-sessions allows; stopping.`
          : `${usd(mut_state.spentUsd)} of ${usd(limits.totalUsd)} spent: what is left is less than ${Arr.isNonEmpty(mut_resolvedCosts) ? `an issue has cost on average (${usd(average(mut_resolvedCosts))})` : `a first session's cap (${usd(firstCapUsd(limits.totalUsd))})`}, so --max-total-usd allows no more; starting no more.`,
      );

      break;
    }

    if (startable) {
      // A throw (a full temporary directory, say) is one failed look, not the
      // end of a command meant to be left running.
      // eslint-disable-next-line no-await-in-loop -- one look after another
      const surveyed = await steps
        .survey()
        .catch((error: unknown): Result<never, RunError> =>
          Result.err({ fatal: false, message: unknownToString(error) }),
        );

      if (Result.isErr(surveyed)) {
        if (surveyed.value.fatal || limits.once) {
          mut_state.failure ??= surveyed.value.message;

          break;
        }

        steps.log(surveyed.value.message);
      }

      // What the look found is stale if the run ended while it was taken.
      if (over()) {
        break;
      }

      const now = steps.now();

      const offered = Result.isOk(surveyed)
        ? surveyed.value.fresh.filter(({ number }) => !mut_running.has(number))
        : ([] as const);

      const ready = pickApart(
        offered.filter(({ number }) => (mut_retryAt.get(number) ?? now) <= now),
        slots,
        steps.apart,
      );

      const held = offered
        .filter(({ number }) => (mut_retryAt.get(number) ?? now) > now)
        .map(({ number }) => `#${number}`);

      const next = startWhileTheBudgetHolds(ready);

      // Said again only when it changes, as `run-unblock-prs-skill` does.
      const waiting =
        Result.isOk(surveyed) && Arr.isEmpty(next)
          ? Arr.toUnshifted(surveyed.value.notes)(
              Arr.isNonEmpty(held)
                ? [
                    `${held.join(', ')}: failed to start; tried again once the interval has passed.`,
                  ]
                : [],
            )
              .filter((line) => line !== '')
              .join('\n')
          : undefined;

      const changed = waiting !== undefined && waiting !== mut_lastNotes;

      if (Arr.isNonEmpty(next)) {
        mut_lastNotes = '';
      } else if (changed) {
        mut_lastNotes = waiting;

        if (waiting !== '') {
          steps.log(waiting);
        }
      }

      if (limits.once) {
        break;
      }

      if (mut_running.size === 0 && (changed || Result.isErr(surveyed))) {
        steps.log(
          `Checking again every ${Math.round(limits.intervalMs / 60_000)} min.`,
        );
      }
    }

    sayWhatTheBudgetHolds();

    // Until a session ends, or the interval passes while a session could start.
    const wake = new AbortController();

    // eslint-disable-next-line no-await-in-loop -- the wait between looks
    await (startable
      ? Promise.race([
          steps.pause(limits.intervalMs, wake.signal),
          ...mut_running.values(),
        ])
      : Promise.race(mut_running.values()));

    wake.abort();
  }

  await Promise.all(mut_running.values());

  return mut_state.failure === undefined
    ? Result.ok(undefined)
    : Result.err(mut_state.failure);
};

export const usd = (amount: number): string => `$${amount.toFixed(2)}` as const;

/**
 * The cap of a session started before any has resolved an issue: a quarter of
 * the total, so that the first ones, one at a time, leave most of it for what
 * their costs show.
 */
export const firstCapUsd = (totalUsd: number): number =>
  cents(totalUsd * FIRST_CAP_SHARE);

/**
 * Whether a session may start now, and its cap.
 *
 * - Before any session has resolved an issue with a cost reported, one at a
 *   time, at {@link firstCapUsd}, while what is left holds it whole.
 * - After, at {@link CAP_PER_AVERAGE} times what a resolved issue has cost on
 *   average, or what the dearest has cost, if more; or what is left besides
 *   the caps held, if less, but never below that average, which a session would
 *   likely not finish on.
 *
 * Amounts are in whole cents, rounded down.
 */
export const capForNext = (
  budget: Readonly<{
    totalUsd: number;
    spentUsd: number;
    /** The caps held for the sessions running. */
    heldUsd: number;
    running: number;
    resolvedCosts: readonly number[];
  }>,
): CapDecision => {
  const leftUsd = cents(budget.totalUsd - budget.spentUsd - budget.heldUsd);

  if (!Arr.isNonEmpty(budget.resolvedCosts)) {
    const first = firstCapUsd(budget.totalUsd);

    return 0 < budget.running
      ? { kind: 'first' }
      : 0 < first && first <= leftUsd
        ? { kind: 'start', capUsd: first }
        : { kind: 'short' };
  }

  const averageUsd = average(budget.resolvedCosts);

  // Never below the dearest issue resolved so far: one cheap resolution would
  // otherwise cap every session after it too low to finish anything.
  const capUsd = Math.min(
    Math.max(cents(CAP_PER_AVERAGE * averageUsd), ...budget.resolvedCosts),
    leftUsd,
  );

  return 0 < capUsd && averageUsd <= capUsd + 0.005
    ? { kind: 'start', capUsd }
    : { kind: 'short' };
};

/**
 * `start` with the cap; `first` while the first sessions run one at a time;
 * `short` when what is left holds no cap.
 */
export type CapDecision = Readonly<
  { kind: 'start'; capUsd: number } | { kind: 'first' } | { kind: 'short' }
>;

/**
 * Three: an issue that costs three times the average is cut off, and left as
 * one the session could not finish; a higher one holds more of the budget for
 * each session, and runs fewer at once.
 */
export const CAP_PER_AVERAGE = 3;

/** What share of the total a session started before any issue is resolved may spend. */
export const FIRST_CAP_SHARE = 0.25;

/**
 * Up to `slots` of `ready`, in order, each one `apart` allows beside those
 * taken before it; the first `slots` when there is no `apart`.
 */
export const pickApart = <C,>(
  ready: readonly C[],
  slots: number,
  apart: ((taken: readonly C[], next: C) => boolean) | undefined,
): readonly C[] => {
  const mut_taken: C[] = [];

  for (const candidate of ready) {
    if (mut_taken.length >= slots) {
      break;
    }

    if (apart === undefined || apart(mut_taken, candidate)) {
      mut_taken.push(candidate);
    }
  }

  return mut_taken;
};

const average = (costs: NonEmptyArray<number>): number =>
  Num.div(Arr.sum(costs), asPositiveInt(costs.length));

/** Down to whole cents, so that a cap is never above what it was worked out as. */
const cents = (amount: number): number =>
  Math.floor(Math.round(amount * 1e6) / 1e4) / 100;

export type PoolLimits = Readonly<{
  /** Sessions running at once. */
  concurrency: number;
  /** Sessions that may have spent anything, before it stops starting more. */
  maxSessions: number;
  /** One look, then wait for what it started. */
  once: boolean;
  /** Between looks that start nothing. */
  intervalMs: number;
  /** What the run may spend in all. */
  totalUsd: number;
}>;

/** What the pool runs, given rather than imported so that a test can. */
export type PoolSteps<C extends Readonly<{ number: number }>> = Readonly<{
  /**
   * The issues a session may be started on, in the order they are taken, and
   * what the look has to say about the rest.
   */
  survey: () => Promise<
    Result<Readonly<{ fresh: readonly C[]; notes: string }>, RunError>
  >;
  /**
   * Starts a session on `candidate`, capped at `capUsd`, and resolves once it
   * has been settled.
   */
  run: (candidate: C, capUsd: number) => Promise<Result<RunOutcome, RunError>>;
  /** Sleeps `ms`, or until `signal` aborts or a stop is requested. */
  pause: (ms: number, signal: Readonly<AbortSignal>) => Promise<void>;
  stopRequested: () => boolean;
  now: () => number;
  log: (message: string) => void;
  /**
   * Whether `next` may start beside the candidates `taken` in the same pick;
   * every one may when absent. `run-issue-resolver` keeps two sessions started
   * together off one theme with it (#3598).
   */
  apart: ((taken: readonly C[], next: C) => boolean) | undefined;
}>;

/**
 * Whether the session may have cost anything, what it cost, when its result
 * said, and whether it resolved its issue: a pull request closes it now. Only
 * the costs of those are what later caps follow; one the session closed as it
 * stood (done already, say) cost what deciding that did, not what work does.
 */
export type RunOutcome = Readonly<{
  spent: boolean;
  costUsd: number | undefined;
  resolved: boolean;
}>;

/** A failure, and whether it stops the command rather than waiting it out. */
export type RunError = Readonly<{ fatal: boolean; message: string }>;
