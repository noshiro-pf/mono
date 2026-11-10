/**
 * What a pull request's own review holds (`spec/decisions.md`, "Review holds"):
 * an approval from a code owner of every owned path it changes, and every
 * review conversation resolved, where the rules ask for them. No check reports
 * either, and `reviewDecision` is `null` under a ruleset, so a pull request
 * missing one would go green and sit; it is held in the queue instead.
 *
 * Except one only its author owns the waiting paths of: GitHub does not let an
 * author approve, so it merges by a ruleset bypass or not at all, and is
 * released and watched unarmed (`bypass`).
 */

import { Arr } from 'ts-data-forge';
import type { ChangedFile, ReviewFacts } from '../snapshot/index.mjs';
import {
  codeOwnerReview,
  type CodeOwnerGate,
  type CodeOwnerReview,
  type CodeOwnersRule,
} from './code-owners.mjs';

/**
 * The {@link ReviewState} of a pull request by `author` from what was read of
 * its review: the latest approving review of each login, and every changed path
 * — a rename's or copy's old path too, which a check enforcing `CODEOWNERS`
 * counts. A rename or copy whose old path the reader was not told leaves the
 * list incomplete.
 */
export const reviewStateOf = (
  author: string,
  review: ReviewFacts,
): ReviewState =>
  ({
    author,
    approvers: review.latestReviews
      .filter(({ state }) => state === 'APPROVED')
      .map(({ login }) => login),
    files: Arr.uniq(review.files.flatMap(pathsOf)),
    filesComplete: review.filesComplete && review.files.every(namesEveryPath),
    unresolvedConversations: review.unresolvedConversations,
    pushers: review.pushers,
  }) as const;

/**
 * What the review does to the pull request, or `undefined` when nothing holds
 * it or it cannot be told: the watch still catches one that goes green and does
 * not merge.
 */
export const reviewHold = (
  state: ReviewState,
  rules: ReviewRules,
): ReviewHold | undefined => {
  const codeOwners = codeOwnerReviewOf(state, rules);

  const open = state.unresolvedConversations;

  const conversations =
    open !== 'unknown' && rules.requireConversationResolution && open > 0
      ? (`${open} unresolved review ${open === 1 ? 'conversation' : 'conversations'}` as const)
      : undefined;

  // Under a check that lets the author stand for what they own, who pushed can
  // decide whether anything waits ({@link pushersMatter}); not read, that is
  // not known, and an unknown answer holds nothing.
  if (
    codeOwners.state !== 'required' ||
    (state.pushers === 'unknown' && pushersMatter(state, rules, codeOwners))
  ) {
    return conversations === undefined
      ? undefined
      : { kind: 'held', reason: conversations };
  }

  const onlyTheAuthor = codeOwners.owners.every(
    (owner) => owner.toLowerCase() === state.author.toLowerCase(),
  );

  if (onlyTheAuthor && conversations === undefined) {
    return {
      kind: 'bypass',
      reason: bypassReason(codeOwners.owners, codeOwners.paths),
    };
  }

  return {
    kind: 'held',
    reason: [
      `waiting for ${codeOwners.owners.map((owner) => `@${owner}`).join(' or ')} to approve ${describePaths(codeOwners.paths)}`,
      codeOwners.authorOwns
        ? ' — which the author owns, and may not approve'
        : '',
      conversations === undefined ? '' : `; ${conversations}`,
    ].join(''),
  };
};

/**
 * Why only a ruleset bypass merges a pull request, as the page and the worker
 * both say it (#2757).
 */
export const bypassReason = (
  owners: readonly string[],
  paths: readonly string[],
): string =>
  `${owners.map((owner) => `@${owner}`).join(', ')} is the only owner of ${describePaths(paths)} and its author, who may not approve it` as const;

/**
 * Where the pull request stands with the owners under whatever enforces
 * `CODEOWNERS`; apart, for a reader that has to tell a wait it cannot see from
 * no wait.
 */
export const codeOwnerReviewOf = (
  state: ReviewState,
  rules: ReviewRules,
): CodeOwnerReview => {
  const gate =
    rules.codeOwnerGate ??
    (rules.requireCodeOwnerReview ? ('ruleset' as const) : undefined);

  return codeOwnerReview({
    required: gate !== undefined,
    rules: rules.codeOwners,
    files: state.files,
    filesComplete: state.filesComplete,
    approvers: state.approvers,
    author: state.author,
    authorApproves: gate === 'check',
    ...(state.pushers === undefined ? {} : { pushers: state.pushers }),
  });
};

/**
 * Whether who pushed could change the answer: only then is the branch's
 * activity worth a request.
 */
export const pushersMatter = (
  state: ReviewState,
  rules: ReviewRules,
  /** {@link codeOwnerReviewOf} with the pushers `unknown`, when worked out. */
  unknownPushers: CodeOwnerReview = codeOwnerReviewOf(
    { ...state, pushers: 'unknown' },
    rules,
  ),
): boolean =>
  unknownPushers.state !==
  codeOwnerReviewOf({ ...state, pushers: [state.author] }, rules).state;

/** What is read about one pull request to decide. */
export type ReviewState = Readonly<{
  author: string;
  /** Logins whose latest review approves. */
  approvers: readonly string[];
  /** Every changed path read, the old path of a rename or copy included. */
  files: readonly string[];
  /** Whether `files` is every path the pull request changes. */
  filesComplete: boolean;
  /** `unknown` for a reader that cannot tell, which holds nothing. */
  unresolvedConversations: number | 'unknown';
  /** Who pushed to its branch, where read. */
  pushers?: readonly string[] | 'unknown';
}>;

export type ReviewRules = Readonly<{
  requireCodeOwnerReview: boolean;
  requireConversationResolution: boolean;
  codeOwners: readonly CodeOwnersRule[];
  /**
   * What enforces `CODEOWNERS` (`codeOwnerGate`). Absent, it is the ruleset
   * where `requireCodeOwnerReview` says so, and nothing otherwise.
   */
  codeOwnerGate?: CodeOwnerGate;
}>;

/**
 * `held` waits for an approval or a resolved conversation; `bypass` waits for
 * nobody, since only its author owns what is waiting.
 */
export type ReviewHold = Readonly<{ kind: 'bypass' | 'held'; reason: string }>;

/** How many waiting paths are named before the rest are counted. */
const PATHS_NAMED = 2;

const describePaths = (paths: readonly string[]): string =>
  paths.length <= PATHS_NAMED + 1
    ? paths.join(', ')
    : (`${paths.slice(0, PATHS_NAMED).join(', ')} and ${paths.length - PATHS_NAMED} more` as const);

const pathsOf = ({ path, previousPath }: ChangedFile): readonly string[] =>
  previousPath === undefined
    ? ([path] as const)
    : ([path, previousPath] as const);

const namesEveryPath = ({ change, previousPath }: ChangedFile): boolean =>
  (change !== 'renamed' && change !== 'copied') || previousPath !== undefined;
