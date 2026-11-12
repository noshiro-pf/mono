// cspell:ignore Fowner
import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import {
  findCompositeGhCallsWithoutRepo,
  findGhCallsWithoutRepo,
  readsRepoFromGit,
} from './check-gh-needs-repo.mjs';

/**
 * A workflow of one job, `report`, whose steps are `steps` (written from column
 * 0) and whose `env:` is `env` when given.
 */
const workflow = (steps: string, env?: string): string =>
  [
    'on: workflow_dispatch',
    'jobs:',
    '  report:',
    '    runs-on: ubuntu-latest',
    ...(env === undefined ? [] : ['    env:', `      ${env}`]),
    '    steps:',
    ...steps.split('\n').map((line) => `      ${line}`),
  ].join('\n');

/** A composite action whose `runs.steps` are `steps`, written from column 0. */
const action = (steps: string): string =>
  [
    'name: Report',
    'runs:',
    '  using: composite',
    '  steps:',
    ...steps.split('\n').map((line) => `    ${line}`),
  ].join('\n');

const violations = (
  text: string,
  find = findGhCallsWithoutRepo,
): readonly string[] => {
  const result = find(text);

  if (Result.isErr(result)) {
    throw new Error(result.value);
  }

  return result.value.violations;
};

describe('findGhCallsWithoutRepo', () => {
  test('reports `gh issue list` in a job with no checkout', () => {
    assert.deepStrictEqual(
      violations(
        workflow(dedent`
          - name: Report
            env:
              GH_TOKEN: \${{ github.token }}
            run: gh issue list --state open
        `),
      ),
      ['report: Report: gh issue list --state open'],
    );
  });

  test('reports a call inside a command substitution', () => {
    assert.deepStrictEqual(
      violations(
        workflow(dedent`
          - name: Report
            run: existing="$(gh pr list --json number)"
        `),
      ),
      ['report: Report: gh pr list --json number'],
    );
  });

  test.each([
    {
      given: '`GH_REPO` in the step’s `env:`',
      text: workflow(dedent`
        - name: Report
          env:
            GH_REPO: \${{ github.repository }}
          run: gh issue list
      `),
    },
    {
      given: '`GH_REPO` in the job’s `env:`',
      text: workflow(
        dedent`
          - name: Report
            run: gh issue list
        `,
        // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
        'GH_REPO: ${{ github.repository }}',
      ),
    },
    {
      given: '`--repo` on the call',
      text: workflow(dedent`
        - name: Report
          run: gh issue list --repo "$GITHUB_REPOSITORY"
      `),
    },
    {
      given: '`-R` on the call',
      text: workflow(dedent`
        - name: Report
          run: gh issue list -R "$GITHUB_REPOSITORY"
      `),
    },
    {
      given: '`--repo=` on the call',
      text: workflow(dedent`
        - name: Report
          run: gh issue list --repo="$GITHUB_REPOSITORY"
      `),
    },
    {
      given: 'a checkout earlier in the job',
      text: workflow(dedent`
        - uses: actions/checkout@v6.0.0
        - name: Report
          run: gh issue list
      `),
    },
  ])('passes a call given its repository by $given', ({ text }) => {
    assert.deepStrictEqual(violations(text), []);
  });

  test.each([
    {
      given: 'an `if:`, which may skip it',
      checkout: dedent`
        - uses: actions/checkout@v6.0.0
          if: github.event_name == 'push'
      `,
    },
    {
      given: 'a `path:`, which puts it elsewhere',
      checkout: dedent`
        - uses: actions/checkout@v6.0.0
          with:
            path: sub
      `,
    },
    {
      given: 'a `repository:`, which checks out another',
      checkout: dedent`
        - uses: actions/checkout@v6.0.0
          with:
            repository: o/r
      `,
    },
  ])('a checkout with $given does not count', ({ checkout }) => {
    assert.deepStrictEqual(
      violations(
        workflow(
          [
            checkout,
            dedent`
              - name: Report
                run: gh issue list
            `,
          ].join('\n'),
        ),
      ),
      ['report: Report: gh issue list'],
    );
  });

  test.each([
    { given: 'an `export`', script: 'export GH_REPO=o/r\ngh issue list' },
    { given: 'a subshell', script: '( export GH_REPO=o/r )\ngh issue list' },
    {
      given: 'an assignment never exported',
      script: 'GH_REPO=o/r\ngh issue list',
    },
  ])(
    '`GH_REPO` set by the script in $given is not read: `env:` answers it',
    ({ script }) => {
      assert.deepStrictEqual(
        violations(
          workflow(
            [
              '- name: Report',
              '  run: |',
              ...script.split('\n').map((line) => `    ${line}`),
            ].join('\n'),
          ),
        ),
        ['report: Report: gh issue list'],
      );
    },
  );

  test.each([
    // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
    { directory: '${{ runner.temp }}' },
    { directory: '/tmp' },
    { directory: '../elsewhere' },
  ])(
    'a checkout does not serve a step whose `working-directory` is $directory',
    ({ directory }) => {
      assert.deepStrictEqual(
        violations(
          workflow(
            [
              '- uses: actions/checkout@v6.0.0',
              '- name: Report',
              `  working-directory: ${JSON.stringify(directory)}`,
              '  run: gh issue list',
            ].join('\n'),
          ),
        ),
        ['report: Report: gh issue list'],
      );
    },
  );

  test.each([
    { condition: 'failure()' },
    { condition: 'always()' },
    { condition: 'cancelled()' },
    // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
    { condition: '${{ !cancelled() }}' },
    { condition: 'success() || failure()' },
    { condition: '!failure()' },
    { condition: 'true' },
  ])(
    'a checkout after another step does not count, whatever the step’s `if: $condition`',
    ({ condition }) => {
      assert.deepStrictEqual(
        violations(
          workflow(
            [
              '- run: make',
              '- uses: actions/checkout@v6.0.0',
              '- name: Report',
              `  if: ${JSON.stringify(condition)}`,
              '  run: gh issue list',
            ].join('\n'),
          ),
        ),
        ['report: Report: gh issue list'],
      );
    },
  );

  test('a checkout as the job’s first step serves a step that runs past failures', () => {
    assert.deepStrictEqual(
      violations(
        workflow(dedent`
          - uses: actions/checkout@v6.0.0
          - run: make
          - name: Report
            if: always()
            run: gh issue list
        `),
      ),
      [],
    );
  });

  test('a checkout serves a step in a directory of it', () => {
    assert.deepStrictEqual(
      violations(
        workflow(dedent`
          - uses: actions/checkout@v6.0.0
          - name: Report
            working-directory: apps/x
            run: gh issue list
        `),
      ),
      [],
    );
  });

  test('`--repo` does not answer `gh api`, which takes no such flag', () => {
    assert.deepStrictEqual(
      violations(
        workflow(dedent`
          - name: Report
            run: gh api 'repos/{owner}/{repo}/pulls' --repo "$GITHUB_REPOSITORY"
        `),
      ),
      [
        'report: Report: gh api repos/{owner}/{repo}/pulls --repo $GITHUB_REPOSITORY',
      ],
    );
  });

  test('a `{branch}` placeholder is reported whatever gives the repository', () => {
    assert.deepStrictEqual(
      violations(
        workflow(
          dedent`
            - uses: actions/checkout@v6.0.0
            - name: Report
              run: gh api 'repos/{owner}/{repo}/branches/{branch}'
          `,
          'GH_REPO: o/r',
        ),
      ),
      ['report: Report: gh api repos/{owner}/{repo}/branches/{branch}'],
    );
  });

  test('a value that only starts with `-R` does not name the repository', () => {
    assert.deepStrictEqual(
      violations(
        workflow(dedent`
          - name: Report
            run: gh issue create --title Broken --body "-R flag rejected"
        `),
      ),
      [
        'report: Report: gh issue create --title Broken --body -R flag rejected',
      ],
    );
  });

  test('a later checkout ends what the first one serves', () => {
    assert.deepStrictEqual(
      violations(
        workflow(dedent`
          - uses: actions/checkout@v6.0.0
          - name: Before
            run: gh pr list
          - uses: actions/checkout@v6.0.0
            with:
              repository: other/tool
          - name: After
            run: gh pr list
        `),
      ),
      ['report: After: gh pr list'],
    );
  });

  test.each([
    { shell: 'pwsh', run: '$n = $(gh issue list).Count' },
    { shell: 'python', run: 'subprocess.run(["gh", "pr", "list"])' },
  ])(
    'takes a `$shell` script with a `gh` in it for a call: $run',
    ({ shell, run }) => {
      assert.deepStrictEqual(
        violations(
          workflow(
            [
              '- name: Report',
              `  shell: ${shell}`,
              `  run: ${JSON.stringify(run)}`,
            ].join('\n'),
          ),
        ),
        [`report: Report: (a \`${shell}\` script that runs gh)`],
      );
    },
  );

  test.each([
    {
      given: '`GH_REPO`',
      env: 'GH_REPO: o/r',
      checkout: false,
      run: 'gh issue list',
      expected: [],
    },
    {
      given: 'a first-step checkout',
      env: undefined,
      checkout: true,
      run: 'gh issue list',
      expected: [],
    },
    {
      given: '`--repo`, which is not read there',
      env: undefined,
      checkout: false,
      run: 'gh issue list --repo o/r',
      expected: ['report: Report: (a `pwsh` script that runs gh)'],
    },
  ])(
    'a script in another language given $given',
    ({ env, checkout, run, expected }) => {
      assert.deepStrictEqual(
        violations(
          workflow(
            [
              ...(checkout ? ['- uses: actions/checkout@v6.0.0'] : []),
              '- name: Report',
              '  shell: pwsh',
              `  run: ${JSON.stringify(run)}`,
            ].join('\n'),
            env,
          ),
        ),
        expected,
      );
    },
  );

  test('no `{branch}` is looked for in a script in another language', () => {
    assert.deepStrictEqual(
      violations(
        workflow(
          dedent`
            - name: Report
              shell: pwsh
              run: gh api 'repos/{owner}/{repo}/branches/{branch}'
          `,
          'GH_REPO: o/r',
        ),
      ),
      [],
    );
  });

  test('a script in another language with no `gh` makes no call', () => {
    assert.deepStrictEqual(
      findGhCallsWithoutRepo(
        workflow(dedent`
          - name: Report
            shell: python
            run: print("ghost")
        `),
      ),
      Result.ok({ violations: [], calls: 0 }),
    );
  });

  test.each([
    { shell: 'bash -e {0}' },
    { shell: '/usr/bin/bash -e {0}' },
    { shell: 'sh' },
  ])(
    'reads a step whose `shell` is `$shell` as a shell script',
    ({ shell }) => {
      assert.deepStrictEqual(
        violations(
          workflow(
            [
              '- name: Report',
              `  shell: ${shell}`,
              '  run: gh issue list',
            ].join('\n'),
          ),
        ),
        ['report: Report: gh issue list'],
      );
    },
  );

  test('a later checkout into a `path:` ends what the first one serves too', () => {
    assert.deepStrictEqual(
      violations(
        workflow(dedent`
          - uses: actions/checkout@v6.0.0
          - uses: actions/checkout@v6.0.0
            with:
              repository: o/tool
              path: tool
          - name: Report
            working-directory: tool
            run: gh pr list
        `),
      ),
      ['report: Report: gh pr list'],
    );
  });

  test.each([
    { container: 'node:24-slim', counts: false },
    { container: '{ image: node:24-slim }', counts: false },
    // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
    { container: '${{ matrix.image }}', counts: false },
    { container: "''", counts: true },
    { container: '', counts: true },
  ])(
    'a first-step checkout in a job with `container: $container` counts: $counts',
    ({ container, counts }) => {
      assert.deepStrictEqual(
        violations(
          [
            'on: workflow_dispatch',
            'jobs:',
            '  report:',
            '    runs-on: ubuntu-latest',
            `    container: ${container}`,
            '    steps:',
            '      - uses: actions/checkout@v6.0.0',
            '      - name: Report',
            '        run: gh issue list',
          ].join('\n'),
        ),
        counts ? [] : ['report: Report: gh issue list'],
      );
    },
  );

  test('a checkout after the step does not give it a repository', () => {
    assert.deepStrictEqual(
      violations(
        workflow(dedent`
          - name: Report
            run: gh issue list
          - uses: actions/checkout@v6.0.0
        `),
      ),
      ['report: Report: gh issue list'],
    );
  });

  test('a checkout in another job does not give this one a repository', () => {
    assert.deepStrictEqual(
      violations(dedent`
        on: workflow_dispatch
        jobs:
          build:
            runs-on: ubuntu-latest
            steps:
              - uses: actions/checkout@v6.0.0
          report:
            runs-on: ubuntu-latest
            steps:
              - name: Report
                run: gh issue list
      `),
      ['report: Report: gh issue list'],
    );
  });

  test('does not read a commented-out call', () => {
    assert.deepStrictEqual(
      violations(
        workflow(dedent`
          - name: Report
            run: |
              # gh issue list
              echo done
        `),
      ),
      [],
    );
  });

  test('passes `gh api` with a path of its own', () => {
    assert.deepStrictEqual(
      violations(
        workflow(dedent`
          - name: Report
            run: gh api "repos/\${GITHUB_REPOSITORY}/issues"
        `),
      ),
      [],
    );
  });

  test('counts the calls that read the repository, given one or not', () => {
    const result = findGhCallsWithoutRepo(
      workflow(dedent`
        - uses: actions/checkout@v6.0.0
        - name: Report
          run: |
            gh issue list
            gh api repos/a/b
            gh pr view 1
      `),
    );

    assert.deepStrictEqual(result, Result.ok({ violations: [], calls: 2 }));
  });

  test('is an error, not a pass, for a script it cannot read', () => {
    assert.isTrue(
      Result.isErr(
        findGhCallsWithoutRepo(
          workflow(dedent`
            - name: Report
              run: echo "unterminated
          `),
        ),
      ),
    );
  });
});

