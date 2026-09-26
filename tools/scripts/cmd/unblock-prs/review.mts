/**
 * What a pull request's own review says about whether its checks are worth
 * running yet.
 *
 * `main`'s ruleset asks for two things no check reports: an approval from a
 * code owner of every owned path the pull request touches, and every review
 * conversation resolved. A queued pull request missing either goes green and
 * sits there, and a rebase cannot change that. Released anyway, it costs a
 * full matrix and holds the queue for the length of a watch; and because
 * `main` moving is what puts it back in the running, it would be rebased and
 * run again every time anything else merged. So triage reads both before
 * picking, and leaves a pull request they hold in the queue with a note,
 * until an approval or a resolved conversation changes the answer.
 *
 * GitHub will not say this itself: `reviewDecision` describes branch
 * protection, not a ruleset, and is `null` for every pull request here. The
 * code-owner half is `pr-report-core`'s `codeOwnerReview`, worked out from
 * `CODEOWNERS` exactly as the Pull Requests Manager page works it out.
 */

import {
  codeOwnerReview,
  type CodeOwnersRule,
  type RulesetRequirements,
} from 'pr-report-core';
import { Arr } from 'ts-data-forge';

/** What is read about one pull request to decide. */
export type ReviewState = Readonly<{
  author: string;
  /** Logins whose latest review approves. */
  approvers: readonly string[];
  files: readonly string[];
  /** Whether `files` is every file the pull request changes. */
  filesComplete: boolean;
  unresolvedConversations: number;
}>;

export type ReviewRules = Readonly<{
  requireCodeOwnerReview: RulesetRequirements['requireCodeOwnerReview'];
  requireConversationResolution: RulesetRequirements['requireConversationResolution'];
  codeOwners: readonly CodeOwnersRule[];
}>;

/**
 * Why the review holds the pull request, as a phrase, or `undefined` when it
 * holds nothing. What cannot be told for sure — changed files past what
 * could be read — holds nothing: the watch still catches a pull request that
 * goes green and does not merge, and `demotions.mts` is what follows.
 */
export const reviewHold = (
  state: ReviewState,
  rules: ReviewRules,
): string | undefined => {
  const codeOwners = codeOwnerReview({
    required: rules.requireCodeOwnerReview,
    rules: rules.codeOwners,
    files: state.files,
    filesComplete: state.filesComplete,
    approvers: state.approvers,
    author: state.author,
  });

  const reasons = [
    codeOwners.state === 'required'
      ? [
          `waiting for ${codeOwners.owners.map((owner) => `@${owner}`).join(' or ')} to approve ${describePaths(codeOwners.paths)}`,
          // GitHub does not let an author approve their own pull request, so
          // this one waits for a bypass merge, not for time.
          codeOwners.authorOwns
            ? ' — which the author owns, and may not approve'
            : '',
        ].join('')
      : undefined,
    rules.requireConversationResolution && state.unresolvedConversations > 0
      ? `${state.unresolvedConversations} unresolved review ${state.unresolvedConversations === 1 ? 'conversation' : 'conversations'}`
      : undefined,
  ].filter((reason) => reason !== undefined);

  return Arr.isNonEmpty(reasons) ? reasons.join('; ') : undefined;
};

/** How many waiting paths are named before the rest are counted. */
const PATHS_NAMED = 2;

const describePaths = (paths: readonly string[]): string =>
  paths.length <= PATHS_NAMED + 1
    ? paths.join(', ')
    : `${paths.slice(0, PATHS_NAMED).join(', ')} and ${paths.length - PATHS_NAMED} more`;
