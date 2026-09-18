import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { createClient, parseRepoRef } from './github.mjs';
import { HELP, parseOptions, type Options } from './options.mjs';
import { renderMarkdown, renderTerminal } from './render.mjs';
import { readRepoRef, readRequiredContexts } from './repo-settings.mjs';
import { buildReport } from './report.mjs';
import { type PrReport } from './types.mjs';

/**
 * Reports the state of every open pull request, in one page.
 *
 * What it answers, and why each part is here rather than a click away on
 * GitHub:
 *
 * - **The merge order.** The `Merge-After:` trailers describe a graph that
 *   the pull request list cannot show at all; a stack of four reads as four
 *   unrelated rows there. Drawn as a tree, the one at the top is the one to
 *   look at.
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
 *   a sentence, without the size of the gap.
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

  if (Result.isErr(repo)) return repo;

  const required = await readRequiredContexts();

  if (Result.isErr(required)) return required;

  const client = createClient(
    process.env['GITHUB_TOKEN'] ?? process.env['GH_TOKEN'],
  );

  const facts = await client.facts(repo.value);

  if (Result.isErr(facts)) return facts;

  const report = buildReport({
    repo: repo.value,
    generatedAt: Temporal.Now.instant()
      .round({ smallestUnit: 'second' })
      .toString(),
    required: required.value,
    authenticated: client.authenticated,
    pulls: facts.value,
  });

  switch (options.format) {
    case 'json':
      return Result.ok(JSON.stringify(serializable(report), undefined, 2));

    case 'markdown':
      return Result.ok(renderMarkdown(report));

    case 'terminal':
      return Result.ok(renderTerminal(report));
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
