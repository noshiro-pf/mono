/**
 * What a pull request's own review says about whether its checks are worth
 * running yet.
 *
 * `main`'s ruleset asks for two things no check reports: an approval from a
 * code owner of every owned path the pull request touches, and every review
 * conversation resolved. A queued pull request missing either goes green and
 * sits there, and a rebase cannot change that. Released anyway, it costs a full
 * matrix and holds the queue for the length of a watch; and because `main`
 * moving is what puts it back in the running, it would be rebased and run again
 * every time anything else merged. So triage reads both before picking, and
 * leaves a pull request they hold in the queue with a note, until an approval
 * or a resolved conversation changes the answer.
 *
 * Except when nothing can change it: GitHub does not let an author approve
 * their own pull request, so one whose waiting paths only its author owns
 * merges by a ruleset bypass or not at all. Holding that one would hold it for
 * ever, with `skip-ci` on and no verdict for whoever makes the bypass merge to
 * go by. So it is released and watched like any other, with
 * auto-merge left off — it could never fire — until its checks report, and
 * then left for that person (`awaiting-bypass`).
 *
 * Not where a required check enforces `CODEOWNERS` instead of the ruleset
 * (`codeOwnerGate` is `'check'`): the check counts the author as approving what
 * they own, so such a pull request waits for nobody, and only someone else's
 * waits for an owner's approval — or an owner's that someone else pushed to
 * (`ReviewState.pushers`), whose only owner is again its author: a bypass.
 *
 * GitHub will not say this itself: `reviewDecision` describes branch
 * protection, not a ruleset, and is `null` for every pull request here. The
 * code-owner half is {@link codeOwnerReview}, worked out from `CODEOWNERS`.
 *
 * Here rather than in `unblock-prs` because the Pull Requests Manager page
 * draws the queue the worker picks from, and a pull request this holds is not
 * in the running there either (`queue-order.mts`).
 */

import {
  codeOwnerReview,
  type CodeOwnerGate,
  type CodeOwnerReview,
  type CodeOwnersRule,
} from './code-owners.mjs';
import type { RulesetRequirements } from './ruleset.mjs';

/** What is read about one pull request to decide. */
export type ReviewState = Readonly<{
  author: string;
  /** Logins whose latest review approves. */
  approvers: readonly string[];
  files: readonly string[];
  /** Whether `files` is every file the pull request changes. */
  filesComplete: boolean;
  unresolvedConversations: number;
  /** Who pushed to its branch, where read (`codeOwnerReview`'s `pushers`). */
  pushers?: readonly string[] | 'unknown';
}>;

export type ReviewRules = Readonly<{
  requireCodeOwnerReview: RulesetRequirements['requireCodeOwnerReview'];
  requireConversationResolution: RulesetRequirements['requireConversationResolution'];
  codeOwners: readonly CodeOwnersRule[];
  /**
   * What enforces `CODEOWNERS` (`codeOwnerGate`). Absent, it is the ruleset
   * where `requireCodeOwnerReview` says so, and nothing otherwise.
   */
  codeOwnerGate?: CodeOwnerGate;
}>;

/**
 * What the review does to the pull request: `held` waits for an approval or a
 * resolved conversation, `bypass` waits for nobody — only its author owns what
 * is waiting — and `undefined` holds nothing. What cannot be told for sure —
 * changed files past what could be read — holds nothing: the watch still
 * catches a pull request that goes green and does not merge, and
 * `demotions.mts` is what follows.
 */
export type ReviewHold = Readonly<{ kind: 'bypass' | 'held'; reason: string }>;

export const reviewHold = (
  state: ReviewState,
  rules: ReviewRules,
  /** {@link codeOwnerReviewOf} of the same two, when already worked out. */
  codeOwners: CodeOwnerReview = codeOwnerReviewOf(state, rules),
): ReviewHold | undefined => {
  const conversations =
    rules.requireConversationResolution && state.unresolvedConversations > 0
      ? (`${state.unresolvedConversations} unresolved review ${state.unresolvedConversations === 1 ? 'conversation' : 'conversations'}` as const)
      : undefined;

  if (codeOwners.state !== 'required') {
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
      reason: `${codeOwners.owners.map((owner) => `@${owner}`).join(', ')} is the only owner of ${describePaths(codeOwners.paths)} and its author, who may not approve it`,
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
 * The code-owner half of {@link reviewHold}: where the pull request stands with
 * the owners under whatever enforces `CODEOWNERS`. Apart, for a reader that has
 * to tell a wait it cannot see from no wait — `unblock-prs` holds a red check
 * that enforces the file on `unknown` rather than re-running it.
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

/** How many waiting paths are named before the rest are counted. */
const PATHS_NAMED = 2;

const describePaths = (paths: readonly string[]): string =>
  paths.length <= PATHS_NAMED + 1
    ? paths.join(', ')
    : (`${paths.slice(0, PATHS_NAMED).join(', ')} and ${paths.length - PATHS_NAMED} more` as const);
