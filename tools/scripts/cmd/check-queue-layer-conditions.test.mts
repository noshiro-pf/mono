import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import { readWorkflowJobs, type WorkflowJob } from '../lib/workflow-jobs.mjs';
import {
  checkQueueLayerConditions,
  findQueueLayerViolations,
  isPullRequestOnly,
} from './check-queue-layer-conditions.mjs';

const jobs = (text: string): readonly WorkflowJob[] => {
  const read = readWorkflowJobs(text);

  if (Result.isErr(read)) {
    throw new Error(read.value);
  }

  return read.value;
};

/** A workflow that calls the gate, with `work`'s jobs beside the gate's. */
const checkWorkflow = (work: string): readonly WorkflowJob[] =>
  jobs(
    [
      'jobs:',
      '  gates:',
      '    uses: ./.github/workflows/check-gates.yml',
      ...work.split('\n').map((line) => `  ${line}`),
    ].join('\n'),
  );

describe(isPullRequestOnly, () => {
  test('a condition true only on a pull request', () => {
    assert.isTrue(
      isPullRequestOnly(
        "failure() && github.event_name == 'pull_request' && steps.command.outcome == 'failure'",
      ),
    );

    assert.isTrue(isPullRequestOnly("github.event_name=='pull_request'"));
  });

  test('a layer test that is negated, or that every branch passes, is not one', () => {
    assert.isTrue(
      isPullRequestOnly(
        "github.event_name == 'pull_request' && ! startsWith(github.ref, 'refs/heads/queue/')",
      ),
    );

    assert.isTrue(
      isPullRequestOnly(
        "github.event_name == 'pull_request' || startsWith(github.ref, 'refs/heads/')",
      ),
    );

    assert.isTrue(
      isPullRequestOnly(
        "github.event_name == 'pull_request' && !  startsWith(github.ref, 'refs/heads/queue/')",
      ),
    );

    assert.isTrue(
      isPullRequestOnly(
        "github.event_name == 'pull_request' || startsWith(github.ref, 'refs/heads/release/')",
      ),
    );
  });

  test('a condition that reads a queue layer too, or no pull request at all', () => {
    assert.isFalse(
      isPullRequestOnly(
        "(github.event_name == 'pull_request' || startsWith(github.ref, 'refs/heads/queue/')) && failure()",
      ),
    );

    // The skip-ci conditions every gated job carries.
    assert.isFalse(
      isPullRequestOnly(
        "github.event_name != 'pull_request' || !contains(github.event.pull_request.labels.*.name, 'skip-ci')",
      ),
    );

    assert.isFalse(isPullRequestOnly("github.event_name == 'push'"));

    assert.isFalse(isPullRequestOnly(undefined));
  });
});

describe(findQueueLayerViolations, () => {
  test('names a step and a job of a check workflow that run only on a pull request', () => {
    const violations = findQueueLayerViolations(
      [
        {
          file: 'code-check.yml',
          jobs: checkWorkflow(dedent`
            work:
              if: github.event_name == 'pull_request'
              steps:
                - name: Report
                  if: failure() && github.event_name == 'pull_request'
                - if: github.event_name == 'pull_request'
                - name: Both
                  if: github.event_name == 'pull_request' || startsWith(github.ref, 'refs/heads/queue/')
          `),
        },
      ],
      {},
    );

    assert.deepStrictEqual(
      violations.map((message) => message.split(':', 2).join(':')),
      [
        'code-check.yml: work',
        'code-check.yml: work / Report',
        'code-check.yml: work / step 2',
      ],
    );
  });

  test('reads only the workflows that call the gate', () => {
    assert.deepStrictEqual(
      findQueueLayerViolations(
        [
          {
            file: 'lint-pull-request.yml',
            jobs: jobs(dedent`
              jobs:
                title:
                  if: github.event_name == 'pull_request'
            `),
          },
        ],
        {},
      ),
      [],
    );
  });

  test('an allowed condition passes; an entry with no condition or no reason is reported', () => {
    const workflows = [
      {
        file: 'code-check.yml',
        jobs: checkWorkflow(dedent`
          upload:
            if: github.event_name == 'pull_request'
        `),
      },
    ] as const;

    assert.deepStrictEqual(
      findQueueLayerViolations(workflows, {
        'code-check.yml: upload': 'The layer uploads its own.',
      }),
      [],
    );

    const stale = findQueueLayerViolations(workflows, {
      'code-check.yml: upload': ' ',
      'code-check.yml: gone': 'Was here once.',
    });

    assert.deepStrictEqual(
      stale.map((message) =>
        message.includes('names code-check.yml: upload with no reason')
          ? 'no reason'
          : message.includes('names code-check.yml: gone, which is no')
            ? 'stale'
            : message,
      ),
      ['no reason', 'stale'],
    );
  });
});

describe('findQueueLayerViolations, on a key two conditions share', () => {
  test('is reported, so that one entry cannot answer for both', () => {
    const violations = findQueueLayerViolations(
      [
        {
          file: 'code-check.yml',
          jobs: checkWorkflow(dedent`
            work:
              steps:
                - name: Upload
                  if: github.event_name == 'pull_request'
                - name: Upload
                  if: failure() && github.event_name == 'pull_request'
          `),
        },
      ],
      { 'code-check.yml: work / Upload': 'The layer uploads its own.' },
    );

    assert.deepStrictEqual(
      violations.map((message) => message.split(':', 3).join(':')),
      ['code-check.yml: work / Upload: more than one pull-request-only `if'],
    );
  });
});

describe(checkQueueLayerConditions, () => {
  test('the repository’s check workflows pass', async () => {
    const result = await checkQueueLayerConditions();

    assert.isTrue(Result.isOk(result));
  });
});
