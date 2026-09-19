/** What the observed state allows, and nothing that talks to GitHub. */

import { Arr } from 'ts-data-forge';
import { SKIP_CI_LABEL } from '../unblock-prs/labels.mjs';
import { type PullRequest } from './types.mjs';

/**
 * Why auto-merge must not be armed on this pull request yet, or `undefined`
 * when it may be.
 *
 * This is the whole of the ordering rule, in one function, and it is asked
 * against a **re-read** of the pull request rather than against what was
 * observed before the label was added. `skip-ci` is the only thing holding
 * the merge — the ruleset asks for no approvals, so outside CODEOWNERS paths
 * a green branch has nothing else to clear — so arming a pull request that
 * does not carry it is arming with nothing holding it. The window this closes
 * is small and entirely real: a label call that reported success but was
 * reverted, or a pull request someone else touched in between.
 */
export const armBlockedBy = (pr: PullRequest): string | undefined => {
  if (pr.state !== 'OPEN') return `it is ${pr.state}`;

  // GitHub refuses to arm a draft, so this would fail anyway; saying so here
  // means the failure names the reason rather than quoting `gh`.
  if (pr.isDraft) return 'it is a draft';

  return hasLabel(pr, SKIP_CI_LABEL)
    ? undefined
    : `${SKIP_CI_LABEL} is not on it, so arming would leave nothing holding the merge`;
};

/** Whether GitHub already holds an auto-merge request for this one. */
export const isArmed = (pr: PullRequest): boolean =>
  pr.autoMergeRequest !== null && pr.autoMergeRequest !== undefined;

/**
 * The `Merge-After:` line for a chained pull request, or `undefined` when
 * nothing was declared. One line, in the order given, which is the form
 * `unblock-prs` reads.
 */
export const mergeAfterTrailer = (
  numbers: readonly number[],
): string | undefined =>
  Arr.isNonEmpty(numbers)
    ? `Merge-After: ${numbers.map((n) => `#${n}`).join(', ')}`
    : undefined;

const hasLabel = (pr: PullRequest, name: string): boolean =>
  pr.labels.some((label) => label.name === name);
