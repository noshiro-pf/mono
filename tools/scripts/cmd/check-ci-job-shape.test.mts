import dedent from 'dedent';
import { findJobShapeViolations } from './check-ci-job-shape.mjs';

const ciJobWorkflow = dedent`
  jobs:
    gates:
      uses: ./.github/workflows/check-gates.yml
    code-check:
      strategy:
        matrix:
          include:
            - command: check:root
              build: ws:build:deps
      steps:
        - id: command
          run: pnpm run z:ci-job --build \${{ matrix.build }} --command \${{ matrix.command }}
        - run: |
            pnpm run --silent z:check-changed-gap --job "\${GAP_JOB}" --base "\${GAP_BASE}"
`;

const rawWorkflow = dedent`
  jobs:
    test:
      strategy:
        matrix:
          command: [ws:check:test]
      steps:
        - env:
            COMMAND: \${{ matrix.command }}
          run: pnpm run "\${COMMAND}"
        - run: pnpm run z:assert-repo-is-clean
`;

type Workflow = Readonly<{
  relativePath: string;
  text: string;
  isCheck: boolean;
}>;

const workflow = (
  relativePath: string,
  text: string,
  isCheck = true,
): Workflow => ({ relativePath, text, isCheck }) as const;

const violations = (
  workflows: readonly Workflow[],
  checkAllWorkflows: readonly string[],
  rawAllowed: readonly Readonly<{
    relativePath: string;
    reason: string;
  }>[] = [],
): readonly string[] =>
  findJobShapeViolations({ workflows, checkAllWorkflows, rawAllowed });

/** `text` with `from` replaced, which it must contain. */
const replaced = (text: string, from: string, to: string): string => {
  assert.include(text, from);

  return text.replace(from, () => to);
};

const allow = (relativePath: string, reason = 'other Node versions') =>
  ({ relativePath, reason }) as const;

