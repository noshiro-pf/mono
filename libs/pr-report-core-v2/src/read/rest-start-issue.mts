/**
 * What `start-issue` reads of one issue before it writes, over REST: the issue,
 * the open pull requests closing it, and this account's claim comment on it.
 */

import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  closingKeywordIssuesInHtml,
  parseIssueClaimComment,
  type ClaimComment,
  type FoundRecord,
  type IssueClaim,
} from '../conventions/index.mjs';
import { heldIssueClaim, type StartIssueFacts } from '../decide/index.mjs';
import type { Read } from '../snapshot/index.mjs';
import {
  LabelSchema,
  OPEN_PULLS_PATH,
  readOwnRecord,
} from './rest-pull-requests.mjs';
import { RenderedBodySchema, restAllPages, restGet } from './rest.mjs';
import type { ReadContext } from './transport.mjs';

/**
 * Issue `number` as {@link StartIssueFacts}, and the claim comment a new claim
 * is written over. The open pull requests are read only `withClosers`: a
 * release, or a start past every refusal, does not ask.
 */
export const readStartIssue = async (
  context: ReadContext,
  number: number,
  options: Readonly<{
    viewer: string;
    nowEpochMs: number;
    withClosers: boolean;
  }>,
): Promise<Read<StartIssueRead>> => {
  // The claim is read last, after every page of the open pull requests, just
  // before the caller writes over it. GitHub has no compare-and-swap, so a
  // claim written in between is overwritten unseen; reading it last makes that
  // moment as short as it can be.
  const [issue, closers] = await Promise.all([
    restGet(context, `issue #${number}`, `/issues/${number}`, IssueSchema),
    options.withClosers
      ? readClosers(context, number)
      : Promise.resolve(Result.ok([])),
  ]);

  if (Result.isErr(issue)) {
    return issue;
  }

  if (Result.isErr(closers)) {
    return closers;
  }

  const comment = await readIssueClaim(context, number, options.viewer);

  if (Result.isErr(comment)) {
    return comment;
  }

  const says = comment.value?.says;

  return Result.ok({
    facts: {
      open: issue.value.state === 'open',
      pullRequest: issue.value.pull_request !== undefined,
      labels: issue.value.labels.map(({ name }) => name),
      closers: closers.value,
      claim: heldIssueClaim(says, options.nowEpochMs),
      lastClaimant: says?.kind === 'standing' ? says.claim.by : undefined,
    },
    comment: comment.value,
  });
};

/**
 * This account's claim comment on issue `number`, the oldest one, read from
 * every page: a claim posted on an issue with a hundred comments is on the
 * second.
 */
export const readIssueClaim = async (
  context: ReadContext,
  number: number,
  viewer: string,
): Promise<Read<FoundRecord<ClaimComment<IssueClaim>> | undefined>> =>
  readOwnRecord(context, number, viewer, parseIssueClaimComment);

export type StartIssueRead = Readonly<{
  facts: StartIssueFacts;
  /** The claim comment, holding or not, which a new claim is written over. */
  comment: FoundRecord<ClaimComment<IssueClaim>> | undefined;
}>;

const IssueSchema = t.record({
  state: t.string(),
  pull_request: t.optional(t.record({})),
  labels: t.array(LabelSchema),
});

const PullBodySchema = t.record({
  number: t.number(),
  body_html: RenderedBodySchema,
});

/**
 * When issue `number` last changed, as `run-issue-resolver` records an issue a
 * session left, to hand it on again once someone changes it.
 */
export const readIssueUpdatedAt = async (
  context: ReadContext,
  number: number,
): Promise<Read<string>> =>
  Result.map(
    await restGet(
      context,
      `issue #${number}`,
      `/issues/${number}`,
      IssueUpdatedAtSchema,
    ),
    ({ updated_at }) => updated_at,
  );

/**
 * The open pull requests whose bodies close issue `number`, lowest first, read
 * from GitHub's rendering as v1 read them: GitHub marks the keywords it
 * recognized, so what it does not render (code, a comment) closes nothing.
 */
const readClosers = async (
  context: ReadContext,
  number: number,
): Promise<Read<readonly number[]>> =>
  Result.map(
    await restAllPages(
      context,
      'the open pull requests',
      OPEN_PULLS_PATH,
      t.array(PullBodySchema),
      'full',
    ),
    (pulls) =>
      pulls
        .filter(({ body_html: html }) =>
          closingKeywordIssuesInHtml(context, html).includes(number),
        )
        .map((pull) => pull.number)
        .toSorted((a, b) => a - b),
  );

const IssueUpdatedAtSchema = t.record({ updated_at: t.string() });
