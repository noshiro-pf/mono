import dedent from 'dedent';
import {
  checkJobsOf,
  collectGuideViolations,
  isCheckWorkflow,
  tableChecks,
} from './check-unblock-prs-guide.mjs';

describe('checkJobsOf', () => {
  test('names each job that does work, without its matrix suffix', () => {
    const workflow = dedent`
      name: Example

      on: pull_request

      jobs:
        gates:
          uses: ./.github/workflows/check-gates.yml

        code-check:
          name: code-check (\${{ matrix.command }})
          runs-on: ubuntu-latest

        example-job:
          runs-on: ubuntu-latest

        semantic-pull-request:
          name: Validate PR title
          runs-on: ubuntu-latest

        code-check-result:
          uses: ./.github/workflows/check-result.yml
    `;

    assert.deepStrictEqual(checkJobsOf(`${workflow}\n`), [
      'code-check',
      'example-job',
      'Validate PR title',
    ]);
  });
});

describe('tableChecks', () => {
  test('reads the first column of the section table', () => {
    const guide = dedent`
      ## Reproducing a check

      | Check                                      | What to run |
      | :----------------------------------------- | :---------- |
      | \`test-node-versions (<target>, <command>)\` | build, test |
      | \`Validate PR title\`                        | edit it     |

      ## Another section

      | \`not-this\` | x |
    `;

    assert.deepStrictEqual(tableChecks(guide), [
      'test-node-versions',
      'Validate PR title',
    ]);
  });
});

describe('collectGuideViolations', () => {
  test('accepts a table covering every job not named by its command', () => {
    assert.deepStrictEqual(
      collectGuideViolations(
        ['code-check', 'style-check', 'benchmark'],
        ['benchmark'],
      ),
      [],
    );
  });

  // #2878: a job added with no row, and a row left for a deleted workflow.
  test('names a job with no row and a row with no job', () => {
    assert.deepStrictEqual(
      collectGuideViolations(['benchmark'], ['backup-repository-settings']),
      [
        '`benchmark` is not named by the command it runs, and the table has no row for it.',
        'The table has a row for `backup-repository-settings`, which no check workflow runs.',
      ],
    );
  });
});

describe('isCheckWorkflow', () => {
  test('takes a workflow gated by check-gates.yml, and the pull request lint', () => {
    assert.isTrue(
      isCheckWorkflow({
        file: 'new-check.yml',
        text: 'jobs:\n  gates:\n    uses: ./.github/workflows/check-gates.yml\n',
      }),
    );

    assert.isTrue(isCheckWorkflow({ file: 'lint-pull-request.yml', text: '' }));

    assert.isFalse(
      isCheckWorkflow({ file: 'release.yml', text: 'jobs:\n  release:\n' }),
    );
  });
});
