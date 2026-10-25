/**
 * What the queue's two kinds of comment on one pull request say together:
 * the set-aside comment `unblock-prs` writes (`set-aside.mts`) and the claim
 * whoever is fixing it writes (`claim.mts`).
 */

import { Arr } from 'ts-data-forge';
import {
  claimApplies,
  parseClaimComment,
  type ClaimComment,
} from './claim.mjs';
import {
  parseSetAsideComment,
  setAsideApplies,
  type SetAsideComment,
} from './set-aside.mjs';

/**
 * One comment, by the reader's own account: the caller filters by author,
 * because how it knows who wrote a comment depends on the API it read.
 */
export type OwnComment = Readonly<{ id: number; body: string }>;

export type QueueComments = Readonly<{
  setAside: QueueComment<SetAsideComment> | undefined;
  claim: QueueComment<ClaimComment> | undefined;
}>;

export type QueueComment<A> = Readonly<{
  /** The REST id, which editing it in place takes. */
  commentId: number;
  says: A;
  /**
   * For the set-aside comment, whether `unblock-prs` is leaving the pull
   * request alone: standing, at the head and the base it is at now, and no
   * retry asked for — a ticked box means the next survey tries it again. For
   * the claim, whether it still holds (`claimApplies`).
   */
  applies: boolean;
}>;

/**
 * Reads `comments`, oldest first, for the oldest comment of each kind: each
 * is one comment edited in place, and of several the oldest is the one.
 */
export const readQueueComments = (
  comments: readonly OwnComment[],
  state: Readonly<{
    headSha: string;
    /** The tip of the default branch, which the set-aside was recorded against. */
    baseTip: string;
    nowEpochMs: number;
  }>,
): QueueComments => {
  const setAside = Arr.generate(function* () {
    for (const { id, body } of comments) {
      const says = parseSetAsideComment(body);

      if (says !== undefined) {
        yield { commentId: id, says };
      }
    }
  }).at(0);

  const claim = Arr.generate(function* () {
    for (const { id, body } of comments) {
      const says = parseClaimComment(body);

      if (says !== undefined) {
        yield { commentId: id, says };
      }
    }
  }).at(0);

  return {
    setAside:
      setAside === undefined
        ? undefined
        : {
            ...setAside,
            applies:
              setAside.says.kind === 'standing' &&
              !setAside.says.retry &&
              setAsideApplies(
                setAside.says.setAside,
                state.headSha,
                state.baseTip,
              ),
          },
    claim:
      claim === undefined
        ? undefined
        : {
            ...claim,
            applies:
              claim.says.kind === 'standing' &&
              claimApplies(claim.says.claim, state.headSha, state.nowEpochMs),
          },
  };
};
