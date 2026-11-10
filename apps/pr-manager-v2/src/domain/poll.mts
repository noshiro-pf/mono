import { Arr, Num } from 'ts-data-forge';

/** What GitHub says is left of one of the token account's budgets. */
export type RateLimit = Readonly<{
  remaining: number;
  limit: number;
  resetAtMs: number;
}>;

/** A budget reading after one read. */
export type BudgetSample = Readonly<{ rateLimit: RateLimit }>;

export const POLL = {
  /** The most often the page reads. */
  minMs: 15_000,
  /** The least often. */
  maxMs: 300_000,
  stepMs: 5000,
  /** The share of the hourly budget the reads may spend. */
  budgetShare: 0.25,
} as const;

/**
 * How long to wait before the next read so that the page spends about a quarter
 * of the account's hourly budget (spec §4.2).
 *
 * The cost is measured, not estimated: the drop in `remaining` between two
 * reads in one rate-limit window is what one read cost, however long apart they
 * were (a Refresh soon after a poll, a read slower than the interval).
 * Whatever else the account spent meanwhile counts too, which slows the page
 * rather than the account's other work. Without two comparable samples (the
 * first read, or a window that reset), the interval stays as it was; the store
 * forgets its samples while the tab is hidden, whose drop is not the page's.
 */
export const nextPollInterval = (
  intervalMs: number,
  previous: BudgetSample | undefined,
  current: BudgetSample,
): number => {
  if (previous?.rateLimit.resetAtMs !== current.rateLimit.resetAtMs) {
    return intervalMs;
  }

  const allowedPerHour = current.rateLimit.limit * POLL.budgetShare;

  if (!Num.isNonZero(allowedPerHour)) {
    return intervalMs;
  }

  const costPerRead = Math.max(
    0,
    previous.rateLimit.remaining - current.rateLimit.remaining,
  );

  const wantedMs = Num.div(costPerRead * HOUR_MS, allowedPerHour);

  const stepped = Math.ceil(wantedMs / POLL.stepMs) * POLL.stepMs;

  return Math.min(POLL.maxMs, Math.max(POLL.minMs, stepped));
};

/**
 * {@link nextPollInterval} over every budget a read spends from (GraphQL's and
 * REST's are apart): the longest any of them asks for, so that the read keeps
 * within each. A resource with no comparable pair of samples has no say; with
 * none at all, the interval stays as it was.
 */
export const nextPollIntervalOver = (
  intervalMs: number,
  previous: ReadonlyMap<string, BudgetSample>,
  current: ReadonlyMap<string, BudgetSample>,
): number => {
  const wanted = Arr.generate(function* () {
    for (const [resource, sample] of Array.from(current)) {
      const before = previous.get(resource);

      if (before?.rateLimit.resetAtMs === sample.rateLimit.resetAtMs) {
        yield nextPollInterval(intervalMs, before, sample);
      }
    }
  });

  return Arr.isNonEmpty(wanted) ? Math.max(...wanted) : intervalMs;
};

/**
 * How long a tab shown again waits before reading: at once when an interval has
 * passed since the last read, else for the rest of it.
 */
export const delayOnShow = (
  intervalMs: number,
  lastReadAtMs: number | undefined,
  nowMs: number,
): number =>
  lastReadAtMs === undefined
    ? 0
    : Math.max(0, lastReadAtMs + intervalMs - nowMs);

const HOUR_MS = 3_600_000;
