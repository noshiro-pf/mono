// cspell:ignore unstub
import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Arr, Result } from 'ts-data-forge';
import {
  checkLinkCheckScope,
  findLinkCheckScopeViolations,
  matchesPathsFilterGlob,
  runListStep,
} from './check-link-check-scope.mjs';

const WORKFLOW = dedent`
  on:
    pull_request:
      paths:
        - 'apps/*-docs/**.md'
        - 'libs/synstate*/**.md'
`;

const TRACKED = [
  'apps/a-docs/README.md',
  'apps/a-docs/src/index.mts',
  'apps/a-docs/CHANGELOG.md',
  'apps/app/README.md',
  'apps/app/api-docs/x.md',
  'libs/synstate/README.md',
  'libs/other/README.md',
] as const;

const LISTED = ['apps/a-docs/README.md', 'libs/synstate/README.md'] as const;

const messagesOf = (
  input: Partial<Parameters<typeof findLinkCheckScopeViolations>[0]>,
): readonly string[] => {
  const result = findLinkCheckScopeViolations({
    workflow: WORKFLOW,
    tracked: TRACKED,
    listed: LISTED,
    publishedSites: ['a-docs'],
    ...input,
  });

  assert.isTrue(Result.isOk(result));

  return result.value.messages;
};

describe(findLinkCheckScopeViolations, () => {
  test('accepts a list and a filter that take in the scope exactly', () => {
    assert.deepStrictEqual(messagesOf({}), []);
  });

  test('names a file of the scope the list step leaves out', () => {
    const messages = messagesOf({ listed: ['libs/synstate/README.md'] });

    assert.lengthOf(messages, 1);

    assert.include(messages[0], 'apps/a-docs/README.md: in SCOPE_PATTERN');
  });

  test('names a listed file outside the scope', () => {
    const messages = messagesOf({
      listed: Arr.toPushed(LISTED, 'libs/other/README.md'),
    });

    assert.lengthOf(messages, 1);

    assert.include(messages[0], 'libs/other/README.md: listed');
  });

  test('names a file of the scope the paths filter does not take in', () => {
    const messages = messagesOf({
      workflow: dedent`
        on:
          pull_request:
            paths:
              - 'libs/synstate*/**.md'
      `,
    });

    assert.lengthOf(messages, 1);

    assert.include(messages[0], 'apps/a-docs/README.md: in SCOPE_PATTERN');

    assert.include(messages[0], 'paths filter');
  });

  test('refuses a negated pattern, which it does not read', () => {
    const messages = messagesOf({
      workflow: dedent`
        on:
          pull_request:
            paths:
              - 'apps/*-docs/**.md'
              - 'libs/synstate*/**.md'
              - '!apps/a-docs/**.md'
      `,
    });

    assert.lengthOf(messages, 1);

    assert.include(messages[0], "'!apps/a-docs/**.md'");
  });

  test('refuses a pattern with syntax it does not read', () => {
    const messages = messagesOf({
      workflow: dedent`
        on:
          pull_request:
            paths:
              - 'apps/*-docs/**.md'
              - 'libs/synstate*/**.md'
              - 'libs/synstate?/**.md'
      `,
    });

    assert.lengthOf(messages, 1);

    assert.include(messages[0], "'libs/synstate?/**.md'");
  });

  test('names a docs site deploy-pages.yml does not publish', () => {
    const messages = messagesOf({ publishedSites: [] });

    assert.lengthOf(messages, 1);

    assert.include(messages[0], 'apps/a-docs: a docs site');
  });

  test('names a published site outside the scope', () => {
    const messages = messagesOf({ publishedSites: ['a-docs', 'site'] });

    assert.lengthOf(messages, 1);

    assert.include(messages[0], 'apps/site: published');
  });

  test('is an error when the workflow has no paths filter', () => {
    const result = findLinkCheckScopeViolations({
      workflow: 'on: pull_request',
      tracked: TRACKED,
      listed: LISTED,
      publishedSites: ['a-docs'],
    });

    assert.isTrue(Result.isErr(result));
  });
});

