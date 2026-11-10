/**
 * Issue start states and tiers (`spec/decisions.md`, "Issue start states" and
 * "Issue tiers").
 */

import { Arr } from 'ts-data-forge';
import {
  hasLabel,
  issueClaimHolds,
  IssueLabel,
  parseStartAfter,
  type ClaimComment,
  type IssueClaim,
} from '../conventions/index.mjs';
import type { ReferenceFacts } from '../snapshot/index.mjs';
import { findCycles } from './graph.mjs';

/** What an issue waits for: its `Start-After:`, then "blocked by", each once. */
export const waitsFor = (
  body: string,
  blockedBy: readonly number[],
): readonly number[] => Arr.uniq(parseStartAfter(body).concat(blockedBy));

/**
 * Where a named issue stands. One closed with no reason recorded is taken as
 * completed.
 */
export const issueStatusOf = (
  issue: Readonly<{ state: string; stateReason: string | undefined }>,
): ReferenceStatus =>
  issue.state.toLowerCase() === 'open'
    ? 'waiting'
    : (issue.stateReason?.toLowerCase() ?? 'completed') === 'completed'
      ? 'done'
      : 'abandoned';

/** Where a named number that is not an issue stands. */
export const referenceStatusOf = (facts: ReferenceFacts): ReferenceStatus =>
  facts.kind === 'unknown'
    ? 'unknown'
    : facts.state.toLowerCase() === 'open'
      ? 'waiting'
      : facts.merged
        ? 'done'
        : 'abandoned';

/**
 * Each issue's {@link StartState}. The listed issues are `waiting` whatever
 * `statusOf` says; cycles are found among their declarations alone. Not
 * transitive.
 */
export const decideStartStates = (
  issues: readonly Readonly<{
    number: number;
    startAfter: readonly number[];
  }>[],
  statusOf: (number: number) => ReferenceStatus,
): ReadonlyMap<number, StartState> => {
  const open = new Set(issues.map(({ number }) => number));

  const onCycle = new Set(
    findCycles(
      new Map(issues.map(({ number, startAfter }) => [number, startAfter])),
    ).flat(),
  );

  const status = (number: number): ReferenceStatus =>
    open.has(number) ? 'waiting' : statusOf(number);

  return new Map(
    issues.map(({ number, startAfter }) => {
      const statuses = new Set(startAfter.map(status));

      const state: StartState = onCycle.has(number)
        ? 'cycle'
        : statuses.has('waiting')
          ? 'blocked'
          : statuses.has('abandoned') || statuses.has('unknown')
            ? 'attention'
            : Arr.isNonEmpty(startAfter)
              ? 'ready'
              : 'free';

      return [number, state];
    }),
  );
};

/**
 * The {@link IssueProgress} of an issue. Being worked on wins over being
 * planned. **Changed in v2** (#3233): a claim that holds counts as its label.
 */
export const progressOf = ({
  labels,
  closedByOpenPull,
  claim,
  nowEpochMs,
}: Readonly<{
  labels: readonly string[];
  closedByOpenPull: boolean;
  /** This account's claim comment on it, if any. */
  claim: ClaimComment<IssueClaim> | undefined;
  nowEpochMs: number;
}>): IssueProgress => {
  const held =
    claim?.kind === 'standing' && issueClaimHolds(claim.claim, nowEpochMs)
      ? claim.claim.state
      : undefined;

  return closedByOpenPull ||
    held === 'started' ||
    hasLabel(labels, IssueLabel.inProgress)
    ? 'in-progress'
    : held === 'planned' || hasLabel(labels, IssueLabel.planned)
      ? 'planned'
      : 'none';
};

/** The state an issue is shown in: its progress once it is startable. */
export const withProgress = (
  state: StartState,
  progress: IssueProgress,
): IssueStartState =>
  progress !== 'none' && (state === 'free' || state === 'ready')
    ? progress
    : state;

/** The issues an open pull request closes. */
export const issuesInProgress = (
  pulls: readonly Readonly<{ closes: readonly number[] }>[],
): ReadonlySet<number> => new Set(pulls.flatMap(({ closes }) => closes));

export const issueTierLabel = (tier: IssueTier): `priority:${IssueTier}` =>
  `priority:${tier}` as const;

export const parseIssueTier = (raw: string): IssueTier | undefined =>
  ISSUE_TIERS.find((tier) => tier === raw);

/** The one tier an issue carries, `none`, or `several`. */
export const issueTierOf = (
  labels: readonly string[],
): IssueTier | 'none' | 'several' => {
  const carried = ISSUE_TIERS.filter((tier) =>
    hasLabel(labels, issueTierLabel(tier)),
  );

  return Arr.isFixedLengthArray(1, carried)
    ? carried[0]
    : Arr.isNonEmpty(carried)
      ? 'several'
      : 'none';
};

/**
 * The order sessions start issues in, as a sort key: `S`, `A`, `B`, `C`, then
 * none (and `hold`, `close`, `several`), then `D`.
 */
export const issueStartRank = (labels: readonly string[]): number => {
  const tier = issueTierOf(labels);

  switch (tier) {
    case 'S':
      return 0;

    case 'A':
      return 1;

    case 'B':
      return 2;

    case 'C':
      return 3;

    case 'D':
      return 5;

    case 'hold':
    case 'close':
    case 'none':
    case 'several':
      return 4;
  }
};

/**
 * Where one number a declaration names stands: `waiting` while open,
 * `done` once merged or closed as completed, `abandoned` when closed otherwise,
 * `unknown` when it names nothing the reader may see.
 */
export type ReferenceStatus = 'abandoned' | 'done' | 'unknown' | 'waiting';

/**
 * How an issue stands for being started, the first that applies: on a
 * `Start-After` cycle; `blocked` by something open; `attention` for something
 * abandoned or unknown; `ready` with everything named done; `free` naming
 * nothing.
 */
export type StartState = 'attention' | 'blocked' | 'cycle' | 'free' | 'ready';

/**
 * How far someone has got with an issue: `in-progress` when an open pull
 * request closes it, it is labelled `in-progress`, or a `started` claim holds;
 * `planned` when labelled `planned` or a `planned` claim holds.
 */
export type IssueProgress = 'in-progress' | 'none' | 'planned';

/** A {@link StartState}, or the progress of a startable issue. */
export type IssueStartState = StartState | 'in-progress' | 'planned';

export const ISSUE_TIERS = ['S', 'A', 'B', 'C', 'D', 'hold', 'close'] as const;

export type IssueTier = (typeof ISSUE_TIERS)[number];

/** The tiers an issue may be filed in: not `close`. */
export const FILING_TIERS = [
  'S',
  'A',
  'B',
  'C',
  'D',
  'hold',
] as const satisfies readonly IssueTier[];
