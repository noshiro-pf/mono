import dedent from 'dedent';
import { Arr, Result } from 'ts-data-forge';
import type { Closure } from '../lib/import-closure.mjs';
import {
  findViolations,
  parsePatterns,
  parseSourceMapped,
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
        parsePatterns(
          dedent`
            jobs:
              notify:
                steps:
                  - run: runner_re="^\${nowhere}/x"
          `,
          ['runner_re'],
        ),
      ),
    );
  });

  test('reads assignments as the shell does: several on a line, and one with a trailing comment', () => {
    const patterns = parsePatterns(
      dedent`
        jobs:
          notify:
            steps:
              - run: |
                  src='libs/q/src'; core=libs/core/src/ # the shared one
                  worker_re="^(\${src}/|\${core})" # what the worker loads
      `,
      ['worker_re'],
    );

    assert.strictEqual(
      Result.unwrapOk(patterns)?.get('worker_re')?.source,
      String.raw`^(libs\/q\/src\/|libs\/core\/src\/)`,
    );
  });

  test('reads a step written in flow style', () => {
    const patterns = parsePatterns(
      dedent`
        jobs:
          notify:
            steps:
              - { name: Paths, run: "worker_re='^libs/q/'" }
      `,
      ['worker_re'],
    );

    assert.strictEqual(
      Result.unwrapOk(patterns)?.get('worker_re')?.source,
      String.raw`^libs\/q\/`,
    );
  });

  test('does not expand a variable another step assigned, which the shell would not see', () => {
    assert.isTrue(
      Result.isErr(
        parsePatterns(
          dedent`
            jobs:
              notify:
                steps:
                  - run: src='libs/q/src'
                  - run: worker_re="^\${src}/"
          `,
          ['worker_re'],
        ),
      ),
    );
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
    workspaceImports: ['core', 'ts-data-forge'],
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
      sourceMapped: ['core', 'ts-data-forge'],
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

  test('reports a workspace import that tsx would load from dist/', () => {
    const violations = check({
      closure: {
        ...closure,
        workspaceImports: Arr.toPushed(
          closure.workspaceImports,
          'ts-data-forge/array',
        ),
      },
      sourceMapped: ['ts-data-forge'],
    });

    assert.strictEqual(violations.length, 2);

    assert.include(violations[0], 'core');

    assert.include(violations[0], 'tsconfig.tsx.json');

    assert.include(violations[1], 'ts-data-forge/array');
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

describe('parseSourceMapped', () => {
  const files: ReadonlySet<string> = new Set<string>([
    'libs/core/src/entry-point.mts',
  ]);

  const isSource = (relativePath: string): boolean => files.has(relativePath);

  test('reads the exact names of a JSONC file that map to a source file', () => {
    const mapped = parseSourceMapped(
      dedent`
        {
          // A comment, as the real file has.
          "compilerOptions": {
            "baseUrl": "../..",
            "paths": {
              "core": ["libs/core/src/entry-point.mts"],
              "gone": ["libs/gone/src/entry-point.mts"],
              "second": ["libs/second/src/x.mts", "libs/core/src/entry-point.mts"],
              "core/*": ["libs/core/src/*"],
            },
          },
        }
      `,
      isSource,
    );

    assert.deepStrictEqual(Result.unwrapOk(mapped), ['core', 'second']);
  });

  test('says where the file does not parse', () => {
    const mapped = parseSourceMapped('{ "compilerOptions": { ', isSource);

    assert.isTrue(Result.isErr(mapped));

    assert.include(Result.unwrapErr(mapped), 'could not be parsed');
  });

  test('fails on a file with no paths', () => {
    const mapped = parseSourceMapped(
      '{ "compilerOptions": { "baseUrl": "../.." } }',
      isSource,
    );

    assert.isTrue(Result.isErr(mapped));

    assert.include(Result.unwrapErr(mapped), 'paths');
  });
});
