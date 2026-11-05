import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import {
  matrixValues,
  readMatrix,
  readWorkflowJobs,
  type WorkflowJob,
} from './workflow-jobs.mjs';

const jobs = (text: string): readonly WorkflowJob[] => {
  const read = readWorkflowJobs(text);

  if (Result.isErr(read)) {
    throw new Error(read.value);
  }

  return read.value;
};

describe('readWorkflowJobs', () => {
  test('reads each step’s `run:` however YAML writes it', () => {
    const [job] = jobs(dedent`
      jobs:
        a:
          steps:
            - name: Then pnpm run named
              run: 'pnpm run single' # a comment
            - run: 'echo "can''t" && pnpm run double'
            - run: |
                pnpm run block
            - run: >-
                pnpm run
                folded
            - { name: flow, run: pnpm run flow }
            - uses: actions/github-script@v8
              with:
                script: core.info('pnpm run not-a-run')
    `);

    assert.deepStrictEqual(
      job?.steps.map(({ run }) => run),
      [
        'pnpm run single',
        'echo "can\'t" && pnpm run double',
        'pnpm run block\n',
        'pnpm run folded',
        'pnpm run flow',
        undefined,
      ],
    );
  });

  test('gives each job the workflow’s `env:` under its own, and each step its own', () => {
    const [job] = jobs(dedent`
      env:
        A: workflow
        B: workflow
      jobs:
        a:
          env:
            B: job
          steps:
            - env:
                COMMAND: \${{ matrix.command }}
              run: pnpm run "\${COMMAND}"
    `);

    assert.deepStrictEqual(job?.env, { A: 'workflow', B: 'job' });

    assert.deepStrictEqual(job?.steps[0]?.env, {
      // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
      COMMAND: '${{ matrix.command }}',
    });
  });

  test('reads a step’s working directory, or its job’s default, or its workflow’s', () => {
    const [job, other] = jobs(dedent`
      defaults:
        run:
          working-directory: apps/w
      jobs:
        a:
          defaults:
            run:
              working-directory: apps/a
          steps:
            - run: pnpm run x
            - run: pnpm run y
              working-directory: apps/b
        b:
          steps:
            - run: pnpm run z
    `);

    assert.deepStrictEqual(
      job?.steps.map(({ workingDirectory }) => workingDirectory),
      ['apps/a', 'apps/b'],
    );

    assert.strictEqual(other?.steps[0]?.workingDirectory, 'apps/w');
  });

  test('a file YAML cannot parse is an error, not no jobs', () => {
    assert.isTrue(Result.isErr(readWorkflowJobs('jobs:\n  a: [\n')));
  });
});

describe('readMatrix', () => {
  test('reads the `include:` entries and the listed keys, as strings', () => {
    const [job] = jobs(dedent`
      jobs:
        a:
          strategy:
            matrix:
              target: [minimum, lts] # a comment after the list
              include: # a comment after the key
                - name: first
                  command: ws:fix:lint:apps
                  build: ws:build:deps
                - command: 'ws:check:test:browser'
                  browser: true
    `);

    const matrix = readMatrix(job?.matrix);

    assert.deepStrictEqual(
      matrix,
      Result.ok({
        include: [
          {
            name: 'first',
            command: 'ws:fix:lint:apps',
            build: 'ws:build:deps',
          },
          { command: 'ws:check:test:browser', browser: 'true' },
        ],
        lists: { target: ['minimum', 'lts'] },
      }),
    );

    assert.deepStrictEqual(
      Result.isOk(matrix) ? matrixValues(matrix.value, 'command') : [],
      ['ws:fix:lint:apps', 'ws:check:test:browser'],
    );
  });

  test('reads a flow-style matrix', () => {
    const [job] = jobs(dedent`
      jobs:
        a:
          strategy: { matrix: { command: [check:md, check:prose] } }
    `);

    assert.deepStrictEqual(
      readMatrix(job?.matrix),
      Result.ok({
        include: [],
        lists: { command: ['check:md', 'check:prose'] },
      }),
    );
  });

  test('a matrix given as an expression is an error', () => {
    const [job] = jobs(dedent`
      jobs:
        a:
          strategy:
            matrix: \${{ fromJSON(needs.plan.outputs.matrix) }}
    `);

    assert.isTrue(Result.isErr(readMatrix(job?.matrix)));
  });

  test('no matrix is an empty one', () => {
    assert.deepStrictEqual(
      readMatrix(undefined),
      Result.ok({ include: [], lists: {} }),
    );
  });
});
