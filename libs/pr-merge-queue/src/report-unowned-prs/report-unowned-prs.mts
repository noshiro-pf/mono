import type { QueueComments, QueueOwner, ReportEntry } from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { StrictPick } from 'ts-type-forge';
import { resolveApiContext, rest, viewerLogin } from '../lib/index.mjs';
import { readQueueState, type QueueState } from '../pr-report/index.mjs';

/** What `report-unowned-prs --help` prints. */
export const REPORT_UNOWNED_PRS_HELP = [
  'Usage: report-unowned-prs [--dry-run]',
  '',
  'Files an issue for each queued pull request nobody owns: one the',
  'worker, a skill and a person are all waiting on someone else for.',
  'Once per pull request; an open issue this account filed is not filed again.',
  '',
  'Options:',
  '  --dry-run   say what it would file, and file nothing',
  '  -h, --help  show this help',
].join('\n');

/**
 * Files an issue for each queued pull request nobody owns.
 *
 * Every pull request in the queue is the worker's, a skill's or a person's
 * (`pr-report-core`'s `queue-owner.mts`); `none` means the rules met a state
 * they do not cover, and a pull request in it waits for nothing that will
 * come. That is a bug in the queue's tooling, not in the pull request, so it
 * is reported as one — once per pull request, found again by a hidden line
 * in the body of an open issue this account wrote — rather than left for
 * someone to notice the queue has stopped.
 *
 * ```sh
 * report-unowned-prs            # file what is not filed yet
 * report-unowned-prs --dry-run  # say what it would file
 * ```
 *
 * The `/unblock-prs` skill runs it on every round. It reads the owners as
 * every other command does (`pr-report/queue.mts`) and writes as the token's
 * account, which has to be the one `unblock-prs` runs as. A caller that has
 * just read the queue passes what it read as `read`.
 */
export const reportUnownedPrs = async (
  dryRun: boolean,
  read?: StrictPick<QueueState, 'decided' | 'owners' | 'queue'>,
): Promise<Result<string, string>> => {
  const state = read === undefined ? await readQueueState() : Result.ok(read);

  if (Result.isErr(state)) {
    return Result.err(`cannot read the queue: ${state.value}`);
  }

  const { decided, owners, queue } = state.value;

  const unowned = decided.entries.filter(
    (entry) => owners.get(entry.number)?.owner === 'none',
  );

  if (!Arr.isNonEmpty(unowned)) {
    return Result.ok('Every queued pull request has an owner.');
  }

  const api = await resolveApiContext();

  if (Result.isErr(api)) {
    return api;
  }

  const viewer = await viewerLogin(api.value.token);

  if (Result.isErr(viewer)) {
    return Result.err(`cannot read who the token is: ${viewer.value}`);
  }

  // Issues and pull requests come from one endpoint; a pull request has no
  // body this marker could be in that this account wrote as an issue.
  const listed = await rest(api.value, 'GET', '/issues', IssueListSchema, {
    query: { state: 'open', creator: viewer.value, per_page: '100' },
  });

  if (Result.isErr(listed)) {
    return Result.err(`cannot list the open issues: ${listed.value}`);
  }

  const plan = planUnownedReports(
    unowned.map((entry) => ({
      entry,
      owner: owners.get(entry.number),
      comments: queue.get(entry.number),
    })),
    listed.value.map(({ number, body }) => ({ number, body: body ?? '' })),
  );

  const mut_lines = plan.reported.map(
    ({ pr, issue }) => `#${pr}: already reported in #${issue}.`,
  );

  for (const report of plan.toFile) {
    if (dryRun) {
      mut_lines.push(`#${report.pr}: would file "${report.title}".`);

      continue;
    }

    const filed = await rest(
      api.value,
      'POST',
      '/issues',
      t.record({ number: t.number() }),
      { body: { title: report.title, body: report.body } },
    );

    mut_lines.push(
      Result.isErr(filed)
        ? `#${report.pr}: could not file an issue: ${filed.value}`
        : `#${report.pr}: filed #${filed.value.number}.`,
    );
  }

  return Result.ok(mut_lines.join('\n'));
};

/**
 * What to file for each pull request nobody owns, given the open issues this
 * account wrote: one already carrying the pull request's marker is reported
 * and not filed again.
 */
export const planUnownedReports = (
  unowned: readonly Readonly<{
    entry: ReportEntry;
    owner: QueueOwner | undefined;
    comments: QueueComments | undefined;
  }>[],
  openIssues: readonly Readonly<{ number: number; body: string }>[],
): Readonly<{
  toFile: readonly Readonly<{ pr: number; title: string; body: string }>[];
  reported: readonly Readonly<{ pr: number; issue: number }>[];
}> => {
  const issueOf = (pr: number): number | undefined =>
    openIssues.find(({ body }) => body.includes(markerOf(pr)))?.number;

  return {
    reported: Arr.generate(function* () {
      for (const { entry } of unowned) {
        const issue = issueOf(entry.number);

        if (issue !== undefined) {
          yield { pr: entry.number, issue };
        }
      }
    }),
    toFile: unowned
      .filter(({ entry }) => issueOf(entry.number) === undefined)
      .map(({ entry, owner, comments }) => ({
        pr: entry.number,
        title: `unblock-prs: #${entry.number} is in the queue with no owner`,
        body: reportBody(entry, owner, comments),
      })),
  };
};

const markerOf = (pr: number): string =>
  `<!-- unblock-prs:unowned pr=${pr} -->` as const;

const describeComment = (says: unknown): string =>
  says === undefined ? 'none' : (`\`${JSON.stringify(says)}\`` as const);

const reportBody = (
  entry: ReportEntry,
  owner: QueueOwner | undefined,
  comments: QueueComments | undefined,
): string =>
  [
    markerOf(entry.number),
    '',
    `#${entry.number} is in the merge queue, and \`queueOwner\` (\`libs/pr-report-core/src/queue-owner.mts\`) gives it to nobody: the worker, the skills and the people working the queue each leave it to the others.`,
    '',
    `- Why: ${owner?.reason ?? 'no owner was returned'}`,
    `- Labels: ${Arr.isNonEmpty(entry.labels) ? entry.labels.map(({ name }) => `\`${name}\``).join(', ') : 'none'}`,
    `- Head: \`${entry.headRef}\` at \`${entry.headSha}\`, onto \`${entry.baseRef}\`${entry.stackedOn === undefined ? '' : ` (stacked on #${entry.stackedOn})`}`,
    `- Set-aside comment: ${describeComment(comments?.setAside?.says)}`,
    `- Claim: ${describeComment(comments?.claim?.says)}`,
    '',
    'Give the state an owner in `queue-owner.mts` (with a test), or make the writer that produced it stop producing it. Then the pull request needs whatever its new owner does; until then a person moves it by hand.',
    '',
    'Filed by `report-unowned-prs`.',
  ].join('\n');

const IssueListSchema = t.array(
  t.record({
    number: t.number(),
    body: t.union([t.string(), t.nullType]),
  }),
);
