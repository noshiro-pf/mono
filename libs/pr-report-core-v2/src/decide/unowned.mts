/**
 * What `report-unowned-prs` files (`spec/commands.md`, `report-unowned-prs`):
 * an issue for each queued pull request nobody owns, once.
 */

import { Arr, Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import {
  unownedReportMarker,
  unownedReportTitle,
} from '../conventions/index.mjs';
import type { PullRequestFacts, ReadError } from '../snapshot/index.mjs';
import type { PullRequestDecision } from './queue.mjs';
import type { QueueComments } from './set-aside.mjs';

/**
 * The queued pull requests whose owner is `none`, and those not known to be
 * owned or not known with what a report carries (`unread`). Every pull request in the queue is the worker's, a skill's or a
 * person's; `none` means the rules met a state they do not cover, and the pull
 * request waits for nothing that will come. That is a bug in the queue's
 * tooling, so it is filed as one rather than left for someone to notice the
 * queue has stopped.
 *
 * Those are said apart (**Changed in v2**: v1 passed over an unread owner).
 * The queue gives one it does not cover no owner, read or not.
 */
export const findUnowned = (
  pullRequests: readonly UnownedPullRequest[],
): UnownedFound =>
  ({
    unowned: Arr.generate(function* () {
      for (const { facts, owner, comments, stackedOn } of pullRequests) {
        if (
          Result.isOk(owner) &&
          owner.value?.owner === 'none' &&
          Result.isOk(comments)
        ) {
          yield {
            facts,
            stackedOn,
            reason: owner.value.reason,
            comments: comments.value,
          };
        }
      }
    }),
    // Two passes rather than one that pushes: the immutable form.
    unread: Arr.generate(function* () {
      for (const { facts, owner, comments } of pullRequests) {
        // Not filtered by `isQueueCovered` again: the owner is `decideQueue`'s,
        // which gives one the queue does not cover no owner, read or not.
        if (Result.isErr(owner)) {
          yield {
            pr: facts.number,
            unread: 'owner',
            error: owner.value,
          } as const;
        } else if (owner.value?.owner === 'none' && Result.isErr(comments)) {
          // `decideQueue` decides the owner from the comments, so this is not
          // reached from it. Left to a later run that reads them, so that the one
          // report filed carries them.
          yield {
            pr: facts.number,
            unread: 'comments',
            error: comments.value,
          } as const;
        }
      }
    }),
  }) as const;

/**
 * What to file for each pull request {@link findUnowned} found nobody owns,
 * given the reports already open (`reports`): one with a report is said, not
 * filed again.
 */
export const planUnownedReports = (
  unowned: readonly Unowned[],
  reports: readonly UnownedReport[],
): UnownedPlan => {
  const issueOf = (pr: number): number | undefined =>
    reports.find((report) => report.pr === pr)?.issue;

  return {
    toFile: unowned
      .filter(({ facts }) => issueOf(facts.number) === undefined)
      .map((pr) => ({
        pr: pr.facts.number,
        title: unownedReportTitle(pr.facts.number),
        body: reportBody(pr),
      })),
    reported: Arr.generate(function* () {
      for (const { facts } of unowned) {
        const issue = issueOf(facts.number);

        if (issue !== undefined) {
          yield { pr: facts.number, issue };
        }
      }
    }),
  };
};

/** What {@link findUnowned} reads of a pull request's facts. */
export type UnownedFacts = StrictPick<
  PullRequestFacts,
  'baseRef' | 'headRef' | 'headSha' | 'labels' | 'number'
>;

/** What {@link findUnowned} reads of a queue's decision. */
export type UnownedPullRequest = Readonly<
  StrictPick<PullRequestDecision, 'comments' | 'owner' | 'stackedOn'> & {
    facts: UnownedFacts;
  }
>;

/** A queued pull request nobody owns, and what the queue knows of it. */
export type Unowned = Readonly<{
  facts: UnownedFacts;
  stackedOn: number | undefined;
  /** Why its owner is `none`. */
  reason: string;
  comments: QueueComments;
}>;

export type UnownedFound = Readonly<{
  unowned: readonly Unowned[];
  /**
   * Queued pull requests whose owner could not be read, or, for one nobody
   * owns, its comments, and why.
   */
  unread: readonly Readonly<{
    pr: number;
    unread: 'comments' | 'owner';
    error: ReadError;
  }>[];
}>;

/** An open report: the issue, and the pull request it reports. */
export type UnownedReport = Readonly<{ issue: number; pr: number }>;

/** The reports to file, and the pull requests already reported, and where. */
export type UnownedPlan = Readonly<{
  toFile: readonly Readonly<{ pr: number; title: string; body: string }>[];
  reported: readonly UnownedReport[];
}>;

const describeComment = (says: unknown): string =>
  says === undefined ? 'none' : (`\`${JSON.stringify(says)}\`` as const);

const reportBody = ({ facts, stackedOn, reason, comments }: Unowned): string =>
  [
    unownedReportMarker(facts.number),
    '',
    `#${facts.number} is in the merge queue, and \`queueOwner\` (\`libs/pr-report-core-v2/src/decide/owner.mts\`) gives it to nobody: the worker, the skills and the people working the queue each leave it to the others.`,
    '',
    `- Why: ${reason}`,
    `- Labels: ${Arr.isNonEmpty(facts.labels) ? facts.labels.map(({ name }) => `\`${name}\``).join(', ') : 'none'}`,
    `- Head: \`${facts.headRef}\` at \`${facts.headSha}\`, onto \`${facts.baseRef}\`${stackedOn === undefined ? '' : ` (stacked on #${stackedOn})`}`,
    `- Set-aside comment: ${describeComment(comments.setAside?.says)}`,
    `- Claim: ${describeComment(comments.claim?.says)}`,
    '',
    'Give the state an owner in `owner.mts` (with a test), or make the writer that produced it stop producing it. Then the pull request needs whatever its new owner does; until then a person moves it by hand.',
    '',
    'Filed by `report-unowned-prs`.',
  ].join('\n');
