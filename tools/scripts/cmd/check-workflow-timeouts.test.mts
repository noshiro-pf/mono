import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import {
  collectTimeoutViolations,
  parseWorkflowJobs,
  type Workflow,
} from './check-workflow-timeouts.mjs';

const workflowFile = dedent`
  name: Code Check

  on:
    pull_request:

  jobs:
    gates:
      uses: ./.github/workflows/check-gates.yml

    # A comment between two jobs.
    build:
      needs: gates
      runs-on: ubuntu-latest
      timeout-minutes: 15
      steps:
        - name: Build
          timeout-minutes: 40
          run: pnpm run ws:build

    code-check:
      runs-on: ubuntu-latest
      steps:
        - run: pnpm run check-all
`;

const workflow = (
  jobs: Workflow['jobs'],
  relativePath = '.github/workflows/code-check.yml',
): Workflow => ({ relativePath, jobs }) as const;

describe('parseWorkflowJobs', () => {
  test('reads each job, whether it runs on a runner, and its own timeout', () => {
    assert.deepStrictEqual(
      parseWorkflowJobs(workflowFile),
      Result.ok([
        { jobId: 'gates', runsOnRunner: false, timeout: undefined },
        { jobId: 'build', runsOnRunner: true, timeout: '15' },
        { jobId: 'code-check', runsOnRunner: true, timeout: undefined },
      ]),
    );
  });

  test('reads a job written in flow style, or with quoted keys, as YAML does', () => {
    assert.deepStrictEqual(
      parseWorkflowJobs(dedent`
        jobs:
          a: { runs-on: ubuntu-latest, timeout-minutes: 5, steps: [] }
          "b":
            "runs-on": ubuntu-latest
            'timeout-minutes': 7
          c:
            runs-on: [self-hosted, linux]
            timeout-minutes: \${{ inputs.minutes }}
      `),
      Result.ok([
        { jobId: 'a', runsOnRunner: true, timeout: '5' },
        { jobId: 'b', runsOnRunner: true, timeout: '7' },
        {
          jobId: 'c',
          runsOnRunner: true,
          // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
          timeout: '${{ inputs.minutes }}',
        },
      ]),
    );
  });

  test('reads no job from a workflow without a jobs block', () => {
    assert.deepStrictEqual(parseWorkflowJobs('name: Empty\n'), Result.ok([]));
  });

  test('a file YAML cannot parse is an error, not no jobs', () => {
    assert.isTrue(Result.isErr(parseWorkflowJobs('jobs:\n  a: [\n')));
  });
});

describe('collectTimeoutViolations', () => {
  test('accepts a runner job within the ceiling and a reusable workflow call', () => {
    const violations = collectTimeoutViolations(
      [
        workflow([
          { jobId: 'gates', runsOnRunner: false, timeout: undefined },
          { jobId: 'build', runsOnRunner: true, timeout: '15' },
        ]),
      ],
      {},
    );

    assert.deepStrictEqual(violations, []);
  });

  test('reports a runner job with no timeout', () => {
    const violations = collectTimeoutViolations(
      [workflow([{ jobId: 'build', runsOnRunner: true, timeout: undefined }])],
      {},
    );

    assert.deepStrictEqual(violations, [
      'code-check.yml#build: declares no `timeout-minutes`, so it may run for six hours.',
    ]);
  });

  test('reports a timeout above the ceiling', () => {
    const violations = collectTimeoutViolations(
      [workflow([{ jobId: 'build', runsOnRunner: true, timeout: '25' }])],
      {},
    );

    assert.deepStrictEqual(violations, [
      'code-check.yml#build: `timeout-minutes: 25` is above 15.',
    ]);
  });

  test('reports a timeout that is not a whole number of minutes', () => {
    const violations = collectTimeoutViolations(
      [workflow([{ jobId: 'build', runsOnRunner: true, timeout: '1.5' }])],
      {},
    );

    assert.deepStrictEqual(violations, [
      'code-check.yml#build: `timeout-minutes: 1.5` is not a whole number of minutes.',
    ]);
  });

  test('accepts a listed job up to its own limit, and not past it', () => {
    const longer = {
      'code-check.yml#build': { minutes: 20, reason: 'slow' },
    } as const;

    assert.deepStrictEqual(
      collectTimeoutViolations(
        [workflow([{ jobId: 'build', runsOnRunner: true, timeout: '20' }])],
        longer,
      ),
      [],
    );

    assert.deepStrictEqual(
      collectTimeoutViolations(
        [workflow([{ jobId: 'build', runsOnRunner: true, timeout: '25' }])],
        longer,
      ),
      [
        'code-check.yml#build: `timeout-minutes: 25` is above 20, the LONGER_TIMEOUTS entry given because slow.',
      ],
    );
  });

  test('reports a listed job that no longer needs its entry', () => {
    const violations = collectTimeoutViolations(
      [workflow([{ jobId: 'build', runsOnRunner: true, timeout: '10' }])],
      { 'code-check.yml#build': { minutes: 20, reason: 'slow' } },
    );

    assert.deepStrictEqual(violations, [
      'code-check.yml#build: is in LONGER_TIMEOUTS at 20, but declares 10, within the ceiling; remove the entry.',
    ]);
  });

  test('reports an entry that names no runner job', () => {
    const violations = collectTimeoutViolations(
      [workflow([{ jobId: 'gates', runsOnRunner: false, timeout: undefined }])],
      {
        'code-check.yml#gates': { minutes: 20, reason: 'slow' },
        'code-check.yml#gone': { minutes: 20, reason: 'slow' },
      },
    );

    assert.deepStrictEqual(violations, [
      'code-check.yml#gates: is in LONGER_TIMEOUTS, but no workflow has a runner job of that name.',
      'code-check.yml#gone: is in LONGER_TIMEOUTS, but no workflow has a runner job of that name.',
    ]);
  });
});