describe('findCompositeGhCallsWithoutRepo', () => {
  test('reports a call given no repository, whatever the caller checked out', () => {
    assert.deepStrictEqual(
      violations(
        action(dedent`
          - name: Find
            shell: bash
            run: gh pr view 1
        `),
        findCompositeGhCallsWithoutRepo,
      ),
      ['Find: gh pr view 1'],
    );
  });

  test.each([
    {
      given: '`GH_REPO` in the step’s `env:`',
      steps: dedent`
        - name: Find
          shell: bash
          env:
            GH_REPO: \${{ github.repository }}
          run: gh pr view 1
      `,
    },
    {
      given: '`--repo` on the call',
      steps: dedent`
        - name: Find
          shell: bash
          run: gh pr view 1 --repo "$GITHUB_REPOSITORY"
      `,
    },
  ])('passes a call given its repository by $given', ({ steps }) => {
    assert.deepStrictEqual(
      violations(action(steps), findCompositeGhCallsWithoutRepo),
      [],
    );
  });

  test('a checkout of its own does not count', () => {
    assert.deepStrictEqual(
      violations(
        action(dedent`
          - uses: actions/checkout@v6.0.0
          - name: Find
            shell: bash
            run: gh pr view 1
        `),
        findCompositeGhCallsWithoutRepo,
      ),
      ['Find: gh pr view 1'],
    );
  });

  test('reads an action that is not a composite one as having no calls', () => {
    assert.deepStrictEqual(
      findCompositeGhCallsWithoutRepo(
        dedent`
          name: Node
          runs:
            using: node24
            main: index.js
        `,
      ),
      Result.ok({ violations: [], calls: 0 }),
    );
  });
});

