/** What a session that ran comes to, read from its result and the claim after it. */

import type {
  ClaimComment,
  PullRequestClaim,
  QueueComment,
} from 'pr-report-core-v2';
import { mayHaveSpent, type ResultEvent } from '../../agent/index.mjs';

/**
 * What a session that ran comes to for its pull request, from its result and
 * the claim comment read once it ended.
 *
 * - `taken`: someone else holds a claim on it — they got there first. It is
 *   theirs until they push or let go, and handed on again after that.
 * - `not-started`: it failed before spending anything (a bad key, the API
 *   down). Tried again on the next look.
 * - `tried`: anything else — fixed, given up, out of budget, failed after
 *   spending, or ended with no result at all (crashed or stopped), where
 *   what it spent is unknown. Not handed on again until its head or its
 *   set-aside moves, so that no pull request is paid for twice as it stands.
 *
 * `releaseClaim` is whether the claim the session took is still standing:
 * it ran out or was stopped before it pushed or released, and holding the pull
 * request for the rest of two hours helps nobody.
 */
export const judgeSession = (
  result: ResultEvent | undefined,
  claimAfter: QueueComment<ClaimComment<PullRequestClaim>> | undefined,
  claimant: string,
): Readonly<{ verdict: SessionVerdict; releaseClaim: boolean }> => {
  const holder =
    claimAfter?.applies === true && claimAfter.says.kind === 'standing'
      ? claimAfter.says.claim.by
      : undefined;

  const verdict: SessionVerdict =
    holder !== undefined && holder !== claimant
      ? 'taken'
      : mayHaveSpent(result)
        ? 'tried'
        : 'not-started';

  return { verdict, releaseClaim: holder === claimant };
};

export type SessionVerdict = 'not-started' | 'taken' | 'tried';
