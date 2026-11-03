import { Arr, Result } from 'ts-data-forge';
import {
  isWorkStep,
  measureEach,
  measureRun,
  parseOptions,
  renderMarkdown,
  spread,
  summarize,
  type Job,
  type Run,
} from './measure-ci-time.mjs';

const run: Run = {
  id: 1,
  html_url: 'https://github.com/o/n/actions/runs/1',
  created_at: '2026-11-03T05:24:00Z',
  run_attempt: 1,
} as const;

/** `HH:MM:SS` on the day of {@link run}. */
const at = (time: string): string => `2026-11-03T${time}Z` as const;

const step = (name: string, from: string, to: string): Job['steps'][number] =>
  ({
    name,
    conclusion: 'success',
    started_at: at(from),
    completed_at: at(to),
  }) as const;

const gates: Job = {
  name: 'gates / check',
  conclusion: 'success',
  created_at: at('05:24:00'),
  started_at: at('05:24:01'),
  completed_at: at('05:24:50'),
  steps: [
    step('Set up job', '05:24:01', '05:24:02'),
    step('Check diff', '05:24:02', '05:24:50'),
  ],
} as const;

const build: Job = {
  name: 'build',
  conclusion: 'success',
  created_at: at('05:24:50'),
  started_at: at('05:25:00'),
  completed_at: at('05:27:30'),
  steps: [
    step('Set up job', '05:25:00', '05:25:01'),
    step('Set up pnpm, Node.js and the dependencies', '05:25:01', '05:25:30'),
    step('Build all packages', '05:25:30', '05:27:10'),
    step('Upload the build output', '05:27:10', '05:27:30'),
  ],
} as const;

const skipped: Job = {
  name: 'coverage-main',
  conclusion: 'skipped',
  created_at: at('05:24:50'),
  started_at: at('05:24:50'),
  completed_at: at('05:24:49'),
  steps: [],
} as const;

describe('isWorkStep', () => {
  test('names the build and a matrix command, and nothing else', () => {
    assert.isTrue(isWorkStep('Build all packages'));

    assert.isTrue(isWorkStep('Run "ws:check:types:shard-1"'));

    assert.isFalse(isWorkStep('Set up pnpm, Node.js and the dependencies'));

    assert.isFalse(isWorkStep('Check if there is no file diff'));
  });
});

describe('measureRun', () => {
  test('splits each job into queue, setup, work and after, from the first job', () => {
    assert.deepStrictEqual(measureRun(run, [gates, build, skipped]), {
      id: 1,
      url: 'https://github.com/o/n/actions/runs/1',
      createdAt: '2026-11-03T05:24:00Z',
      wall: 210,
      lastToEnd: 'build',
      jobs: [
        {
          name: 'gates / check',
          queue: 1,
          start: 1,
          end: 50,
          setup: 49,
          work: 0,
          after: 0,
          steps: [
            { name: 'Set up job', seconds: 1 },
            { name: 'Check diff', seconds: 48 },
          ],
        },
        {
          name: 'build',
          queue: 10,
          start: 60,
          end: 210,
          setup: 30,
          work: 100,
          after: 20,
          steps: [
            { name: 'Set up job', seconds: 1 },
            { name: 'Set up pnpm, Node.js and the dependencies', seconds: 29 },
            { name: 'Build all packages', seconds: 100 },
            { name: 'Upload the build output', seconds: 20 },
          ],
        },
      ],
    });
  });

  test('leaves out a run in which no job did work', () => {
    assert.isUndefined(measureRun(run, [gates, skipped]));
  });

  test('leaves out a step that never ran, or that its `if` skipped', () => {
    const measured = measureRun(run, [
      {
        ...build,
        steps: Arr.concat(build.steps, [
          {
            name: 'Never',
            conclusion: null,
            started_at: null,
            completed_at: null,
          },
          {
            ...step('Install Playwright Browsers', '05:27:30', '05:27:30'),
            conclusion: 'skipped',
          },
        ]),
      },
    ]);

    assert.deepStrictEqual(
      measured?.jobs[0]?.steps.map(({ name }) => name),
      [
        'Set up job',
        'Set up pnpm, Node.js and the dependencies',
        'Build all packages',
        'Upload the build output',
      ],
    );
  });
});

/** Run 3 ran the gate alone, as a run that reused a verdict does. */
const jobsOf = (id: number): readonly Job[] =>
  id === 3 ? ([gates] as const) : ([gates, build] as const);

describe('measureEach', () => {
  test('measures the runs that did work, in order, up to the number wanted', async () => {
    const mut_read: number[] = [];

    const measured = await measureEach(
      (r) => {
        mut_read.push(r.id);

        return Promise.resolve(Result.ok(jobsOf(r.id)));
      },
      [
        { ...run, id: 1 },
        { ...run, id: 2, run_attempt: 2 },
        { ...run, id: 3 },
        { ...run, id: 4 },
        { ...run, id: 5 },
      ],
      2,
    );

    assert.isTrue(Result.isOk(measured));

    assert.deepStrictEqual(
      measured.value.measured.map(({ id }) => id),
      [1, 4],
    );

    assert.strictEqual(measured.value.examined, 4);

    // A re-run attempt is not read at all, and nothing after the second.
    assert.deepStrictEqual(mut_read, [1, 3, 4]);
  });

  test('stops at the first run whose jobs cannot be read', async () => {
    assert.deepStrictEqual(
      await measureEach(() => Promise.resolve(Result.err('403')), [run], 1),
      Result.err('403'),
    );
  });
});