describe('findJobShapeViolations', () => {
  test('a matrix job through z:ci-job with its report, read by check-all, passes', () => {
    assert.deepStrictEqual(
      violations(
        [workflow('.github/workflows/a.yml', ciJobWorkflow)],
        ['.github/workflows/a.yml'],
      ),
      [],
    );
  });

  test('a matrix job that does not run z:ci-job is bare, however it runs the entry', () => {
    const found = violations(
      [workflow('.github/workflows/b.yml', rawWorkflow)],
      [],
    );

    assert.lengthOf(found, 1);

    assert.include(found[0], '.github/workflows/b.yml (job `test`)');

    assert.include(found[0], 'z:ci-job');
  });

  test('a workflow allowed its bare matrix, with a reason, passes', () => {
    assert.deepStrictEqual(
      violations(
        [workflow('.github/workflows/b.yml', rawWorkflow)],
        [],
        [allow('.github/workflows/b.yml')],
      ),
      [],
    );
  });

  test('an allowance with no reason is a violation', () => {
    const found = violations(
      [workflow('.github/workflows/b.yml', rawWorkflow)],
      [],
      [allow('.github/workflows/b.yml', ' ')],
    );

    assert.lengthOf(found, 1);

    assert.include(found[0], 'reason');
  });

  test('an allowance its workflow no longer needs, or whose workflow is gone, is stale', () => {
    for (const workflows of [
      [workflow('.github/workflows/b.yml', ciJobWorkflow)],
      [],
      [workflow('.github/workflows/b.yml', rawWorkflow, false)],
    ]) {
      const found = violations(
        workflows,
        workflows.some(({ text, isCheck }) => isCheck && text === ciJobWorkflow)
          ? ['.github/workflows/b.yml']
          : [],
        [allow('.github/workflows/b.yml')],
      );

      assert.lengthOf(found, 1);

      assert.include(found[0], 'remove');
    }
  });

  test('a z:ci-job job without the report step is a violation, job by job', () => {
    const twoJobs = [
      ciJobWorkflow,
      '  second:',
      '    strategy:',
      '      matrix:',
      '        include:',
      '          - command: check:md',
      '    steps:',
      // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
      '      - run: pnpm run z:ci-job --command ${{ matrix.command }}',
    ].join('\n');

    const found = violations(
      [workflow('.github/workflows/a.yml', twoJobs)],
      ['.github/workflows/a.yml'],
    );

    assert.lengthOf(found, 1);

    assert.include(found[0], 'job `second`');

    assert.include(found[0], 'z:check-changed-gap');
  });

  test('a z:ci-job job that asserts a clean tree again is a violation', () => {
    const found = violations(
      [
        workflow(
          '.github/workflows/a.yml',
          `${ciJobWorkflow}\n      - run: pnpm run z:assert-repo-is-clean`,
        ),
      ],
      ['.github/workflows/a.yml'],
    );

    assert.lengthOf(found, 1);

    assert.include(found[0], 'z:assert-repo-is-clean');
  });

  test('a step name and a trailing comment are not what the job runs', () => {
    const named = dedent`
      jobs:
        a:
          strategy:
            matrix:
              include:
                - command: check:root
          steps:
            - name: Unlike pnpm run z:assert-repo-is-clean, this names the step
              run: pnpm run z:ci-job --command \${{ matrix.command }} # pnpm run --silent z:check-changed-gap --job x
    `;

    const found = violations(
      [workflow('.github/workflows/a.yml', named)],
      ['.github/workflows/a.yml'],
    );

    assert.lengthOf(found, 1);

    assert.include(found[0], 'z:check-changed-gap');
  });

  test('a z:ci-job job that also runs an entry bare is a violation', () => {
    const found = violations(
      [
        workflow(
          '.github/workflows/a.yml',
          `${ciJobWorkflow}\n      - run: pnpm run \${{ matrix.command }}`,
        ),
      ],
      ['.github/workflows/a.yml'],
    );

    assert.lengthOf(found, 1);

    assert.include(found[0], 'beside');
  });

  test('a z:ci-job job on a matrix check-all cannot read is a violation', () => {
    const listed = ciJobWorkflow.replace(
      /include:[\s\S]*?build: ws:build:deps/u,
      'command: [check:root]',
    );

    const found = violations(
      [workflow('.github/workflows/a.yml', listed)],
      ['.github/workflows/a.yml'],
    );

    assert.lengthOf(found, 1);

    assert.include(found[0], 'cannot read');
  });

  test('a `#` in quotes is no comment', () => {
    const quoted = ciJobWorkflow.replace(
      'pnpm run --silent z:check-changed-gap',
      'echo "step #1" && pnpm run --silent z:check-changed-gap',
    );

    assert.deepStrictEqual(
      violations(
        [workflow('.github/workflows/a.yml', quoted)],
        ['.github/workflows/a.yml'],
      ),
      [],
    );
  });

  test('a bare run joined to the z:ci-job line and a missing --build are seen', () => {
    for (const [changed, expected] of [
      [
        ciJobWorkflow.replace(
          // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
          '--command ${{ matrix.command }}',
          // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
          '--command ${{ matrix.command }} && pnpm run ${{ matrix.command }}',
        ),
        'beside',
      ],
      [
        // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
        ciJobWorkflow.replace('--build ${{ matrix.build }} ', ''),
        'cannot read',
      ],
    ] as const) {
      const found = violations(
        [workflow('.github/workflows/a.yml', changed)],
        ['.github/workflows/a.yml'],
      );

      assert.lengthOf(found, 1);

      assert.include(found[0], expected);
    }
  });

  test('the report step naming the entry inline is not a bare run', () => {
    const inline = ciJobWorkflow.replace(
      // eslint-disable-next-line no-template-curly-in-string -- a shell variable, not a template.
      '--job "${GAP_JOB}"',
      // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
      '--job "${{ matrix.command }}"',
    );

    assert.deepStrictEqual(
      violations(
        [workflow('.github/workflows/a.yml', inline)],
        ['.github/workflows/a.yml'],
      ),
      [],
    );
  });

  test('CRLF line endings read as LF', () => {
    assert.deepStrictEqual(
      violations(
        [
          workflow(
            '.github/workflows/a.yml',
            ciJobWorkflow
              .replaceAll('\n', '\r\n')
              .replace('  code-check:', '\r\n  code-check:'),
          ),
        ],
        ['.github/workflows/a.yml'],
      ),
      [],
    );
  });

  test('a commented `jobs:`, a flow-style matrix and a quoted `#` are read', () => {
    const odd = dedent`
      jobs: # the work
        test:
          strategy: { matrix: { command: [a] } }
          steps:
            # A plain scalar would end at \` #\`, for GitHub too.
            - run: 'echo "step #1" && pnpm run \${{ matrix.command }}'
    `;

    const found = violations([workflow('.github/workflows/c.yml', odd)], []);

    assert.lengthOf(found, 1);

    assert.include(found[0], 'job `test`');
  });

  test('a script whose name only begins like one of them is not it', () => {
    const lookalike = ciJobWorkflow.replace(
      'z:check-changed-gap',
      'z:check-changed-gap-legacy',
    );

    const found = violations(
      [workflow('.github/workflows/a.yml', lookalike)],
      ['.github/workflows/a.yml'],
    );

    assert.lengthOf(found, 1);

    assert.include(found[0], 'z:check-changed-gap');
  });

  test('a top-level key after the jobs belongs to no job', () => {
    const trailing =
      `${ciJobWorkflow}\nenv:\n  NOTE: pnpm run z:assert-repo-is-clean` as const;

    assert.deepStrictEqual(
      violations(
        [workflow('.github/workflows/a.yml', trailing)],
        ['.github/workflows/a.yml'],
      ),
      [],
    );
  });

  test('check-all reads exactly the check workflows that run through z:ci-job', () => {
    const missing = violations(
      [workflow('.github/workflows/a.yml', ciJobWorkflow)],
      [],
    );

    assert.lengthOf(missing, 1);

    assert.include(missing[0], 'MATRIX_WORKFLOWS');

    const extra = violations(
      [workflow('.github/workflows/a.yml', ciJobWorkflow)],
      ['.github/workflows/a.yml', '.github/workflows/gone.yml'],
    );

    assert.lengthOf(extra, 1);

    assert.include(extra[0], '.github/workflows/gone.yml');
  });

  test('a listed workflow that no pull request runs is named as such', () => {
    const found = violations(
      [workflow('.github/workflows/a.yml', ciJobWorkflow, false)],
      ['.github/workflows/a.yml'],
    );

    assert.lengthOf(found, 1);

    assert.include(found[0], 'pull request');
  });

  test.each([
    [
      'through a variable',
      dedent`
        - env:
            COMMAND: \${{ matrix.command }}
          run: pnpm run "\${COMMAND}"
      `,
    ],
    // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
    ['after a pipe', '- run: echo start | pnpm run ${{ matrix.command }}'],
    // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
    ['in the background', '- run: true & pnpm run ${{ matrix.command }}'],
    // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
    ['in a substitution', '- run: echo "$(pnpm run ${{ matrix.command }})"'],
  ] as const)(
    'a matrix entry run bare %s beside z:ci-job is a violation',
    (_, step) => {
      const found = violations(
        [
          workflow(
            '.github/workflows/a.yml',
            `${ciJobWorkflow}\n${step.replaceAll(/^/gmu, ' '.repeat(6))}`,
          ),
        ],
        ['.github/workflows/a.yml'],
      );

      assert.lengthOf(found, 1);

      assert.include(found[0], 'beside');
    },
  );

  test('a z:ci-job call continued over lines is read whole', () => {
    const continued = replaced(
      ciJobWorkflow,
      // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
      'run: pnpm run z:ci-job --build ${{ matrix.build }} --command ${{ matrix.command }}',
      // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
      'run: |\n            pnpm run z:ci-job \\\n              --build ${{ matrix.build }} \\\n              --command ${{ matrix.command }}',
    );

    assert.deepStrictEqual(
      violations(
        [workflow('.github/workflows/a.yml', continued)],
        ['.github/workflows/a.yml'],
      ),
      [],
    );
  });

  test('an apostrophe or a character outside the BMP opens no quote before a comment', () => {
    const commented = replaced(
      ciJobWorkflow,
      '\n    steps:',
      [
        '',
        '    env:',
        "      NOTE: can't stop # pnpm run z:assert-repo-is-clean",
        '      PARTY: 🎉 # pnpm run z:assert-repo-is-clean',
        '    steps:',
      ].join('\n'),
    );

    assert.deepStrictEqual(
      violations(
        [workflow('.github/workflows/a.yml', commented)],
        ['.github/workflows/a.yml'],
      ),
      [],
    );
  });

  test('an `include:` with a comment after it, its entries led by `name:`, is read', () => {
    const named = replaced(
      ciJobWorkflow,
      '        include:\n          - command: check:root',
      '        include: # the entries\n          - name: root\n            command: check:root',
    );

    assert.deepStrictEqual(
      violations(
        [workflow('.github/workflows/a.yml', named)],
        ['.github/workflows/a.yml'],
      ),
      [],
    );
  });

  // check-all reads the `include:` entries alone; `needs: [a, b]` is no matrix.
  test('a matrix key given as a list beside `include:` is a violation', () => {
    const listed = replaced(
      replaced(
        ciJobWorkflow,
        '        include:',
        '        command: [check:md, check:prose]\n        include:',
      ),
      '    strategy:',
      '    needs: [gates, other]\n    strategy:',
    );

    const found = violations(
      [workflow('.github/workflows/a.yml', listed)],
      ['.github/workflows/a.yml'],
    );

    assert.lengthOf(found, 1);

    assert.include(found[0], '`command` given as a list');
  });

  test('a workflow YAML cannot parse is a violation', () => {
    const found = violations(
      [workflow('.github/workflows/a.yml', 'jobs:\n  a: [\n')],
      [],
    );

    assert.lengthOf(found, 1);
  });
});
