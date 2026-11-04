import type { RebaseFailure } from './types.mjs';

/**
 * Whether a failure to release a candidate ends the cycle rather than letting
 * it try the next one.
 *
 * A failure that is the pull request's own — a real conflict, a stacked branch
 * whose own commits cannot be told, nothing left to merge (`ofPullRequest`) —
 * says nothing about the next candidate, so the cycle goes on. Any other — a
 * refused push, a fetch, auto-merge that could not be armed, a label that could
 * not be removed — GitHub may have caused, and in an outage every candidate
 * fails the same way: going down the list would set the whole queue aside in
 * seconds, with nothing to clear the reasons once GitHub recovers, since `main`
 * does not move. So one is set aside, and the next cycle tries the queue again.
 */
export const endsCycle = (failure: RebaseFailure): boolean =>
  failure.ofPullRequest !== true;