describe('spread', () => {
  test('is the median and the 90th percentile by nearest rank', () => {
    assert.deepStrictEqual(spread([5, 1, 4, 2, 3, 6, 7, 8, 9, 10]), {
      median: 5,
      p90: 9,
    });

    assert.deepStrictEqual(spread([7]), { median: 7, p90: 7 });
  });
});

describe('summarize', () => {
  test('spreads each job and each step over the runs, latest-ending job first', () => {
    const one = measureRun(run, [gates, build]);

    const two = measureRun({ ...run, id: 2 }, [
      gates,
      {
        ...build,
        completed_at: at('05:28:30'),
        steps: [
          step('Set up job', '05:25:00', '05:25:01'),
          step(
            'Set up pnpm, Node.js and the dependencies',
            '05:25:01',
            '05:25:50',
          ),
          step('Build all packages', '05:25:50', '05:28:30'),
        ],
      },
    ]);

    assert.isTrue(one !== undefined && two !== undefined);

    const summary = summarize([one, two], { examined: 2, asked: 2 });

    assert.deepStrictEqual(summary.wall, { median: 210, p90: 270 });

    assert.deepStrictEqual(summary.lastToEnd, [{ name: 'build', count: 2 }]);

    assert.deepStrictEqual(
      summary.jobs.map(({ name, count, work }) => ({ name, count, work })),
      [
        { name: 'build', count: 2, work: { median: 100, p90: 160 } },
        { name: 'gates / check', count: 2, work: { median: 0, p90: 0 } },
      ],
    );

    assert.deepStrictEqual(summary.steps[0], {
      name: 'Build all packages',
      count: 2,
      seconds: { median: 100, p90: 160 },
    });
  });
});

describe('renderMarkdown', () => {
  test('writes minutes, and leaves short steps out', () => {
    const one = measureRun(run, [gates, build]);

    assert.isTrue(one !== undefined);

    const text = renderMarkdown(summarize([one], { examined: 1, asked: 1 }), {
      workflow: 'code-check.yml',
      runs: 1,
      event: 'pull_request',
      format: 'md',
      repo: undefined,
    });

    assert.include(text, '| `build` | 1 | 1.0 / 1.0 | 3.5 / 3.5 |');

    assert.include(
      text,
      'Ended last among the jobs that did work: `build` (1).',
    );

    assert.include(text, '| Build all packages | 1 | 1.7 / 1.7 |');

    assert.notInclude(text, '| Set up job |');

    assert.notInclude(text, 'Fewer than');

    assert.include(
      renderMarkdown(summarize([one], { examined: 300, asked: 20 }), {
        workflow: 'code-check.yml',
        runs: 20,
        event: 'pull_request',
        format: 'md',
        repo: undefined,
      }),
      'Fewer than the 20 asked for',
    );

    const piped = renderMarkdown(
      summarize(
        [
          {
            ...one,
            jobs: one.jobs.map((job) => ({
              ...job,
              steps: job.steps.map((s) => ({ ...s, name: 'Run "a || b"' })),
            })),
          },
        ],
        { examined: 1, asked: 1 },
      ),
      {
        workflow: 'code-check.yml',
        runs: 1,
        event: 'pull_request',
        format: 'md',
        repo: undefined,
      },
    );

    assert.include(piped, String.raw`| Run "a \|\| b" |`);
  });
});

describe('parseOptions', () => {
  test('defaults to the last 20 pull request runs of code-check.yml', () => {
    assert.deepStrictEqual(
      parseOptions([]),
      Result.ok({
        workflow: 'code-check.yml',
        runs: 20,
        event: 'pull_request',
        format: 'md',
        repo: undefined,
      }),
    );
  });

  test('reads every flag, and refuses a bad count or format', () => {
    assert.deepStrictEqual(
      parseOptions([
        '--workflow',
        'style-check.yml',
        '--runs',
        '5',
        '--event',
        'push',
        '--format',
        'json',
        '--repo',
        'o/n',
      ]),
      Result.ok({
        workflow: 'style-check.yml',
        runs: 5,
        event: 'push',
        format: 'json',
        repo: 'o/n',
      }),
    );

    assert.isTrue(Result.isErr(parseOptions(['--runs', '0'])));

    assert.isTrue(Result.isErr(parseOptions(['--format', 'csv'])));

    assert.isTrue(Result.isErr(parseOptions(['--workflow', '../x.yml?a'])));

    for (const workflow of ['12345', 'style-check.yaml']) {
      assert.isTrue(Result.isOk(parseOptions(['--workflow', workflow])));
    }
  });
});
