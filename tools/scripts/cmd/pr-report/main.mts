import * as fs from 'node:fs/promises';
import { serializePayload } from 'pr-report-payload';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { createClient, parseRepoRef } from './github.mjs';
import { HELP, parseOptions, type Format, type Options } from './options.mjs';
import { toPayload } from './payload.mjs';
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
): Promise<Result<Output, string>> => {
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

  // One more request, and the one section that is not about what is open:
  // what landed. A report that only lists the queue cannot answer "did the
  // thing I queued yesterday go in", which is the first question a reader of
  // a daily report has.
  const merged = await client.merged(
    repo.value,
    options.mergedDays,
    options.mergedLimit,
  );

  if (Result.isErr(merged)) return merged;

  const report = buildReport({
    repo: repo.value,
    generatedAt: Temporal.Now.instant()
      .round({ smallestUnit: 'second' })
      .toString(),
    required: required.value,
    authenticated: client.authenticated,
    pulls: facts.value,
    merged: merged.value,
    mergedWithinDays: options.mergedDays,
  });

  // Always, whatever was asked to be printed: it is a projection of a report
  // already in hand, and `--payload-file` is allowed to ask for it beside any
  // of the three.
  const payload = serializePayload(toPayload(report));

  return Result.ok({ payload, text: print(report, options.format, payload) });
};

/**
 * What one run produces.
 *
 * Two outputs from one run rather than two runs, because
 * `.github/workflows/pr-report.yml` wants the Markdown for the issue and the
 * payload for the branch the page reads. Two runs would cost twice the API
 * budget and twice the wall clock, and would leave the issue and the page
 * describing moments that differ by whatever happened between them.
 */
export type Output = Readonly<{
  /** What was asked for on standard output. */
  text: string;
  /**
   * What `--payload-file` writes, and what the workflow force-pushes to the
   * report's own branch. See `apps/pr-report-payload`.
   */
  payload: string;
}>;

const print = (report: PrReport, format: Format, payload: string): string => {
  switch (format) {
    case 'json':
      return JSON.stringify(serializable(report), undefined, 2);

    case 'markdown': {
      const markdown = renderMarkdown(report);

      warnIfTooLongForAnIssue(markdown);

      return markdown;
    }

    case 'payload':
      return payload;

    case 'terminal':
      return renderTerminal(report);
  }
};

/**
 * What GitHub accepts in an issue body. The Markdown report is written into
 * one, and what grows is the list of open pull requests and the merges of the
 * last week. The payload this run also writes is a file on a branch and has
 * no such limit.
 */
const ISSUE_BODY_LIMIT = 65_536;

/**
 * Said on stderr, not returned as an error.
 *
 * The same text is read in three places and only one of them is an issue:
 * `pr-report.yml` writes it to one, the run summary takes the same string,
 * and a person runs the command in a terminal. Refusing to print a report
 * because one of its three destinations would refuse it is worse than
 * printing it and saying so — and the destination that does refuse says so
 * itself, loudly, in the workflow log. This is here to name the two flags
 * that make it fit before someone has to work that out.
 */
const warnIfTooLongForAnIssue = (markdown: string): void => {
  if (markdown.length <= ISSUE_BODY_LIMIT) return;

  console.warn(
    [
      `This report is ${markdown.length} characters and a GitHub issue body holds ${ISSUE_BODY_LIMIT}.`,
      'Lower --merged-days or --merged-limit; the merged section is what grows.',
    ].join('\n'),
  );
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

    const { payloadFile } = options.value;

    if (payloadFile !== undefined) {
      // The path is the caller's own, given on their own command line.
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(payloadFile, result.value.payload);
    }

    console.info(result.value.text);
  }
}
