// cspell:ignore unlabel
/**
 * Conditions (`spec/worker.md`, "Conditions"; **New in v2**, #3601): every "this
 * has gone on too long" rule as one mechanism. A condition is keyed by pull
 * request, head and kind, and records when it was first met and how many times.
 *
 * - **Observed** ones are met by a snapshot and cleared by the first snapshot
 *   that does not meet them ({@link observeConditions}).
 * - **Attempted** ones are met by a failed attempt and cleared only by the same
 *   attempt succeeding or the head moving ({@link attemptCondition}); a
 *   snapshot in which nothing was attempted leaves them as they are.
 *
 * {@link conditionVerdict} says what one has turned into.
 */

import { Arr } from 'ts-data-forge';

/**
 * `observed` and `attempted` kinds. `checks-unread`: a released pull request's
 * checks could not be read. `head-out-of-sync`: GitHub shows a head that is not
 * its branch's tip. `checks-not-started`: a required context unreported and
 * nothing running. `review-unread`: its review could not be read.
 * `rerun-failed`: asking for the re-run of a code-owner check failed. The rest:
 * a push, an arm, or taking `skip-ci` off failed.
 */
export const OBSERVED_KINDS = [
  'checks-unread',
  'head-out-of-sync',
  'checks-not-started',
] as const;

export const ATTEMPTED_KINDS = [
  'review-unread',
  'rerun-failed',
  'push-failed',
  'arm-failed',
  'unlabel-failed',
] as const;

export type ObservedKind = (typeof OBSERVED_KINDS)[number];

export type AttemptedKind = (typeof ATTEMPTED_KINDS)[number];

export type ConditionKind = AttemptedKind | ObservedKind;

export type ConditionKey = Readonly<{
  number: number;
  head: string;
  kind: ConditionKind;
}>;

export type Condition = ConditionKey &
  Readonly<{
    /** When it was first met. */
    firstEpochMs: number;
    /** How many snapshots, or failed attempts, have met it. */
    count: number;
    /**
     * For `checks-not-started`: whether the one label event that asks GitHub to
     * start the check workflows again has been sent. `false` for the rest.
     */
    refired: boolean;
  }>;

/**
 * `conditions` after a snapshot that met `met` (observed kinds only): each met
 * counted once more, or begun; an observed one not met cleared; the attempted
 * ones left as they are, except those of a pull request no longer open, or at
 * another head (`heads`), which are cleared too.
 */
export const observeConditions = (
  conditions: readonly Condition[],
  met: readonly ConditionKey[],
  heads: ReadonlyMap<number, string>,
  nowEpochMs: number,
): readonly Condition[] => {
  const current = conditions.filter(
    (condition) => heads.get(condition.number) === condition.head,
  );

  const observed = Arr.uniqBy(met, keyOf).map((key): Condition => {
    const before = current.find((condition) => sameKey(condition, key));

    return before === undefined
      ? { ...key, firstEpochMs: nowEpochMs, count: 1, refired: false }
      : { ...before, count: before.count + 1 };
  });

  return [
    ...current.filter((condition) => isAttempted(condition.kind)),
    ...observed,
  ];
};

/**
 * `conditions` after an attempt of `key`'s kind: counted once more, or begun,
 * when it failed; cleared when it succeeded.
 */
export const attemptCondition = (
  conditions: readonly Condition[],
  key: Readonly<{ number: number; head: string; kind: AttemptedKind }>,
  failed: boolean,
  nowEpochMs: number,
): readonly Condition[] => {
  const others = conditions.filter((condition) => !sameKey(condition, key));

  if (!failed) {
    return others;
  }

  const before = conditions.find((condition) => sameKey(condition, key));

  return Arr.toPushed(
    others,
    before === undefined
      ? { ...key, firstEpochMs: nowEpochMs, count: 1, refired: false }
      : { ...before, count: before.count + 1 },
  );
};

/** `conditions` with `key`'s marked as refired. */
export const markRefired = (
  conditions: readonly Condition[],
  key: ConditionKey,
): readonly Condition[] =>
  conditions.map((condition) =>
    sameKey(condition, key) ? { ...condition, refired: true } : condition,
  );

/** The condition of `key`, if met. */
export const conditionOf = (
  conditions: readonly Condition[],
  key: ConditionKey,
): Condition | undefined =>
  conditions.find((condition) => sameKey(condition, key));

/**
 * What `condition` has turned into at `nowEpochMs`, by the policy of
 * `spec/worker.md`'s table:
 *
 * - `wait` — not yet;
 * - `refire` — `checks-not-started` past its first grace, not yet refired: put
 *   `skip-ci` on and take it off once;
 * - `set-aside` — past the policy, with the reason to record.
 *
 * `mainUnread` is whether the same read fails on the default branch too, which
 * is GitHub's outage, and keeps `checks-unread` waiting.
 */
export const conditionVerdict = (
  condition: Condition,
  nowEpochMs: number,
  mainUnread: boolean,
): ConditionVerdict => {
  const lasted = nowEpochMs - condition.firstEpochMs;

  switch (condition.kind) {
    case 'checks-unread':
      return !mainUnread && condition.count >= UNREAD_SNAPSHOTS
        ? { kind: 'set-aside', reason: 'read-failed' }
        : WAIT;

    case 'review-unread':
    case 'rerun-failed':
      return condition.count >= UNREAD_SNAPSHOTS
        ? { kind: 'set-aside', reason: 'read-failed' }
        : WAIT;

    case 'head-out-of-sync':
      return lasted >= OUT_OF_SYNC_GRACE_MS
        ? { kind: 'set-aside', reason: 'head-out-of-sync' }
        : WAIT;

    case 'checks-not-started':
      return lasted < NOT_STARTED_GRACE_MS
        ? WAIT
        : !condition.refired
          ? { kind: 'refire' }
          : lasted >= 2 * NOT_STARTED_GRACE_MS
            ? { kind: 'set-aside', reason: 'checks-not-started' }
            : WAIT;

    case 'push-failed':
    case 'arm-failed':
    case 'unlabel-failed':
      return condition.count >= FAILED_ATTEMPTS
        ? { kind: 'set-aside', reason: condition.kind }
        : WAIT;
  }
};

export type ConditionVerdict = Readonly<
  | { kind: 'wait' }
  | { kind: 'refire' }
  | {
      kind: 'set-aside';
      reason:
        | 'arm-failed'
        | 'checks-not-started'
        | 'head-out-of-sync'
        | 'push-failed'
        | 'read-failed'
        | 'unlabel-failed';
    }
>;

/** Snapshots a read may fail in a row before it sets aside. */
export const UNREAD_SNAPSHOTS = 5;

/** How long GitHub may show a head that is not the branch's tip. */
export const OUT_OF_SYNC_GRACE_MS = 10 * 60_000;

/** How long a required context may go unreported with nothing running. */
export const NOT_STARTED_GRACE_MS = 5 * 60_000;

/** Failed pushes, arms or label removals before it sets aside. */
export const FAILED_ATTEMPTS = 3;

const WAIT: ConditionVerdict = { kind: 'wait' } as const;

const keyOf = ({ number, head, kind }: ConditionKey): string =>
  `${number} ${head} ${kind}` as const;

const sameKey = (a: ConditionKey, b: ConditionKey): boolean =>
  keyOf(a) === keyOf(b);

const ATTEMPTED: ReadonlySet<ConditionKind> = new Set<ConditionKind>(
  ATTEMPTED_KINDS,
);

const isAttempted = (kind: ConditionKind): boolean => ATTEMPTED.has(kind);
