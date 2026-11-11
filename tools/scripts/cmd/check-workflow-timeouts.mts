import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Num, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { listWorkflowFiles } from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a job that runs on a runner declares no `timeout-minutes`, or
 * declares more than {@link TIMEOUT_CEILING_MINUTES} without being named in
 * {@link LONGER_TIMEOUTS}.
 *
 * A job with no `timeout-minutes` gets GitHub's default of six hours, and a
 * generous one is the same thing at a smaller scale: a hung command holds a
 * runner, and the aggregate waiting on it, long after the job's usual length
 * has passed, with nothing red to say so. See "The work" in
 * `.github/workflows/README.md`.
 *
 * A job that calls a reusable workflow (`uses:` in place of `runs-on:`) takes
 * no `timeout-minutes` of its own and is not asked.
 */
export const checkWorkflowTimeouts = (): Promise<
  Result<CheckSummary, string>
> =>
  Result.safeTry(async function* () {
    const workflowPaths = yield* Result.safeUnwrap(await listWorkflowFiles());

    const workflows = yield* Result.safeUnwrap(
      await readWorkflows(workflowPaths),
    );

    const violations = collectTimeoutViolations(workflows);

    if (!Arr.isNonEmpty(violations)) {
      return Result.ok({
        workflows: workflows.length,
        jobs: workflows.reduce(
          (total, { jobs }) =>
            total + jobs.filter((job) => job.runsOnRunner).length,
          0,
        ),
      });
    }

    return Result.err(formatViolations(violations));
  });

/**
 * The jobs of one workflow, read with a line scanner rather than a YAML parser
 * — as `check-workflow-event-name.mts` reads the `on:` block. A job is a key
 * indented one level below a bare `jobs:`, and what is read of it are its own
 * keys, one level further in.
 */
export const parseWorkflowJobs = (workflowFile: string): readonly Job[] => {
  const lines = workflowFile.split('\n');

  const blockIndex = lines.findIndex((line) => line.trimEnd() === 'jobs:');

  if (blockIndex === -1) {
    return [];
  }

  const rest = lines.slice(blockIndex + 1);

  const endIndex = rest.findIndex(
    (line) => line !== '' && !line.startsWith(' ') && !line.startsWith('#'),
  );

  const block = endIndex === -1 ? rest : rest.slice(0, endIndex);

  const mut_jobs: Job[] = [];

  for (const line of block) {
    const jobKey = /^ {2}(?<jobId>[\w-]+):\s*$/u.exec(line)?.groups?.['jobId'];

    if (jobKey !== undefined) {
      mut_jobs.push({ jobId: jobKey, runsOnRunner: false, timeout: undefined });

      continue;
    }

    const current = mut_jobs.at(-1);

    if (current === undefined) {
      continue;
    }

    if (/^ {4}runs-on:/u.test(line)) {
      mut_jobs[mut_jobs.length - 1] = { ...current, runsOnRunner: true };

      continue;
    }

    const timeout = /^ {4}timeout-minutes:\s*(?<value>\S+)/u.exec(line)
      ?.groups?.['value'];

    if (timeout !== undefined) {
      mut_jobs[mut_jobs.length - 1] = { ...current, timeout };
    }
  }

  return mut_jobs;
};

/**
 * What is wrong with the timeouts, as one message per problem, each prefixed by
 * the job it is about (`<file>#<job>`). An entry of {@link LONGER_TIMEOUTS}
 * that names no job, or a job that no longer needs it, is a problem too, so
 * that the list cannot outlive its reasons.
 */
