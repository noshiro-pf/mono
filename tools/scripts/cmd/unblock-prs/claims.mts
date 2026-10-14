/**
 * The pull requests a session has claimed, which this script leaves alone.
 *
 * A session claims a pull request this script set aside before fixing it
 * (`pnpm run claim-pr`; `pr-report-core`'s `claim.mts` says what a claim is).
 * Without one, the base moving would have this script try a set-aside
 * rebase again while the session is resolving the same conflict, and a
 * ticked retry box would do the same for any reason. So while a claim holds,
 * the pull request is a skill's (`owner.mts`): not picked and not kept on the
 * tip ("3a"). The session's
 * push ends the claim and hands the pull request back, as the push alone
 * always did. Pausing it with `skip-ci` is still done: the session pushes
 * under the label anyway.
 */

import { claimApplies, type Claim } from 'pr-report-core';
import type { PullRequest } from './types.mjs';

/**
 * The claims, read from this account's comments, that still hold the open
 * pull requests they name.
 */
export const standingClaims = (
  claims: ReadonlyMap<number, Claim>,
  pullRequests: readonly PullRequest[],
  nowEpochMs: number,
): ReadonlyMap<number, Claim> =>
  new Map(
    Array.from(claims).filter(([number, claim]) => {
      const pr = pullRequests.find((p) => p.number === number);

      return pr !== undefined && claimApplies(claim, pr.headRefOid, nowEpochMs);
    }),
  );
