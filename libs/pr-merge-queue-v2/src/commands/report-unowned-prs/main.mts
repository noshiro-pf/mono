/**
 * `report-unowned-prs`: files an issue for each queued pull request nobody owns
 * (`spec/commands.md`, `report-unowned-prs`), once per pull request: an open
 * issue this account filed carrying its marker is not filed again.
 *
 * It reads the owners from the whole queue, as `pr-report` reads them, and
 * writes as the token's account, which has to be the one `unblock-prs` runs as.
 * A caller that has read the queue already files through {@link reportUnowned}
 * with what it read.
 */

import {
  fileUnownedReport,
  findUnowned,
  planUnownedReports,
  readUnownedReports,
  type UnownedPullRequest,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import {
  messageOf,
  notWritten,
  openSession,
  type Session,
  type SessionWorld,
} from '../../github/index.mjs';
import { readQueue } from '../pr-report/index.mjs';
import type { ReportUnownedPrsOptions } from './options.mjs';

/** What was filed, or would be, or why nothing could be. */
export const reportUnownedPrs = async (
  options: ReportUnownedPrsOptions,
  world: ReportUnownedPrsWorld,
): Promise<Result<string, string>> => {
  const session = await openSession(options.repo, world);

  if (Result.isErr(session)) {
    return session;
  }

  // The whole queue, as v1 read it: only the whole snapshot decides an owner (a
  // stack, a merge-order cycle). A caller that has read it already calls
  // reportUnowned with what it read.
  const queue = await readQueue(session.value.context, world.nowEpochMs());

  if (Result.isErr(queue)) {
    return Result.err(`cannot read the queue: ${queue.value}`);
  }

  const outcome = await reportUnowned(
    session.value,
    queue.value.pullRequests,
    options.dryRun,
  );

  const text = outcome.lines.join('\n');

  return outcome.ok ? Result.ok(text) : Result.err(text);
};

/**
 * Files a report for each pull request of `pullRequests`, the queue just read,
 * that nobody owns and none reports yet, one at a time: GitHub limits how fast
 * content is created.
 *
 * `ok` is false, after filing all it can, when a report could not be filed, an
 * owner could not be read, or the comments of one nobody owns could not be,
 * which the report is to carry (**Changed in v2**: v1 said the first, passed
 * over the second, and exited 0 for both): each may leave the queue stopped
 * with nobody told. The issue list unread files nothing, and still says what
 * was unread.
 */
export const reportUnowned = async (
  { context, viewer }: StrictPick<Session, 'context' | 'viewer'>,
  pullRequests: readonly UnownedPullRequest[],
  dryRun: boolean,
): Promise<UnownedOutcome> => {
  const { unowned, unread } = findUnowned(pullRequests);

  const unreadLines = unread.map(({ pr, unread: what, error }) =>
    what === 'owner'
      ? `#${pr}: whether anyone owns it is not known: ${messageOf(error)}.`
      : `#${pr}: nobody owns it, and it is reported once its comments are read: ${messageOf(error)}.`,
  );

  const allRead = !Arr.isNonEmpty(unreadLines);

  if (!Arr.isNonEmpty(unowned)) {
    return {
      ok: allRead,
      lines: allRead ? [ALL_OWNED] : unreadLines,
    };
  }

  const reports = await readUnownedReports(context, viewer);

  if (Result.isErr(reports)) {
    return {
      ok: false,
      lines: Arr.toUnshifted(
        `cannot tell which are reported already, so none is filed: ${messageOf(reports.value)}`,
      )(unreadLines),
    };
  }

  const plan = planUnownedReports(unowned, reports.value);

  const filed = await Arr.generateAsync(async function* () {
    for (const report of plan.toFile) {
      if (dryRun) {
        yield {
          kind: 'would',
          line: `#${report.pr}: would file "${report.title}".`,
        } as const;

        continue;
      }

      // eslint-disable-next-line no-await-in-loop -- one at a time, as above
      const number = await fileUnownedReport(context, report);

      yield Result.isErr(number)
        ? ({
            kind: 'failed',
            line: `#${report.pr}: could not file an issue: ${notWritten(number.value)}`,
          } as const)
        : ({
            kind: 'filed',
            line: `#${report.pr}: filed #${number.value}.`,
          } as const);
    }
  });

  return {
    ok: allRead && filed.every(({ kind }) => kind !== 'failed'),
    lines: [
      ...plan.reported.map(
        ({ pr, issue }) => `#${pr}: already reported in #${issue}.`,
      ),
      ...filed.map(({ line }) => line),
      ...unreadLines,
    ],
  };
};

/** What {@link reportUnowned} did: whether all of it, and what it says. */
export type UnownedOutcome = Readonly<{
  ok: boolean;
  lines: readonly string[];
}>;

export type ReportUnownedPrsWorld = SessionWorld &
  Readonly<{ nowEpochMs: () => number }>;

const ALL_OWNED = 'Every queued pull request has an owner.';
