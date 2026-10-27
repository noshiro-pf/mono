import {
  buildReport,
  type IssueDeclarations,
  type OpenIssue,
  type PrReport,
  type PullRequestFacts,
  type QueueComments,
  type QueueOwner,
  type RepoRef,
} from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import {
  currentEpochMs,
  isoSeconds,
  resolveRepo,
  tokenFromEnv,
} from '../lib/index.mjs';
import { createClient, type Client } from './github.mjs';
import type { Format, Options } from './options.mjs';
import { ownersOf } from './queue.mjs';
import { renderMarkdown, renderTerminal } from './render.mjs';
import { readRequiredContexts } from './repo-settings.mjs';

/**
 * Reports the state of every open pull request, in one page.
 *
 * What it answers, and why each part is here rather than a click away on
 * GitHub:
 *
 * - **The merge order.** The `Merge-After:` trailers and the stacks — a pull
 *   request onto another's branch — describe a graph that the pull request
 *   list cannot show at all; a stack of four reads as four unrelated rows
 *   there. Drawn as a tree, the one at the top is the one to look at.
 * - **The issues each pull request closes**, so that "what is this for" does
 *   not need the body opened.
 * - **The labels**, because `skip-ci` and `merge-queued` are how this
 *   repository says "not yet" and "ready", and neither means anything until
 *   someone reads them.
 * - **The verdict of the checks the ruleset requires**, which is not the same
 *   as the checks that ran: a required context with nothing reported sits as
 *   "Expected — waiting" forever, and a red aggregate does not name what
 *   failed. Both are said here by name.
 * - **How far ahead and behind the branch is.** A branch behind its base runs
 *   nothing and merges nothing, and the pull request page states it only as
 *   a sentence, without the size of the gap. For a stacked pull request the
 *   base is the layer below, and behind it means the layer below has moved
 *   and this one has not been restacked onto it.
 * - **What landed recently.** The one section that is not about the queue,
 *   and the first question a reader of a daily report has: did the thing I
 *   queued yesterday go in.
 * - **What is open that is not a pull request** — the open issues, so that
 *   "what is there to do" does not need a second tab.
 * - **In the JSON only, whether `unblock-prs` set each one aside, who has
 *   claimed it** (`pr-report-core`'s `queue-comments.mts`), **and who moves
 *   it next** (`owner`: `worker`, `skill`, `human` or `none`; `queue.mts`),
 *   which is how a session working the queue picks what to fix.
 *
 * It reads and prints. Nothing here labels, rebases, merges or comments —
 * that is `unblock-prs`, and keeping the report incapable of it is what makes
 * it safe to run anywhere, on a schedule, with a read-only token or none.
 */
export const prReport = async (
  options: Options,
): Promise<Result<string, string>> => {
  const repo = await resolveRepo(options.repo);

  if (Result.isErr(repo)) {
    return repo;
  }

  const client = createClient(tokenFromEnv());

  const defaultBranch = await client.defaultBranch(repo.value);

  if (Result.isErr(defaultBranch)) {
    return defaultBranch;
  }

  const required = await readRequiredContexts(
    client,
    repo.value,
    defaultBranch.value,
  );

  if (Result.isErr(required)) {
    return required;
  }

  const facts = await client.facts(repo.value);

  if (Result.isErr(facts)) {
    return facts;
  }

  // One more request, and the one section that is not about what is open:
  // what landed. A report that only lists the queue cannot answer "did the
  // thing I queued yesterday go in", which is the first question a reader of
  // a daily report has.
  const merged = await client.merged(
    repo.value,
    options.mergedDays,
    options.mergedLimit,
  );

  if (Result.isErr(merged)) {
    return merged;
  }

  // And one more for what is open that is not a pull request, so that "what
  // is there to do" is answered in one place rather than two.
  const issues = await client.issues(repo.value, options.issuesLimit);

  if (Result.isErr(issues)) {
    return issues;
  }

  // And one request for each issue the open pull requests close that the
  // open list did not cover, whose `Start-After:` the pull request closing
  // it inherits as a merge order.
  const issueDeclarations = await declarationsOf(
    client,
    repo.value,
    facts.value,
    issues.value,
  );

  // And one for each thing the issues' `Start-After:` names that is neither
  // a listed issue nor an open pull request, to say where it stands.
  const references = await client.references(
    repo.value,
    namedBeyond(facts.value, issues.value),
  );

  // Only the JSON carries these: they are what a session working the queue
  // reads (`.claude/skills/unblock-prs/SKILL.md`), not what a person does.
  const queue =
    options.format === 'json'
      ? await client.queueComments(repo.value, defaultBranch.value, facts.value)
      : new Map<number, QueueComments>();

  const report = buildReport({
    repo: repo.value,
    defaultBranch: defaultBranch.value,
    generatedAt: isoSeconds(currentEpochMs()),
    required: required.value,
    authenticated: client.authenticated,
    pulls: facts.value,
    merged: merged.value,
    mergedWithinDays: options.mergedDays,
    issues: issues.value,
    issuesLimit: options.issuesLimit,
    issueDeclarations,
    references,
  });

  const owners = ownersOf(report, queue, defaultBranch.value, currentEpochMs());

  return Result.ok(print(report, queue, owners, options.format));
};

