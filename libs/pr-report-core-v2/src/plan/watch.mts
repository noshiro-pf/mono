/**
 * The pull request in flight, judged one snapshot at a time (`spec/worker.md`,
 * "In flight"). **Changed in v2**: v1 watched in a loop inside one cycle; v2
 * judges one snapshot per cycle and keeps the watch in the memory, so a restart
 * picks it up again.
 */

import { Arr, Result } from 'ts-data-forge';
import { hasLabel, PullRequestLabel } from '../conventions/index.mjs';
import {
  codeOwnerReviewOf,
  isRunning,
  labelNames,
  parseCodeOwners,
  reviewStateOf,
  type ChecksSummary,
  type CodeOwnerReview,
  type PullRequestDecision,
  type SetAsideReason,
} from '../decide/index.mjs';
import type {
  FollowedPullRequest,
  PullRequestFacts,
  Read,
} from '../snapshot/index.mjs';
import {
  conditionOf,
  conditionVerdict,
  type Condition,
  type ConditionKey,
} from './conditions.mjs';
import type { InFlight } from './memory.mjs';

/**
 * The observed conditions the pull request in flight meets in this snapshot:
 * its checks unread, or a required context unreported with nothing running.
 * Counted before the watch is judged, so that its verdicts read this snapshot.
 */
export const watchConditionsMet = (
  watched: InFlight,
  decision: PullRequestDecision | undefined,
): readonly ConditionKey[] => {
  if (decision?.facts.headSha !== watched.head) {
    return [];
  }

  const { facts, checks } = decision;

  const key = (kind: ConditionKey['kind']): ConditionKey =>
    ({ number: watched.number, head: watched.head, kind }) as const;

  return Result.isErr(checks)
    ? [key('checks-unread')]
    : notStarted(checks.value, facts)
      ? [key('checks-not-started')]
      : [];
};

/**
 * What the watch of `watched` does with this snapshot: the first row of the
 * table that matches. `conditions` already count this snapshot
 * ({@link watchConditionsMet}).
 */
