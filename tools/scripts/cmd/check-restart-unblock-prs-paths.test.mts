import dedent from 'dedent';
import { Arr, Result } from 'ts-data-forge';
import {
  findViolations,
  parsePatterns,
  walkImports,
  type Closure,
} from './check-restart-unblock-prs-paths.mjs';

describe('parsePatterns', () => {
  const workflowFile = dedent`
    jobs:
      notify:
        steps:
          - name: Open or extend the restart issue
            run: |
              set -euo pipefail

              src='libs/q/src'
              core='libs/core/src/'
              worker_re="^(\${src}/(worker/|lib/|cmd/worker\.mts$)|\${core})"
              other='not a pattern'
  `;

  test('expands the variables a pattern names', () => {
    const patterns = parsePatterns(workflowFile, ['worker_re']);

    assert.strictEqual(
      Result.unwrapOk(patterns)?.get('worker_re')?.source,
      String.raw`^(libs\/q\/src\/(worker\/|lib\/|cmd\/worker\.mts$)|libs\/core\/src\/)`,
    );
  });

  test('the pattern reads paths as the workflow does', () => {
    const pattern = Result.unwrapOk(
      parsePatterns(workflowFile, ['worker_re']),
    )?.get('worker_re');

    assert.isDefined(pattern);

    assert.isTrue(pattern.test('libs/q/src/worker/main.mts'));

    assert.isTrue(pattern.test('libs/q/src/cmd/worker.mts'));

    assert.isTrue(pattern.test('libs/core/src/types.mts'));

    assert.isFalse(pattern.test('libs/q/src/cmd/worker.mts.bak'));

    assert.isFalse(pattern.test('libs/q/src/other/main.mts'));
  });

  test('fails on a pattern the workflow does not assign', () => {
    assert.isTrue(Result.isErr(parsePatterns(workflowFile, ['runner_re'])));
  });

  test('fails on a variable assigned without being defined first', () => {
    assert.isTrue(
      Result.isErr(
        // eslint-disable-next-line no-template-curly-in-string -- a shell assignment, not a template.
        parsePatterns('            runner_re="^${nowhere}/x"', ['runner_re']),
      ),
    );
  });
});

describe('walkImports', () => {
  const sources: ReadonlyMap<string, string> = new Map<string, string>([
    [
      'libs/q/src/cmd/worker.mts',
      dedent`
        import { Result } from 'ts-data-forge';
        import * as fs from 'node:fs';
        import { run } from '../worker/index.mjs';
      `,
    ],
    [
      'libs/q/src/worker/index.mts',
      dedent`
        export * from './main.mjs';
      `,
    ],
    [
      'libs/q/src/worker/main.mts',
      dedent`
        import { report } from 'core';
        import { log } from '../lib/index.mjs';
        import type { Options } from './types.mjs';
      `,
    ],
    ['libs/q/src/worker/types.mts', 'export type Options = {};'],
    ['libs/q/src/lib/index.mts', "export * from './log.mjs';"],
    ['libs/q/src/lib/log.mts', "import 'dedent';"],
    ['libs/core/src/entry-point.mts', "import { Arr } from 'ts-data-forge';"],
  ]);

  const workspacePackages: ReadonlyMap<string, string> = new Map<
    string,
    string
  >([
    ['core', 'libs/core'],
    ['ts-data-forge', 'libs/ts-data-forge'],
  ]);

  const walk = (
    follows: (directory: string) => boolean,
  ): Result<Closure, string> =>
    walkImports('libs/q/src/cmd/worker.mts', {
      readSource: (relativePath) => sources.get(relativePath),
      workspacePackages,
      follows,
    });

  test('collects every file reached, through barrels and type imports', () => {
    const closure = Result.unwrapOk(
      walk((directory) => directory === 'libs/core'),
    );

    assert.deepStrictEqual(closure?.files, [
      'libs/core/src/entry-point.mts',
      'libs/q/src/cmd/worker.mts',
      'libs/q/src/lib/index.mts',
      'libs/q/src/lib/log.mts',
      'libs/q/src/worker/index.mts',
      'libs/q/src/worker/main.mts',
      'libs/q/src/worker/types.mts',
    ]);
  });

  test('lists the workspace packages it reached and did not follow', () => {
    const closure = Result.unwrapOk(
      walk((directory) => directory === 'libs/core'),
    );

    assert.deepStrictEqual(closure?.unfollowed, ['ts-data-forge']);
  });

  test('does not enter a workspace package it is not told to follow', () => {
    const closure = Result.unwrapOk(walk(() => false));

    assert.isDefined(closure);

    assert.notInclude(closure.files, 'libs/core/src/entry-point.mts');

    assert.deepStrictEqual(closure.unfollowed, ['core', 'ts-data-forge']);
  });

  test('fails on a relative import that resolves to no file', () => {
    const result = walkImports('libs/q/src/cmd/broken.mts', {
      readSource: (relativePath) =>
        relativePath === 'libs/q/src/cmd/broken.mts'
          ? "import { x } from '../missing/index.mjs';"
          : undefined,
      workspacePackages,
      follows: () => false,
    });

    assert.isTrue(Result.isErr(result));
  });
});

describe('findViolations', () => {
  const pattern =
    /^(libs\/q\/src\/(worker\/|lib\/|cmd\/worker\.mts$)|libs\/core\/src\/)/u;

  const closure: Closure = {
    files: [
      'libs/core/src/entry-point.mts',
      'libs/q/src/cmd/worker.mts',
      'libs/q/src/lib/log.mts',
      'libs/q/src/worker/main.mts',
    ],
    unfollowed: ['ts-data-forge'],
  } as const;

  const check = (
    overrides: Partial<Parameters<typeof findViolations>[0]>,
  ): readonly string[] =>
    findViolations({
      variable: 'worker_re',
      entry: 'libs/q/src/cmd/worker.mts',
      pattern,
      closure,
      trackedFiles: Arr.toPushed(
        closure.files,
        'libs/q/src/worker/main.test.mts',
      ),
      leftOut: ['ts-data-forge'],
      ...overrides,
    });

  test('passes when the pattern covers exactly what the entry reaches', () => {
    assert.deepStrictEqual(check({}), []);
  });

  test('reports a reached file the pattern misses', () => {
    const violations = check({
      closure: {
        ...closure,
        files: Arr.toPushed(closure.files, 'libs/q/src/queue/order.mts'),
      },
    });

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], 'libs/q/src/queue/order.mts');
  });

  test('reports a reached module the workflow does not read, matched or not', () => {
    const violations = check({
      closure: {
        ...closure,
        files: Arr.toPushed(closure.files, 'libs/q/src/worker/defaults.json'),
      },
    });

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], 'libs/q/src/worker/defaults.json');

    assert.include(violations[0], '`.mts`');
  });

  test('reports a workspace package neither tracked nor left out', () => {
    const violations = check({
      closure: { ...closure, unfollowed: ['ts-data-forge', 'ts-fortress'] },
    });

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], 'ts-fortress');
  });

  test('reports a tracked file the pattern names but the entry no longer reaches', () => {
    const violations = check({
      trackedFiles: Arr.toPushed(closure.files, 'libs/q/src/worker/stale.mts'),
    });

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], 'libs/q/src/worker/stale.mts');
  });

  test('ignores tests and files that are not modules', () => {
    assert.deepStrictEqual(
      check({
        trackedFiles: [
          ...closure.files,
          'libs/q/src/worker/main.test.mts',
          'libs/q/src/worker/README.md',
          'libs/q/src/worker/config.schema.json',
        ],
      }),
      [],
    );
  });
});
