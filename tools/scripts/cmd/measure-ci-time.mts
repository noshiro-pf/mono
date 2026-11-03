import {
  collectPages,
  parseCommandArgs,
  positiveInteger,
  resolveApiContext,
  rest,
  type ApiContext,
} from 'pr-merge-queue';
import { Arr, asUint32, Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { StrictOmit } from 'ts-type-forge';
import { tableCell } from '../lib/markdown.mjs';

/**
 * Where a workflow's wall time goes, read from the jobs and steps API over its
 * last successful runs, so that what shortens the critical path is decided on
 * numbers rather than on one run read by eye.
 *
 * ```sh
 * pnpm run measure-ci-time -- [--workflow code-check.yml] [--runs 20] [--event pull_request] [--format md|json] [--repo owner/name]
 * ```
 *
 * A run counts when it succeeded at its first attempt and did work: a job ran a
 * step that {@link isWorkStep} names (`Build all packages`, or
 * `Run "<command>"`, the names `code-check.yml` and `style-check.yml` give
 * their work). A run that reused a verdict runs the gate and the aggregate
 * alone, and would only dilute the numbers; a re-run attempt carries jobs of
 * the earlier one, and would measure the time between them. Fewer runs than
 * asked for, after {@link pagesFor} pages of the run list, is said in the
 * Markdown, and is `runs` shorter than `asked` in the JSON.
 *
 * Each job's time is split four ways, in seconds: `queue` (created to started,
 * the wait for a runner), `setup` (every step before its first work step,
 * `Set up job` included), `work` (its work steps, and whatever runs between
 * them), and `after` (everything after the last work step: the clean-tree
 * check, uploads, the post steps). A job with no work step (the gate, the
 * aggregate) counts its whole run as `setup`. A step its `if` skipped is left
 * out. The step timestamps are whole seconds, so a step reads as 0 – 1 s
 * shorter or longer than it ran.
 */
export const measureCiTime = async (
  context: ApiContext,
  options: Options,
  log: (message: string) => void,
): Promise<Result<Measurement, string>> => {
  const mut_runs: MeasuredRun[] = [];

  let mut_examined = 0;

  const readJobs = async (run: Run): Promise<Result<readonly Job[], string>> =>
    collectPages(
      async (pageNumber) =>
        Result.map(
          await rest(
            context,
            'GET',
            `/actions/runs/${run.id}/attempts/${run.run_attempt}/jobs`,
            JobListSchema,
            {
              query: {
                per_page: PAGE_SIZE.toString(),
                page: pageNumber.toString(),
              },
            },
          ),
          ({ jobs }) => jobs,
        ),
      PAGE_SIZE,
    );

  for (const index of Arr.seq(asUint32(pagesFor(options.runs)))) {
    const page = await rest(
      context,
      'GET',
      `/actions/workflows/${options.workflow}/runs`,
      RunListSchema,
      {
        query: {
          status: 'success',
          event: options.event,
          per_page: PAGE_SIZE.toString(),
          page: (index + 1).toString(),
        },
      },
    );

    if (Result.isErr(page)) {
      return page;
    }

    const measured = await measureEach(
      readJobs,
      page.value.workflow_runs,
      options.runs - mut_runs.length,
    );

    if (Result.isErr(measured)) {
      return measured;
    }

    mut_runs.push(...measured.value.measured);

    mut_examined += measured.value.examined;

    log(`measured ${mut_runs.length} of ${options.runs} runs`);

    if (
      mut_runs.length >= options.runs ||
      page.value.workflow_runs.length < PAGE_SIZE
    ) {
      break;
    }
  }

  return Result.ok(
    summarize(mut_runs, { examined: mut_examined, asked: options.runs }),
  );
};

/**
 * The runs of one page that did work, measured in order until `wanted` of them
 * are. A re-run attempt is skipped: its job list carries jobs of the earlier
 * attempt, so it would measure the time between the two. `readJobs` reads one
 * run's jobs, every page of them. `examined` is how many of `runs` were looked
 * at before `wanted` were found.
 */
export const measureEach = async (
  readJobs: (run: Run) => Promise<Result<readonly Job[], string>>,
  runs: readonly Run[],
  wanted: number,
): Promise<
  Result<
    Readonly<{ measured: readonly MeasuredRun[]; examined: number }>,
    string
  >
> => {
  const mut_measured: MeasuredRun[] = [];

  let mut_examined = 0;

  for (const run of runs) {
    if (mut_measured.length >= wanted) {
      break;
    }

    mut_examined += 1;

    if (run.run_attempt !== 1) {
      continue;
    }

    const jobs = await readJobs(run);

    if (Result.isErr(jobs)) {
      return jobs;
    }

    const measured = measureRun(run, jobs.value);

    if (measured === undefined) {
      continue;
    }

    mut_measured.push(measured);
  }

  return Result.ok({ measured: mut_measured, examined: mut_examined });
};

/**
 * One run's jobs, split as {@link measureCiTime} says, or `undefined` when no
 * job in it did work. Skipped jobs, which never had a runner, are left out.
 */
export const measureRun = (
  run: Run,
  jobs: readonly Job[],
): MeasuredRun | undefined => {
  const ran = Arr.generate(function* () {
    for (const job of jobs) {
      const measured = measureJob(job);

      if (measured !== undefined) {
        yield measured;
      }
    }
  });

  const lastToEnd = ran
    .filter(({ worked }) => worked)
    .toSorted((a, b) => b.completedAt - a.completedAt)[0];

  if (lastToEnd === undefined) {
    return undefined;
  }

  const firstCreated = Math.min(...ran.map(({ createdAt }) => createdAt));

  return {
    id: run.id,
    url: run.html_url,
    createdAt: run.created_at,
    wall: Math.max(...ran.map(({ completedAt }) => completedAt)) - firstCreated,
    lastToEnd: lastToEnd.name,
    jobs: ran.map(
      ({ name, queue, setup, work, after, steps, startedAt, completedAt }) => ({
        name,
        start: startedAt - firstCreated,
        end: completedAt - firstCreated,
        queue,
        setup,
        work,
        after,
        steps,
      }),
    ),
  };
};

/** Whether a step is the job's work rather than its setup or teardown. */
export const isWorkStep = (name: string): boolean =>
  name === 'Build all packages' || name.startsWith('Run "');

/**
 * The median and the 90th percentile of `values`, both by nearest rank: for an
 * even count the median is the lower of the two middle values. An empty list
 * gives 0 for both.
 */
export const spread = (values: readonly number[]): Spread => {
  const sorted = values.toSorted((a, b) => a - b);

  const at = (fraction: number): number =>
    sorted[Math.max(0, Math.ceil(fraction * sorted.length) - 1)] ?? 0;

  return { median: at(0.5), p90: at(0.9) };
};

/** Every run's numbers, then the spread of each job and of each step. */
export const summarize = (
  runs: readonly MeasuredRun[],
  { examined, asked }: Readonly<{ examined: number; asked: number }>,
): Measurement => {
  const jobs = Arr.groupBy(
    runs.flatMap(({ jobs: j }) => j),
    ({ name }) => name,
  );

  const steps = Arr.groupBy(
    runs.flatMap(({ jobs: j }) => j.flatMap(({ steps: s }) => s)),
    ({ name }) => name,
  );

  const lastToEnd = Arr.groupBy(runs, ({ lastToEnd: name }) => name);

  return {
    runs,
    examined,
    asked,
    lastToEnd: lastToEnd
      .toEntriesArray()
      .map(([name, list]) => ({ name, count: list.length }))
      .toSorted((a, b) => b.count - a.count),
    wall: Arr.isNonEmpty(runs)
      ? spread(runs.map(({ wall }) => wall))
      : undefined,
    jobs: jobs
      .toEntriesArray()
      .map(([name, list]) => ({
        name,
        count: list.length,
        start: spread(list.map(({ start }) => start)),
        end: spread(list.map(({ end }) => end)),
        queue: spread(list.map(({ queue }) => queue)),
        setup: spread(list.map(({ setup }) => setup)),
        work: spread(list.map(({ work }) => work)),
        after: spread(list.map(({ after }) => after)),
      }))
      .toSorted((a, b) => b.end.median - a.end.median),
    steps: steps
      .toEntriesArray()
      .map(([name, list]) => ({
        name,
        count: list.length,
        seconds: spread(list.map(({ seconds }) => seconds)),
      }))
      .toSorted((a, b) => b.seconds.median - a.seconds.median),
  };
};

/** The measurement as Markdown tables, minutes to one decimal. */
export const renderMarkdown = (
  measurement: Measurement,
  options: Options,
): string =>
  [
    `${options.workflow}: the ${measurement.runs.length} that did work among the last ${measurement.examined} \`${options.event}\` runs that succeeded at their first attempt; median / p90 in minutes.`,
    ...(measurement.runs.length < measurement.asked
      ? [
          '',
          `Fewer than the ${measurement.asked} asked for: the run list ended, or ${pagesFor(measurement.asked)} pages of it held no more.`,
        ]
      : []),
    '',
    `Wall time, first job created to last job done: ${measurement.wall === undefined ? 'no runs' : formatSpread(measurement.wall)}.`,
    '',
    `Ended last among the jobs that did work: ${measurement.lastToEnd.map(({ name, count }) => `\`${name}\` (${count})`).join(', ')}.`,
    '',
    '| Job | Runs | Start | End | Queue | Setup | Work | After |',
    '| :-- | --: | --: | --: | --: | --: | --: | --: |',
    ...measurement.jobs.map(
      (job) =>
        `| ${tableCell(`\`${job.name}\``)} | ${job.count} | ${formatSpread(job.start)} | ${formatSpread(job.end)} | ${formatSpread(job.queue)} | ${formatSpread(job.setup)} | ${formatSpread(job.work)} | ${formatSpread(job.after)} |`,
    ),
    '',
    'Start and End are counted from the first job of the run being created.',
    '',
    '| Step | Times run | Duration |',
    '| :-- | --: | --: |',
    ...measurement.steps
      .filter(({ seconds }) => seconds.p90 >= STEP_THRESHOLD_SECONDS)
      .map(
        (step) =>
          `| ${tableCell(step.name)} | ${step.count} | ${formatSpread(step.seconds)} |`,
      ),
    '',
    `Steps whose p90 is under ${STEP_THRESHOLD_SECONDS} s are left out.`,
  ].join('\n');

export const parseOptions = (
  args: readonly string[],
): Result<Options | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    workflow: { type: 'string' },
    runs: { type: 'string' },
    event: { type: 'string' },
    format: { type: 'string' },
    repo: { type: 'string' },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const {
    workflow = 'code-check.yml',
    runs,
    event = 'pull_request',
    format = 'md',
    repo,
  } = parsed.value;

  if (!WORKFLOW_ID.test(workflow)) {
    return Result.err(
      `--workflow must be a workflow file name (code-check.yml) or a numeric id, got ${JSON.stringify(workflow)}`,
    );
  }

  if (format !== 'md' && format !== 'json') {
    return Result.err(
      `--format must be md or json, got ${JSON.stringify(format)}`,
    );
  }

  return Result.map(positiveInteger('runs', runs, DEFAULT_RUNS), (count) => ({
    workflow,
    runs: count,
    event,
    format,
    repo,
  }));
};

export type Options = Readonly<{
  workflow: string;
  runs: number;
  event: string;
  format: 'json' | 'md';
  repo: string | undefined;
}>;

export type Spread = Readonly<{ median: number; p90: number }>;

export type MeasuredJob = Readonly<{
  name: string;
  /** Seconds from the first job of the run being created. */
  start: number;
  end: number;
  queue: number;
  setup: number;
  work: number;
  after: number;
  steps: readonly Readonly<{ name: string; seconds: number }>[];
}>;

export type MeasuredRun = Readonly<{
  id: number;
  url: string;
  createdAt: string;
  wall: number;
  /** The job that did work and ended last. */
  lastToEnd: string;
  jobs: readonly MeasuredJob[];
}>;

export type Measurement = Readonly<{
  runs: readonly MeasuredRun[];
  wall: Spread | undefined;
  /**
   * How many runs were looked at to find `runs`: those that did no work and
   * re-run attempts included.
   */
  examined: number;
  /** How many runs were asked for. */
  asked: number;
  /** How many runs each job ended last in, most first. */
  lastToEnd: readonly Readonly<{ name: string; count: number }>[];
  jobs: readonly Readonly<{
    name: string;
    count: number;
    start: Spread;
    end: Spread;
    queue: Spread;
    setup: Spread;
    work: Spread;
    after: Spread;
  }>[];
  steps: readonly Readonly<{ name: string; count: number; seconds: Spread }>[];
}>;

export type Run = t.TypeOf<typeof RunSchema>;

export type Job = t.TypeOf<typeof JobSchema>;

const USAGE = [
  'Usage: pnpm run measure-ci-time -- [--workflow code-check.yml] [--runs 20] [--event pull_request] [--format md|json] [--repo owner/name]',
  '',
  '  --workflow  the workflow file name, or its numeric id; default: code-check.yml',
  '  --runs      how many successful runs that did work to read; default: 20',
  '  --event     the event that started them; default: pull_request',
  '  --format    md (default) or json',
  '  --repo      default: origin, else the root package.json',
  '',
  'Reads GH_TOKEN or GITHUB_TOKEN (or `gh auth token`).',
].join('\n');

const DEFAULT_RUNS = 20;

/**
 * What `--workflow` may be, since it goes into the request path as it is: a
 * file name under the workflows directory, or the workflow's numeric id.
 */
const WORKFLOW_ID = /^(?:[\w.-]+\.ya?ml|\d+)$/u;

const PAGE_SIZE = 100;

/**
 * How many pages of the run list to read at most for `runs` runs: two more than
 * they would fill, and never more than 10, the 1000 runs GitHub lists for a
 * filtered query. Each run read costs a request for its jobs, so this bounds
 * what a workflow none of whose runs did work costs.
 */
const pagesFor = (runs: number): number =>
  Math.min(10, Math.ceil(runs / PAGE_SIZE) + 2);

const STEP_THRESHOLD_SECONDS = 5;

const Timestamp = t.union([t.nullType, t.string()]);

const RunSchema = t.record({
  id: t.number(),
  html_url: t.string(),
  created_at: t.string(),
  run_attempt: t.number(),
});

const RunListSchema = t.record({ workflow_runs: t.array(RunSchema) });

const StepSchema = t.record({
  name: t.string(),
  conclusion: t.union([t.nullType, t.string()]),
  started_at: Timestamp,
  completed_at: Timestamp,
});

const JobSchema = t.record({
  name: t.string(),
  conclusion: t.union([t.nullType, t.string()]),
  created_at: t.string(),
  started_at: Timestamp,
  completed_at: Timestamp,
  steps: t.array(StepSchema),
});

const JobListSchema = t.record({ jobs: t.array(JobSchema) });

const epochSeconds = (iso: string): number =>
  Temporal.Instant.from(iso).epochMilliseconds / 1000;

/**
 * One job's split, with its own times still absolute, or `undefined` for a job
 * that never ran on a runner.
 */
const measureJob = (
  job: Job,
):
  | (StrictOmit<MeasuredJob, 'start' | 'end'> &
      Readonly<{
        createdAt: number;
        startedAt: number;
        completedAt: number;
        worked: boolean;
      }>)
  | undefined => {
  if (
    job.conclusion === 'skipped' ||
    job.started_at === null ||
    job.completed_at === null
  ) {
    return undefined;
  }

  const startedAt = epochSeconds(job.started_at);

  const completedAt = epochSeconds(job.completed_at);

  const steps = Arr.generate(function* () {
    for (const step of job.steps) {
      if (
        step.conclusion !== 'skipped' &&
        step.started_at !== null &&
        step.completed_at !== null
      ) {
        yield {
          name: step.name,
          startedAt: epochSeconds(step.started_at),
          completedAt: epochSeconds(step.completed_at),
        };
      }
    }
  });

  const work = steps.filter(({ name }) => isWorkStep(name));

  const firstWork = work[0];

  const lastWork = work.at(-1);

  const total = completedAt - startedAt;

  const base = {
    name: job.name,
    createdAt: epochSeconds(job.created_at),
    startedAt,
    completedAt,
    queue: startedAt - epochSeconds(job.created_at),
    steps: steps.map((step) => ({
      name: step.name,
      seconds: step.completedAt - step.startedAt,
    })),
  } as const;

  if (firstWork === undefined || lastWork === undefined) {
    return { ...base, setup: total, work: 0, after: 0, worked: false };
  }

  return {
    ...base,
    setup: firstWork.startedAt - startedAt,
    work: lastWork.completedAt - firstWork.startedAt,
    after: completedAt - lastWork.completedAt,
    worked: true,
  };
};

const formatSpread = ({ median, p90 }: Spread): string =>
  `${(median / 60).toFixed(1)} / ${(p90 / 60).toFixed(1)}` as const;

if (isDirectlyExecuted(import.meta.url)) {
  const options = parseOptions(Arr.skip(process.argv, 2));

  if (Result.isErr(options)) {
    console.error(`${options.value}\n\n${USAGE}`);

    process.exit(1);
  }

  if (options.value === 'help') {
    console.log(USAGE);

    process.exit(0);
  }

  const context = await resolveApiContext(options.value.repo);

  if (Result.isErr(context)) {
    console.error(context.value);

    process.exit(1);
  }

  const measurement = await measureCiTime(
    context.value,
    options.value,
    (message) => {
      console.error(message);
    },
  ).catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(measurement)) {
    console.error(measurement.value);

    process.exit(1);
  }

  console.log(
    options.value.format === 'json'
      ? JSON.stringify(measurement.value, undefined, 2)
      : renderMarkdown(measurement.value, options.value),
  );
}