export const collectTimeoutViolations = (
  workflows: readonly Workflow[],
  longerTimeouts: ReadonlyRecord<string, LongerTimeout> = LONGER_TIMEOUTS,
): readonly string[] => {
  const jobs = workflows.flatMap(({ relativePath, jobs: workflowJobs }) =>
    workflowJobs.map((job) => ({
      ...job,
      key: `${path.basename(relativePath)}#${job.jobId}`,
    })),
  );

  const jobViolations = Arr.generate(function* () {
    for (const job of jobs) {
      if (!job.runsOnRunner) {
        continue;
      }

      if (job.timeout === undefined) {
        yield `${job.key}: declares no \`timeout-minutes\`, so it may run for six hours.`;

        continue;
      }

      const minutes = parseMinutes(job.timeout);

      if (minutes === undefined) {
        yield `${job.key}: \`timeout-minutes: ${job.timeout}\` is not a whole number of minutes.`;

        continue;
      }

      const longer = longerTimeouts[job.key];

      const ceiling = longer?.minutes ?? TIMEOUT_CEILING_MINUTES;

      if (minutes > ceiling) {
        yield longer === undefined
          ? `${job.key}: \`timeout-minutes: ${minutes}\` is above ${ceiling}.`
          : `${job.key}: \`timeout-minutes: ${minutes}\` is above ${ceiling}, the LONGER_TIMEOUTS entry given because ${longer.reason}.`;
      }
    }
  });

  const staleEntries = Arr.generate(function* () {
    for (const [key, { minutes }] of Object.entries(longerTimeouts)) {
      const job = jobs.find((candidate) => candidate.key === key);

      if (job?.runsOnRunner !== true) {
        yield `${key}: is in LONGER_TIMEOUTS, but no workflow has a runner job of that name.`;

        continue;
      }

      const declared =
        job.timeout === undefined ? undefined : parseMinutes(job.timeout);

      if (declared !== undefined && declared <= TIMEOUT_CEILING_MINUTES) {
        yield `${key}: is in LONGER_TIMEOUTS at ${minutes}, but declares ${declared}, within the ceiling; remove the entry.`;
      }
    }
  });

  return [...jobViolations, ...staleEntries];
};

export type Job = Readonly<{
  jobId: string;
  runsOnRunner: boolean;
  timeout: string | undefined;
}>;

export type Workflow = Readonly<{
  relativePath: string;
  jobs: readonly Job[];
}>;

type LongerTimeout = Readonly<{
  minutes: number;
  reason: string;
}>;

type CheckSummary = Readonly<{
  workflows: number;
  jobs: number;
}>;

/**
 * The most a job may wait before it is taken for hung. Every job but those
 * below has taken under ten minutes on the runner.
 */
const TIMEOUT_CEILING_MINUTES = 15;

/**
 * The jobs whose usual length leaves the ceiling too little to spare for a slow
 * runner, keyed by `<workflow file>#<job id>`, each with the most it may
 * declare and why. A claim to be measured, not a silencer: an entry whose job
 * goes back under the ceiling fails the check until it is removed.
 */
const LONGER_TIMEOUTS: ReadonlyRecord<string, LongerTimeout> = {
  'synstate-benchmark.yml#benchmark': {
    minutes: 20,
    reason: 'a measurement takes 10 to 14 minutes on the runner',
  },
  'code-check.yml#coverage-main': {
    minutes: 20,
    reason:
      'the whole ws:build and ws:check:test:cov in a row has taken up to 12m30s',
  },
} as const;

/** A positive whole number of minutes, or `undefined` for anything else. */
const parseMinutes = (value: string): number | undefined =>
  /^[1-9]\d*$/u.test(value)
    ? Result.unwrapOkOr(Num.safeParseInt(value), undefined)
    : undefined;

const readWorkflow = async (
  workflowPath: string,
): Promise<Result<Workflow, string>> => {
  const relativePath = path.relative(projectRootPath, workflowPath);

  const result = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(workflowPath, 'utf8'),
  );

  return Result.isErr(result)
    ? Result.err(
        `Failed to read ${relativePath}: ${unknownToString(result.value)}`,
      )
    : Result.ok({ relativePath, jobs: parseWorkflowJobs(result.value) });
};

const readWorkflows = async (
  workflowPaths: readonly string[],
): Promise<Result<readonly Workflow[], string>> => {
  const results = await Promise.all(workflowPaths.map(readWorkflow));

  const firstError = results.find(Result.isErr);

  return firstError !== undefined
    ? Result.err(firstError.value)
    : Result.ok(
        Arr.generate(function* () {
          for (const result of results) {
            if (!Result.isErr(result)) {
              yield result.value;
            }
          }
        }),
      );
};

const formatViolations = (violations: readonly string[]): string =>
  [
    `❌ A workflow job's \`timeout-minutes\` is missing or above ${TIMEOUT_CEILING_MINUTES}:`,
    '',
    ...violations.map((message) => `  ${message}`),
    '',
    'Set the job to at most the ceiling. A job whose usual length leaves the',
    'ceiling too little to spare goes in LONGER_TIMEOUTS in',
    'tools/scripts/cmd/check-workflow-timeouts.mts, with what it was measured',
    'at. See "The work" in .github/workflows/README.md.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkWorkflowTimeouts().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    [
      `Every runner job declares a \`timeout-minutes\` of at most ${TIMEOUT_CEILING_MINUTES}`,
      `or its LONGER_TIMEOUTS entry (${result.value.jobs} jobs across ${result.value.workflows} workflows).`,
    ].join(' '),
  );
}
