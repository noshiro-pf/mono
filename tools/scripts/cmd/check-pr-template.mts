import { descriptionProblems, readConfig } from 'pr-merge-queue';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { readRepositoryFile } from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when `.github/pull_request_template.md` is a description the tools
 * would refuse, or holds a review section.
 *
 * GitHub fills a pull request opened in its web UI with the template, and
 * coding agents are told to mirror its headings. The shape it lays out is
 * decided elsewhere (`pr-description` and `.github/unblock-prs.json`), so a
 * template that drifted from it would teach a shape the tools then refuse.
 * A review section would have to open with a level and a count of rounds to
 * pass, and a placeholder left as it is would read as a review that never ran.
 */
export const checkPrTemplate = (): Promise<Result<string, string>> =>
  Result.safeTry(async function* () {
    const template = yield* Result.safeUnwrap(
      await readRepositoryFile(TEMPLATE),
    );

    const config = yield* Result.safeUnwrap(await readConfig(projectRootPath));

    const problems = templateProblems(template, {
      heading: config?.translation,
      openingHeading: config?.openingHeading,
    });

    return Arr.isEmpty(problems)
      ? Result.ok(TEMPLATE)
      : Result.err(formatProblems(problems));
  });

/**
 * Why `template` may not be the pull request template, one sentence each:
 * what `pr-description check` refuses in a pull request's description, and a
 * review heading.
 */
export const templateProblems = (
  template: string,
  {
    heading,
    openingHeading,
  }: Readonly<{
    heading: string | undefined;
    openingHeading: string | undefined;
  }>,
): readonly string[] => {
  // GitHub serves the template as the file holds it; the tools read LF only.
  const text = template.replaceAll('\r\n', '\n');

  const refused = descriptionProblems(
    text,
    heading,
    'pull-request',
    openingHeading,
  );

  const reviews = text
    .split('\n')
    .map((line) => REVIEW_HEADING.exec(line)?.[0].trim())
    .filter((found) => found !== undefined)
    .map(
      (found) =>
        `it holds the heading ${JSON.stringify(found)}, which opens as a review section does; the template must have none, as the review is written after the checks once it has run (docs/code-review-loop.md)`,
    );

  return [...(refused === undefined ? [] : [refused]), ...reviews];
};

const TEMPLATE = '.github/pull_request_template.md';

/**
 * A `#` heading, at any level and indented as Markdown allows, that opens with
 * `Review` or `レビュー`, ignoring letter case. Broader than the tools on
 * purpose: they read `## Review` as a whole word and case as written, but a
 * Japanese heading qualifies the word with no space between
 * (`### レビュー（high、1 回）`). A heading that only looks like a review section
 * fails loudly here, which is cheap; one the tools would read slipping through
 * is what this check exists to stop.
 * Setext headings are not read, as the tools read none.
 * Read on every line: `pr-description` reads a heading in an HTML comment too,
 * and one in a code fence fails loudly in the same way.
 */
const REVIEW_HEADING = /^ {0,3}#{1,6}\s+(?:Review|レビュー).*$/iu;

const formatProblems = (problems: readonly string[]): string =>
  [
    `❌ ${TEMPLATE} cannot be the pull request template:`,
    '',
    ...problems.map((problem) => `  ${problem}`),
    '',
    'The template lays out the description that pr-description accepts',
    '(libs/pr-merge-queue/src/pr-description/README.md). Fix the template to',
    'match it, or change both together.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkPrTemplate().catch((error: unknown) =>
    Result.err(`❌ ${unknownToString(error)}`),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} lays out a description pr-description accepts.`,
  );
}