describe('readsRepoFromGit', () => {
  test.each([
    ['gh', 'issue', 'list'],
    ['gh', 'pr', 'view', '1'],
    ['gh', 'label', 'create', 'x'],
    ['gh', 'release', 'view'],
    ['gh', 'repo', 'view'],
    ['gh', 'browse'],
    ['/usr/bin/gh', 'issue', 'list'],
    ['gh', 'run', 'list'],
    ['gh', 'workflow', 'run', 'x.yml'],
    ['gh', 'api', 'repos/{owner}/{repo}/issues'],
    ['gh', 'api', 'repos/x/y/branches/{branch}'],
    ['gh', 'api', 'repos/:owner/:repo/issues'],
    ['gh', 'api', 'graphql', '-F', 'owner={owner}'],
    ['gh', 'api', 'graphql', '--field={repo}'],
    ['gh', 'api', 'graphql', '-Fowner={owner}'],
    ['gh', 'co', '1'],
  ])('%j reads the current repository', (...command) => {
    assert.isTrue(readsRepoFromGit(command));
  });

  test.each([
    ['gh', 'api', 'repos/x/y/issues'],
    ['gh', 'api', 'repos/x/y/branches', '--jq', '.[] | {branch}'],
    ['gh', 'api', 'graphql', '-f', 'query={repo}'],
    ['gh', 'api', 'repos/x/y', '--template={{.owner}}'],
    ['gh', 'auth', 'status'],
    ['gh', 'extension', 'install', 'x/y'],
    ['gh'],
    ['git', 'issue'],
    ['pnpm', 'run', 'x'],
  ])('%j does not', (...command) => {
    assert.isFalse(readsRepoFromGit(command));
  });
});
