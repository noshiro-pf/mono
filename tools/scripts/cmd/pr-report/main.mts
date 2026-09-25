import { buildReport, type PrReport } from 'pr-report-core';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { createClient, parseRepoRef } from './github.mjs';
import { HELP, parseOptions, type Format, type Options } from './options.mjs';
import { renderMarkdown, renderTerminal } from './render.mjs';
import { readRepoRef, readRequiredContexts } from './repo-settings.mjs';

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
 *
 * It reads and prints. Nothing here labels, rebases, merges or comments —
 * that is `unblock-prs`, and keeping the report incapable of it is what makes
 * it safe to run anywhere, on a schedule, with a read-only token or none.
 */
export const prReport = async (
  options: Options,
): Promise<Result<string, string>> => {
  const repo =
    options.repo === undefined
      ? await readRepoRef()
      : parseRepoRef(options.repo);

  if (Result.isErr(repo)) {
    return repo;
  }

  const required = await readRequiredContexts();

  if (Result.isErr(required)) {
    return required;
  }

  const client = createClient(
    process.env['GITHUB_TOKEN'] ?? process.env['GH_TOKEN'],
  );

  const defaultBranch = await client.defaultBranch(repo.value);

  if (Result.isErr(defaultBranch)) {
    return defaultBranch;
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

  const report = buildReport({
    repo: repo.value,
    defaultBranch: defaultBranch.value,
    generatedAt: Temporal.Now.instant()
      .round({ smallestUnit: 'second' })
      .toString(),
    required: required.value,
    authenticated: client.authenticated,
    pulls: facts.value,
    merged: merged.value,
    mergedWithinDays: options.mergedDays,
  });

  return Result.ok(print(report, options.format));
};

const print = (report: PrReport, format: Format): string => {
  switch (format) {
    case 'json':
      return JSON.stringify(serializable(report), undefined, 2);

    case 'markdown':
      return renderMarkdown(report);

    case 'terminal':
      return renderTerminal(report);
  }
};

/**
 * The report with its maps turned into objects, because `JSON.stringify`
 * writes a `Map` as `{}` and would quietly drop every check verdict.
 */
const serializable = (report: PrReport): unknown =>
  ({
    ...report,
    entries: report.entries.map((entry) => ({
      ...entry,
      reported: Object.fromEntries(entry.reported),
    })),
  }) as const;

if (isDirectlyExecuted(import.meta.url)) {
  const options = parseOptions(Arr.skip(process.argv, 2));

  if (Result.isErr(options)) {
    console.error(`${options.value}\n\n${HELP}`);

    process.exit(1);
  }

  if (options.value === 'help') {
    console.info(HELP);
  } else {
    const result = await prReport(options.value).catch((error: unknown) =>
      Result.err(unknownToString(error)),
    );

    if (Result.isErr(result)) {
      console.error(result.value);

      process.exit(1);
    }

    console.info(result.value);
  }
}
