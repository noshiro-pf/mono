/**
 * What `start-issue` does with an issue (`spec/commands.md`, `start-issue`):
 * start it, plan it, release it, or refuse, and why. A refusal someone may
 * overrule (`--force`) is told from one nothing overrules.
 */

import { Arr } from 'ts-data-forge';
import {
  type IssueClaim,
  hasLabel,
  IssueLabel,
} from '../conventions/index.mjs';

/**
 * Whether to start or plan an issue, and whether to take `planned` off as it is
 * started: one someone else claimed, or one already started by the label or by
 * an open pull request, is refused unless `force`d; one that is closed, or is a
 * pull request, or a plan for one that is started, is refused whatever.
 */
export const decideStartIssue = (
  issue: StartIssueFacts,
  ask: Readonly<{ mode: 'plan' | 'start'; by: string; force: boolean }>,
): StartDecision => {
  const nothingToStart = refuseNothingToStart(issue);

  if (nothingToStart !== undefined) {
    return nothingToStart;
  }

  if (ask.mode === 'plan' && hasLabel(issue.labels, IssueLabel.inProgress)) {
    return {
      kind: 'refuse',
      reason: `it is labelled ${IssueLabel.inProgress}: started, not planned (--release takes that off first)`,
      overridable: false,
    };
  }

  if (!ask.force && issue.claim !== undefined && issue.claim.by !== ask.by) {
    return {
      kind: 'refuse',
      reason: claimedBy(issue.claim),
      overridable: true,
    };
  }

  if (!ask.force && Arr.isNonEmpty(issue.closers)) {
    return {
      kind: 'refuse',
      reason: `open pull request ${issue.closers.map((number) => `#${number}`).join(', ')} closes it`,
      overridable: true,
    };
  }

  // A label no claim of the claimant's accounts for: put on by hand, or by
  // someone else's claim that has since lapsed.
  const label =
    ask.mode === 'start' ? IssueLabel.inProgress : IssueLabel.planned;

  if (
    !ask.force &&
    issue.lastClaimant !== ask.by &&
    hasLabel(issue.labels, label)
  ) {
    return {
      kind: 'refuse',
      reason: `it is already labelled ${label}`,
      overridable: true,
    };
  }

  return {
    kind: 'claim',
    state: ask.mode === 'start' ? 'started' : 'planned',
    label,
    removePlanned:
      ask.mode === 'start' && hasLabel(issue.labels, IssueLabel.planned),
  };
};

/**
 * Whether to release an issue, and what to take off: one someone else holds a
 * claim on is refused unless `force`d, and a pull request whatever.
 */
export const decideReleaseIssue = (
  issue: StartIssueFacts,
  ask: Readonly<{ by: string; force: boolean }>,
): ReleaseDecision =>
  issue.pullRequest
    ? REFUSE_PULL_REQUEST
    : !ask.force && issue.claim !== undefined && issue.claim.by !== ask.by
      ? ({
          kind: 'refuse',
          reason: claimedBy(issue.claim),
          overridable: true,
        } as const)
      : ({
          kind: 'release',
          releaseClaimOf: issue.lastClaimant,
          removeLabels: [IssueLabel.inProgress, IssueLabel.planned].filter(
            (label) => hasLabel(issue.labels, label),
          ),
        } as const);

/**
 * Whether the claim read back after writing is the one written, `by`'s and in
 * its `state`: of two claims written within the pause before the read back, the
 * oldest comment holds, and the other has lost, its claimant's own other run
 * included. One written after the read back is not seen (no compare-and-swap).
 */
export const readBackVerdict = (
  held: IssueClaim | undefined,
  wrote: Readonly<{ by: string; state: IssueClaim['state'] }>,
): ReadBackVerdict =>
  held === undefined
    ? ({ kind: 'none' } as const)
    : ({
        kind:
          held.by === wrote.by && held.state === wrote.state
            ? ('held' as const)
            : ('lost' as const),
        held,
      } as const);

/**
 * `held` or `lost` with the claim read back; `none` when the record read back
 * holds no claim, released or lapsed meanwhile.
 */
export type ReadBackVerdict = Readonly<
  { kind: 'held' | 'lost'; held: IssueClaim } | { kind: 'none' }
>;

/** What {@link decideStartIssue} and {@link decideReleaseIssue} read. */
export type StartIssueFacts = Readonly<{
  open: boolean;
  /** The issues route answers for a pull request too. */
  pullRequest: boolean;
  labels: readonly string[];
  /** The open pull requests that close it by keyword, lowest first. */
  closers: readonly number[];
  /** This account's claim on it while it holds. */
  claim: IssueClaim | undefined;
  /**
   * Who the claim comment names, holding or not: a lapsed plan is still its
   * claimant's to write again, and the label it put on is still its own.
   */
  lastClaimant: string | undefined;
}>;

/** A refusal, and whether `--force` goes past it. */
export type StartIssueRefusal = Readonly<{
  kind: 'refuse';
  reason: string;
  overridable: boolean;
}>;

export type StartDecision =
  | StartIssueRefusal
  | Readonly<{
      kind: 'claim';
      state: IssueClaim['state'];
      label: (typeof IssueLabel)[keyof typeof IssueLabel];
      removePlanned: boolean;
    }>;

export type ReleaseDecision =
  | StartIssueRefusal
  | Readonly<{
      kind: 'release';
      /**
       * Whose standing claim comment is rewritten as released; none when
       * `undefined`.
       */
      releaseClaimOf: string | undefined;
      removeLabels: readonly string[];
    }>;

const REFUSE_PULL_REQUEST = {
  kind: 'refuse',
  reason: 'it is a pull request, not an issue',
  overridable: false,
} as const satisfies StartIssueRefusal;

const refuseNothingToStart = (
  issue: StartIssueFacts,
): StartIssueRefusal | undefined =>
  issue.pullRequest
    ? REFUSE_PULL_REQUEST
    : issue.open
      ? undefined
      : ({
          kind: 'refuse',
          reason: 'it is closed',
          overridable: false,
        } as const);

const claimedBy = (claim: IssueClaim): string =>
  `${claim.by} ${claim.state} it at ${claim.at}` as const;
