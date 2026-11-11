/**
 * What `claim-pr` reads of one pull request over REST: whether it is one and
 * open, the head a claim is made at, and this account's claim comment.
 */

import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  parsePullRequestClaimComment,
  type ClaimComment,
  type FoundRecord,
  type PullRequestClaim,
} from '../conventions/index.mjs';
import type { Read } from '../snapshot/index.mjs';
import { isGone, isNotFound } from './classify.mjs';
import { readOwnRecord } from './rest-pull-requests.mjs';
import { restGet } from './rest.mjs';
import type { ReadContext } from './transport.mjs';

/**
 * Pull request `number`'s head and state, and the oldest claim comment of
 * `viewer` on it, read from every page.
 */
export const readPullRequestClaim = async (
  context: ReadContext,
  number: number,
  viewer: string,
): Promise<Read<PullRequestClaimRead>> => {
  const [pull, comment] = await Promise.all([
    readPullHead(context, number),
    readOwnPullRequestClaim(context, number, viewer),
  ]);

  if (Result.isErr(pull)) {
    return pull;
  }

  return Result.map(comment, (found) => ({
    open: stateOf(pull.value) === 'open',
    headSha: pull.value.head.sha,
    comment: found,
  }));
};

/**
 * The oldest claim comment of `viewer` on `number`, read from every page; it
 * reads no state of the pull request, nor whether `number` names one.
 */
export const readOwnPullRequestClaim = async (
  context: ReadContext,
  number: number,
  viewer: string,
): Promise<Read<FoundRecord<ClaimComment<PullRequestClaim>> | undefined>> =>
  readOwnRecord(context, number, viewer, parsePullRequestClaimComment);

/**
 * Whether `number` names a pull request, and whether it is open, in one
 * request: `none` for a 404 or a 410, as the snapshot reads them. GitHub
 * answers 404 too for a repository the token cannot see, so the caller has read
 * the repository first.
 */
export const readPullRequestState = async (
  context: ReadContext,
  number: number,
): Promise<Read<PullRequestState>> => {
  const pull = await readPullHead(context, number);

  return Result.isErr(pull) && (isNotFound(pull.value) || isGone(pull.value))
    ? Result.ok('none')
    : Result.map(pull, stateOf);
};

export type PullRequestState = 'open' | 'closed' | 'none';

export type PullRequestClaimRead = Readonly<{
  open: boolean;
  headSha: string;
  /** The claim comment, holding or not, which a new claim is written over. */
  comment: FoundRecord<ClaimComment<PullRequestClaim>> | undefined;
}>;

const readPullHead = async (
  context: ReadContext,
  number: number,
): Promise<Read<t.TypeOf<typeof PullHeadSchema>>> =>
  restGet(context, `#${number}`, `/pulls/${number}`, PullHeadSchema);

const stateOf = ({
  state,
}: t.TypeOf<typeof PullHeadSchema>): 'open' | 'closed' =>
  state === 'open' ? 'open' : 'closed';

const PullHeadSchema = t.record({
  state: t.string(),
  head: t.record({ sha: t.string() }),
});