describe(matchesPathsFilterGlob, () => {
  test('lets ** match any characters, a slash included', () => {
    assert.isTrue(
      matchesPathsFilterGlob('apps/*-docs/**.md', 'apps/a-docs/x.md'),
    );

    assert.isTrue(
      matchesPathsFilterGlob('apps/*-docs/**.md', 'apps/a-docs/src/x/y.md'),
    );

    assert.isTrue(
      matchesPathsFilterGlob('apps/*-docs/**.md', 'apps/a-docs/.hidden/y.md'),
    );
  });

  test('lets **/ match no directory at all', () => {
    assert.isTrue(
      matchesPathsFilterGlob('apps/*-docs/**/*.md', 'apps/a-docs/README.md'),
    );

    assert.isTrue(
      matchesPathsFilterGlob('apps/*-docs/**/*.md', 'apps/a-docs/src/x.md'),
    );
  });

  test('lets ** inside a segment match characters only', () => {
    assert.isFalse(
      matchesPathsFilterGlob(
        'libs/synstate**/README.md',
        'libs/synstateREADME.md',
      ),
    );

    assert.isTrue(
      matchesPathsFilterGlob(
        'libs/synstate**/README.md',
        'libs/synstate-x/README.md',
      ),
    );
  });

  test('reads **/**/ as one **/', () => {
    assert.isTrue(matchesPathsFilterGlob('**/**/x.md', 'x.md'));

    assert.isTrue(matchesPathsFilterGlob('a/**/**/x.md', 'a/x.md'));
  });

  test('stops * at a slash', () => {
    assert.isFalse(
      matchesPathsFilterGlob('apps/*-docs/**.md', 'apps/a/b-docs/x.md'),
    );

    assert.isFalse(matchesPathsFilterGlob('apps/*.md', 'apps/a/x.md'));
  });

  test('matches the rest of a pattern literally, and all of the path', () => {
    assert.isTrue(
      matchesPathsFilterGlob(
        'tools/configs/lychee.toml',
        'tools/configs/lychee.toml',
      ),
    );

    assert.isFalse(
      matchesPathsFilterGlob('apps/*-docs/**.md', 'apps/a-docs/x.mdx'),
    );

    assert.isFalse(matchesPathsFilterGlob('apps/*.md', 'apps/x.md.bak'));
  });
});

describe(runListStep, () => {
  test('runs the step in bash at the root and reads what it writes', async () => {
    const result = await runListStep(
      workflowRunning(
        [
          '        run: |',
          '          test -f package.json',
          String.raw`          printf 'a\n\nb\n' > "$RUNNER_TEMP/link-check-files.txt"`,
        ].join('\n'),
      ),
    );

    assert.deepStrictEqual(result, Result.ok(['a', 'b']));
  });

  test('does not source BASH_ENV, as a runner sets none', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'link-check-scope-'));

    const bashEnv = path.join(dir, 'bash-env.sh');

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a file under the directory made above
    await fs.writeFile(
      bashEnv,
      'echo sourced > "$RUNNER_TEMP/link-check-files.txt"; exit 0\n',
    );

    vi.stubEnv('BASH_ENV', bashEnv);

    try {
      const result = await runListStep(
        workflowRunning(
          '        run: echo ran > "$RUNNER_TEMP/link-check-files.txt"',
        ),
      );

      assert.deepStrictEqual(result, Result.ok(['ran']));
    } finally {
      vi.unstubAllEnvs();

      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  test('refuses what GitHub would run otherwise', async () => {
    for (const workflow of [
      workflowRunning('        shell: sh\n        run: echo'),
      workflowRunning('        working-directory: apps\n        run: echo'),
      workflowRunning('        env:\n          A: b\n        run: echo'),
      workflowRunning('        run: echo', '    env:\n      A: b'),
      workflowRunning('        run: echo', '    container: node:24'),
      workflowRunning(
        "        if: github.event_name == 'schedule'\n        run: echo",
      ),
      workflowRunning(
        '        run: echo',
        "    if: github.event_name == 'schedule'",
      ),
      // eslint-disable-next-line no-template-curly-in-string -- a GitHub expression, which is the point
      workflowRunning('        run: echo ${{ github.sha }}'),
    ]) {
      const result = await runListStep(workflow);

      assert.isTrue(Result.isErr(result));

      assert.include(result.value, 'which this check does not reproduce');
    }
  });

  test('refuses a workflow with no such step, or more than one', async () => {
    assert.isTrue(Result.isErr(await runListStep('jobs: {}')));

    const twice = await runListStep(
      dedent`
        jobs:
          a:
            steps:
              - name: List the files to check
                run: 'true'
          b:
            steps:
              - name: List the files to check
                run: 'true'
      `,
    );

    assert.isTrue(Result.isErr(twice));
  });

  test('says why the step failed', async () => {
    const result = await runListStep(
      workflowRunning("        run: echo 'gone wrong' >&2; exit 3"),
    );

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'gone wrong');
  });
});

describe(checkLinkCheckScope, () => {
  test('passes on the repository', async () => {
    const result = await checkLinkCheckScope();

    // The messages, when it fails, rather than `false`.
    assert.isUndefined(Result.isErr(result) ? result.value : undefined);
  });
});

/** A workflow whose one job's list step is `step`, its job's keys `job`. */
const workflowRunning = (step: string, job = ''): string =>
  [
    'jobs:',
    '  lychee:',
    '    runs-on: ubuntu-latest',
    job,
    '    steps:',
    '      - name: List the files to check',
    step,
  ]
    .filter((line) => line !== '')
    .join('\n');
