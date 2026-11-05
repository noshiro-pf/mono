import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { listWorkflowFiles, readRepositoryFile } from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when the "Reproducing a check" table of `.github/unblock-prs.md` and
 * the check workflows disagree: a job that does work and is neither named by
 * the command it runs nor a row of the table, or a row naming no job.
 *
 * The unblock-prs skill reproduces a failing check from that table, and the
 * rule above it is "the check name is the command". A job added under another
 * name sends the skill to `pnpm run <its name>`, a missing script, and a row
 * left for a deleted job sends it to a reproduction of nothing (#2878).
 */
export const checkUnblockPrsGuide = (): Promise<Result<number, string>> =>
  Result.safeTry(async function* () {
    const guide = yield* Result.safeUnwrap(await readRepositoryFile(GUIDE));

    const listed = yield* Result.safeUnwrap(await listWorkflowFiles());

    const read = await Promise.all(
      listed.map(async (file) =>
        Result.map(
          await readRepositoryFile(path.relative(projectRootPath, file)),
          (text) => ({ file: path.basename(file), text }),
        ),
      ),
    );

    const firstError = read.find(Result.isErr);

    if (firstError !== undefined) {
      return Result.err(`❌ ${firstError.value}`);
    }

    const workflows = read
      .filter(Result.isOk)
      .map(({ value }) => value)
      .filter(isCheckWorkflow);

    const jobs = workflows.flatMap(({ text }) => checkJobsOf(text));

    const rows = tableChecks(guide);

    const violations = collectGuideViolations(jobs, rows);

    return Arr.isNonEmpty(violations)
      ? Result.err(formatViolations(violations))
      : Result.ok(jobs.length);
  });

/**
 * The checks a workflow reports that do work, by the name GitHub shows before
 * any matrix suffix: a job's `name:` up to ` (`, or its id. A job that `uses:`
 * a reusable workflow (the gates and the `*-result` aggregates) is left out.
 */
export const checkJobsOf = (workflow: string): readonly string[] => {
  const lines = workflow.split('\n');

  const jobsAt = lines.findIndex((line) => /^jobs:\s*$/u.test(line));

  if (jobsAt === -1) {
    return [];
  }

  // `jobs:` runs to the next line that is neither blank nor indented.
  const rest = lines.slice(jobsAt + 1);

  const endAt = rest.findIndex(
    (line) => line.trim() !== '' && !line.startsWith(' '),
  );

  const jobLines = endAt === -1 ? rest : rest.slice(0, endAt);

  const starts = jobLines.flatMap((line, index) =>
    JOB_ID.test(line) ? [index] : [],
  );

  return starts.flatMap((start, i) => {
    const id = JOB_ID.exec(jobLines[start] ?? '')?.[1];

    const block = jobLines.slice(start + 1, starts[i + 1] ?? jobLines.length);

    if (id === undefined || block.some((line) => JOB_USES.test(line))) {
      return [];
    }

    const name = block
      .map((line) => JOB_NAME.exec(line)?.[1])
      .find((found) => found !== undefined);

    return [checkName(name ?? id)];
  });
};

const JOB_ID = /^ {2}([\w-]+):\s*$/u;

const JOB_USES = /^ {4}uses:/u;

const JOB_NAME = /^ {4}name: (.+)$/u;

/** The check names the first column of the "Reproducing a check" table holds. */
export const tableChecks = (guide: string): readonly string[] => {
  const section = guide.split(/^## /mu).find((s) => s.startsWith(SECTION));

  if (section === undefined) {
    return [];
  }

  return Arr.generate(function* () {
    for (const line of section.split('\n')) {
      const cell = /^\| `([^`]+)` +\|/u.exec(line)?.[1];

      if (cell !== undefined) {
        yield checkName(cell);
      }
    }
  });
};

/** One message per job the table does not cover, and per row naming no job. */
export const collectGuideViolations = (
  jobs: readonly string[],
  rows: readonly string[],
): readonly string[] => {
  // Sets rather than `includes`, whose type guard narrows a name it rejects to
  // `never`.
  const jobSet = new Set<string>(jobs);

  const rowSet = new Set<string>(rows);

  return [
    ...Array.from(jobSet)
      .filter((job) => !rowSet.has(job) && !COMMAND_NAMED.has(job))
      .map(
        (job) =>
          `\`${job}\` is not named by the command it runs, and the table has no row for it.`,
      ),
    ...rows
      .filter((row) => !jobSet.has(row))
      .map(
        (row) =>
          `The table has a row for \`${row}\`, which no check workflow runs.`,
      ),
  ];
};

/**
 * The jobs the rule above the table covers: `code-check (X)` and
 * `style-check (X)` run `pnpm run X`.
 */
const COMMAND_NAMED: ReadonlySet<string> = new Set<string>([
  'code-check',
  'style-check',
]);

/**
 * Whether a workflow's jobs are checks a queued pull request waits on: one
 * gated by `check-gates.yml`, as every check workflow is, or the pull request
 * lint, which is not.
 */
export const isCheckWorkflow = ({
  file,
  text,
}: Readonly<{ file: string; text: string }>): boolean =>
  file === 'lint-pull-request.yml' ||
  /^\s+uses: \.\/\.github\/workflows\/check-gates\.yml\s*$/mu.test(text);

const GUIDE = '.github/unblock-prs.md';

const SECTION = 'Reproducing a check';

/** A check name without its matrix suffix: `test-node-versions (…)` → `test-node-versions`. */
const checkName = (name: string): string => name.replace(/ \(.*$/u, '').trim();

const formatViolations = (violations: readonly string[]): string =>
  [
    `❌ The "${SECTION}" table of ${GUIDE} and the check workflows disagree:`,
    '',
    ...violations.map((message) => `  ${message}`),
    '',
    'A check whose name is not the root script it runs needs a row saying what',
    'to run instead, and a row whose job is gone goes with it. If a job is named',
    'by its command as code-check (X) is, add it to COMMAND_NAMED in',
    'tools/scripts/cmd/check-unblock-prs-guide.mts.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkUnblockPrsGuide().catch((error: unknown) =>
    Result.err(`❌ ${unknownToString(error)}`),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `Every check job is covered by the unblock-prs reproduction table (${result.value} jobs).`,
  );
}