/**
 * What the open issues listed, and the ones the open pull requests close
 * beyond them, declare with `Start-After:`. A closing issue already known to
 * be closed is not read: it closes nothing that is still to do.
 */
const declarationsOf = async (
  client: Client,
  repo: RepoRef,
  pulls: readonly PullRequestFacts[],
  issues: readonly OpenIssue[],
): Promise<IssueDeclarations> => {
  const listed = new Set(issues.map(({ number }) => number));

  const beyond = Arr.uniq(
    pulls.flatMap(({ linkedIssues }) =>
      linkedIssues
        .filter(
          ({ number, state }) => state !== 'closed' && !listed.has(number),
        )
        .map(({ number }) => number),
    ),
  ).toSorted((a, b) => a - b);

  const read = await client.issueBodies(repo, beyond);

  const mut_startAfter = new Map(
    issues.map(({ number, startAfter }) => [number, startAfter] as const),
  );

  const mut_open = new Set(listed);

  for (const [number, { open, startAfter }] of read) {
    mut_startAfter.set(number, startAfter);

    if (open) {
      mut_open.add(number);
    }
  }

  return { startAfter: mut_startAfter, open: mut_open };
};

/** What the listed issues name that is neither listed nor an open pull request. */
const namedBeyond = (
  pulls: readonly PullRequestFacts[],
  issues: readonly OpenIssue[],
): readonly number[] => {
  const known = new Set(
    pulls
      .map(({ number }) => number)
      .concat(issues.map(({ number }) => number)),
  );

  return Arr.uniq(issues.flatMap(({ startAfter }) => startAfter))
    .filter((number) => !known.has(number))
    .toSorted((a, b) => a - b);
};

const print = (
  report: PrReport,
  queue: ReadonlyMap<number, QueueComments>,
  owners: ReadonlyMap<number, QueueOwner>,
  format: Format,
): string => {
  switch (format) {
    case 'json':
      return JSON.stringify(serializable(report, queue, owners), undefined, 2);

    case 'markdown':
      return renderMarkdown(report);

    case 'terminal':
      return renderTerminal(report);
  }
};

/**
 * The report with its maps turned into objects, because `JSON.stringify`
 * writes a `Map` as `{}` and would quietly drop every check verdict, and with
 * what the queue's comments say on each entry (absent when there is none)
 * and who moves it next (absent outside the queue, or when its comments
 * could not be read; `queue.mts`).
 */
const serializable = (
  report: PrReport,
  queue: ReadonlyMap<number, QueueComments>,
  owners: ReadonlyMap<number, QueueOwner>,
): unknown =>
  ({
    ...report,
    entries: report.entries.map((entry) => ({
      ...entry,
      reported: Object.fromEntries(entry.reported),
      ...queue.get(entry.number),
      owner: owners.get(entry.number),
    })),
  }) as const;