export const judgeWatch = (
  watched: InFlight,
  context: WatchContext,
): WatchOutcome => {
  const decision = context.decision;

  if (decision === undefined) {
    return goneOutcome(watched, context.followed);
  }

  const { facts } = decision;

  const labels = labelNames(facts.labels);

  const bypass = isBypass(decision);

  if (!bypass && !facts.autoMerge) {
    return {
      kind: 'pause',
      why: 'auto-merge was switched off; `skip-ci` goes back on, and it is armed when next picked',
    };
  }

  if (hasLabel(labels, PullRequestLabel.skipCi)) {
    return ended('`skip-ci` is back on');
  }

  if (facts.headSha !== watched.head) {
    return ended(`its head moved to ${facts.headSha.slice(0, 10)}`);
  }

  if (facts.mergeState === 'BEHIND' || facts.mergeState === 'DIRTY') {
    return ended(`it is ${facts.mergeState}; a candidate again`);
  }

  const { checks } = decision;

  const timedOut =
    context.nowEpochMs - watched.releasedEpochMs >= context.watchTimeoutMs;

  if (Result.isErr(checks)) {
    if (timedOut) {
      return setAside('watch-timeout', 'its checks ran past the watch');
    }

    const condition = conditionOf(context.conditions, {
      number: watched.number,
      head: watched.head,
      kind: 'checks-unread',
    });

    return condition !== undefined &&
      conditionVerdict(condition, context.nowEpochMs, context.mainUnread)
        .kind === 'set-aside'
      ? setAside(
          'read-failed',
          `its checks could not be read for ${condition.count} snapshots: ${checks.value.message}`,
        )
      : waiting(watched, 0);
  }

  const summary = checks.value;

  if (summary.verdict === 'failing') {
    return judgeFailing(watched, summary, decision, context);
  }

  if (summary.verdict === 'passed') {
    return judgeGreen(watched, decision, bypass);
  }

  const notStartedCondition = conditionOf(context.conditions, {
    number: watched.number,
    head: watched.head,
    kind: 'checks-not-started',
  });

  if (notStartedCondition !== undefined) {
    const verdict = conditionVerdict(
      notStartedCondition,
      context.nowEpochMs,
      context.mainUnread,
    );

    if (verdict.kind === 'refire') {
      return { kind: 'refire', watched: { ...watched, greenCount: 0 } };
    }

    if (verdict.kind === 'set-aside') {
      return setAside(
        'checks-not-started',
        `GitHub started nothing for ${summary.missing.map((context_) => `\`${context_}\``).join(', ')} on its head`,
      );
    }
  }

  return timedOut
    ? setAside(
        'watch-timeout',
        `it still waited on ${[...summary.pending, ...summary.missing].map((name) => `\`${name}\``).join(', ')}`,
      )
    : waiting(watched, 0);
};

/**
 * What a released pull request's code-owner check, red alone, waits for, from
 * its review: `undefined` when the check is not the code-owner gate or is not
 * the only red one.
 */
export const codeOwnerRed = (
  summary: ChecksSummary,
  facts: PullRequestFacts,
  gate: CodeOwnerCheck | undefined,
): Read<CodeOwnerReview> | undefined => {
  if (
    gate === undefined ||
    !Arr.isFixedLengthArray(1, summary.failed) ||
    summary.failed[0] !== gate.context
  ) {
    return undefined;
  }

  return Result.map(facts.review, (review) =>
    codeOwnerReviewOf(reviewStateOf(facts.author, review), {
      requireCodeOwnerReview: false,
      requireConversationResolution: false,
      codeOwners: parseCodeOwners(gate.codeOwners),
      codeOwnerGate: 'check',
    }),
  );
};

/** How often the code-owner check is re-run per pull request and head. */
export const CODE_OWNER_RERUNS = 2;

export type WatchContext = Readonly<{
  decision: PullRequestDecision | undefined;
  /** The pull requests no longer open, where read. */
  followed: Read<readonly FollowedPullRequest[]>;
  conditions: readonly Condition[];
  nowEpochMs: number;
  watchTimeoutMs: number;
  /** Whether the checks of the default branch's tip are unread too. */
  mainUnread: boolean;
  /** The required check that enforces `CODEOWNERS`, where one does. */
  codeOwnerCheck: CodeOwnerCheck | undefined;
  autoFix: boolean;
  /** How many code-owner re-runs were asked at this head. */
  reruns: number;
}>;

export type CodeOwnerCheck = Readonly<{
  /** The required context that enforces it. */
  context: string;
  /** The text of `CODEOWNERS`. */
  codeOwners: string;
}>;

/**
 * - `watching` — nothing to do yet; `watched` is the watch carried on.
 * - `pause` — `skip-ci` back on (auto-merge switched off); the watch ends.
 * - `refire` — one label event, `skip-ci` on and off.
 * - `auto-fix` — try Auto-fix; declined, set aside `checks-failed`.
 * - `rerun` — re-run the failed jobs of the code-owner check's run.
 * - `ended` — the watch ends, with nothing to write.
 * - `merged` / `closed` — it left the list.
 * - `set-aside` — the watch ends with a set-aside, demoting it for
 *   `not-merging`.
 */
export type WatchOutcome = Readonly<
  | { kind: 'watching'; watched: InFlight }
  | { kind: 'pause'; why: string }
  | { kind: 'refire'; watched: InFlight }
  | { kind: 'auto-fix'; watched: InFlight; failed: readonly string[] }
  | { kind: 'rerun'; watched: InFlight; context: string }
  | { kind: 'ended'; why: string }
  | { kind: 'merged' | 'closed'; at: string }
  | { kind: 'set-aside'; reason: SetAsideReason; detail: string }
>;

const ended = (why: string): WatchOutcome => ({ kind: 'ended', why }) as const;

const setAside = (reason: SetAsideReason, detail: string): WatchOutcome =>
  ({ kind: 'set-aside', reason, detail }) as const;

const judgeFailing = (
  watched: InFlight,
  summary: ChecksSummary,
  decision: PullRequestDecision,
  context: WatchContext,
): WatchOutcome => {
  const failedNames = summary.failed.map((name) => `\`${name}\``).join(', ');

  const codeOwner = codeOwnerRed(
    summary,
    decision.facts,
    context.codeOwnerCheck,
  );

  if (codeOwner !== undefined && context.codeOwnerCheck !== undefined) {
    if (Result.isErr(codeOwner)) {
      return ended(
        `its code-owner check is red and its review could not be read (${codeOwner.value.message}); held for a person to re-run`,
      );
    }

    const review = codeOwner.value;

    switch (review.state) {
      case 'approved':
        return context.reruns < CODE_OWNER_RERUNS
          ? {
              kind: 'rerun',
              watched: { ...watched, greenCount: 0 },
              context: context.codeOwnerCheck.context,
            }
          : setAside(
              'checks-failed',
              `${failedNames} failed; re-run ${CODE_OWNER_RERUNS} times since the approval and still red`,
            );

      case 'required':
        return review.owners.every(
          (owner) =>
            owner.toLowerCase() === decision.facts.author.toLowerCase(),
        )
          ? setAside(
              'awaiting-bypass',
              'every required check is green but the one that enforces CODEOWNERS, which only its author owns',
            )
          : ended(
              `its code-owner check waits for ${review.owners.map((owner) => `@${owner}`).join(' or ')}; held`,
            );

      case 'unknown':
        return ended(
          'its code-owner check is red and its review cannot be told; held for a person to re-run',
        );

      case 'not-required':
        break;
    }
  }

  return context.autoFix && !watched.autoFixed
    ? {
        kind: 'auto-fix',
        watched: { ...watched, greenCount: 0, autoFixed: true },
        failed: summary.failed,
      }
    : setAside('checks-failed', `${failedNames} failed`);
};

const waiting = (watched: InFlight, greenCount: number): WatchOutcome =>
  ({ kind: 'watching', watched: { ...watched, greenCount } }) as const;

const judgeGreen = (
  watched: InFlight,
  decision: PullRequestDecision,
  bypass: boolean,
): WatchOutcome => {
  if (bypass) {
    return setAside(
      'awaiting-bypass',
      'green, and only a ruleset bypass merges it',
    );
  }

  const blocked = decision.facts.mergeState === 'BLOCKED';

  const greenCount = watched.greenCount + 1;

  if (greenCount < (blocked ? GREEN_BUDGET_BLOCKED : GREEN_BUDGET)) {
    return waiting(watched, greenCount);
  }

  const held =
    blocked &&
    decision.review !== undefined &&
    Result.isOk(decision.review) &&
    decision.review.value?.kind === 'held'
      ? decision.review.value.reason
      : undefined;

  return held === undefined
    ? setAside(
        'not-merging',
        `green for ${greenCount} snapshots and not merging (${decision.facts.mergeState})`,
      )
    : ended(`green, and its review holds it: ${held}`);
};

/** Where one no longer in the list went, once that is read. */
const goneOutcome = (
  watched: InFlight,
  followed: Read<readonly FollowedPullRequest[]>,
): WatchOutcome => {
  const found = Result.isOk(followed)
    ? followed.value.find(({ number }) => number === watched.number)
    : undefined;

  return found === undefined
    ? waiting(watched, watched.greenCount)
    : { kind: found.state, at: found.at };
};

/** A required context unreported while nothing on the head runs. */
const notStarted = (summary: ChecksSummary, facts: PullRequestFacts): boolean =>
  summary.verdict === 'pending' &&
  Arr.isNonEmpty(summary.missing) &&
  Result.isOk(facts.checks) &&
  !isRunning(facts.checks.value);

const isBypass = (decision: PullRequestDecision): boolean =>
  decision.review !== undefined &&
  Result.isOk(decision.review) &&
  decision.review.value?.kind === 'bypass';

/** Consecutive green snapshots while GitHub calls it mergeable. */
const GREEN_BUDGET = 2;

/** …and while it reads `BLOCKED`: a superseded run looks like that a moment. */
const GREEN_BUDGET_BLOCKED = 5;
