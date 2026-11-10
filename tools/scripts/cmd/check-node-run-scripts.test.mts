// cspell:ignore pushd

import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  hookCommands,
  judgeNodeRuns,
  nodeLoadViolations,
  nodeRunFilesOf,
  readCompositeSteps,
} from './check-node-run-scripts.mjs';

const at = (
  directory: string,
  existing: readonly string[] = [],
): Parameters<typeof nodeRunFilesOf>[1] =>
  ({
    directory,
    variables: {},
    exists: (file) => existing.includes(file),
  }) as const;

const filesOf =
  (record: ReadonlyRecord<string, string>) =>
  (file: string): string | undefined =>
    record[file];

describe(nodeRunFilesOf, () => {
  test('reads the TypeScript file node is given, from the root', () => {
    assert.deepStrictEqual(
      nodeRunFilesOf(
        'node ./tools/scripts/cmd/mature-updates.mts actions',
        at(''),
      ),
      Result.ok(['tools/scripts/cmd/mature-updates.mts']),
    );
  });

  test('resolves the file against the directory the script runs in', () => {
    assert.deepStrictEqual(
      nodeRunFilesOf(
        'node ../../tools/scripts/cmd/assert-deps-built.mts && tsc --noEmit',
        at('libs/a'),
      ),
      Result.ok(['tools/scripts/cmd/assert-deps-built.mts']),
    );
  });

  test('reports a file after a cd or pushd that is not there from the start', () => {
    for (const change of ['cd', 'pushd']) {
      const result = nodeRunFilesOf(
        `${change} libs/a && node ./scripts/run.mts`,
        at(''),
      );

      assert.isTrue(Result.isErr(result));

      assert.include(result.value, `after a \`${change}\``);
    }
  });

  test('takes a file after a cd from the start when it is there', () => {
    // The `cd` of a substitution moves nothing; neither does a subshell's
    // beyond it, which the reading cannot tell apart.
    assert.deepStrictEqual(
      nodeRunFilesOf(
        'here="$(cd "$(dirname "$0")" && pwd)"; node ./tools/run.mts "$here"',
        at('', ['tools/run.mts']),
      ),
      Result.ok(['tools/run.mts']),
    );
  });

  test('lets an option value pass when the next path is no TypeScript file', () => {
    assert.deepStrictEqual(
      nodeRunFilesOf(
        'node --inspect-port 9229 ./server.mjs ./target.mts',
        at(''),
      ),
      Result.ok([]),
    );
  });

  test('reports a word that may be an option value instead of the script', () => {
    const result = nodeRunFilesOf(
      'node --test-reporter spec --test ./tools/a.test.mts',
      at(''),
    );

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'spec');
  });

  test('runs every file after --test', () => {
    assert.deepStrictEqual(
      nodeRunFilesOf(
        'node --test ./a.test.mts ./b.test.mjs ./c.test.mts',
        at(''),
      ),
      Result.ok(['a.test.mts', 'c.test.mts']),
    );
  });

  test('ignores JavaScript, tsx and an inline program', () => {
    assert.deepStrictEqual(
      nodeRunFilesOf(
        dedent`
          node ./build/index.mjs
          node ../../node_modules/typescript-native/bin/tsc --noEmit
          tsx --tsconfig ./tools/configs/tsconfig.tsx.json ./tools/a.mts
          node -e "import('./x.mts')"
          node --eval 'console.log(1)' ./y.mts
        `,
        at(''),
      ),
      Result.ok([]),
    );
  });

  test("reads node's options, a preloaded module among them", () => {
    assert.deepStrictEqual(
      nodeRunFilesOf(
        'node --conditions source --import ./hook.mts --no-warnings ./x.mts ./arg.mts',
        at(''),
      ),
      Result.ok(['hook.mts', 'x.mts']),
    );
  });

  test('expands the variables it is given and the ones the script sets', () => {
    assert.deepStrictEqual(
      nodeRunFilesOf(
        'f="$CLAUDE_PROJECT_DIR/tools/scripts/cmd/hook.mts"; [ ! -f "$f" ] || node "$f"',
        {
          directory: '',
          variables: { CLAUDE_PROJECT_DIR: '.' },
          exists: () => true,
        },
      ),
      Result.ok(['tools/scripts/cmd/hook.mts']),
    );
  });

  test('judges a variable by the file it expands to', () => {
    assert.deepStrictEqual(
      nodeRunFilesOf(
        'f=./build/index.mjs; node "$f"; node "$RUNNER_TEMP/report.js"',
        at(''),
      ),
      Result.ok([]),
    );
  });

  test('reports a GitHub expression it cannot expand', () => {
    // A workflow's `${{ … }}`, written as GitHub reads it, not a template.
    // eslint-disable-next-line no-template-curly-in-string
    const expression = '${{ matrix.script }}';

    const result = nodeRunFilesOf(`node ./tools/${expression}.mts`, at(''));

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, expression);
  });

  test('reports a file it cannot name rather than skipping it', () => {
    const result = nodeRunFilesOf('node "$SCRIPT"', at(''));

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, '$SCRIPT');
  });
});

describe(nodeLoadViolations, () => {
  test('accepts node: builtins and a top-level import type', () => {
    assert.deepStrictEqual(
      nodeLoadViolations('a.mts', {
        read: filesOf({
          'a.mts': dedent`
            import * as fs from 'node:fs';
            import type { ReadonlyRecord } from 'ts-type-forge';

            // import { x } from 'in-a-comment';
            const text = "import { y } from 'in-a-string'";

            export const r: ReadonlyRecord<string, string> = { text };
            fs.existsSync('.');
          `,
        }),
        packagesInstalled: false,
      }),
      [],
    );
  });

  test('reports an inline type import, which Node keeps as a load', () => {
    const violations = nodeLoadViolations('a.mts', {
      read: filesOf({
        'a.mts': dedent`
          import { type ReadonlyRecord } from 'ts-type-forge';

          export type R = ReadonlyRecord<string, string>;
        `,
      }),
      packagesInstalled: false,
    });

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], 'a.mts');

    assert.include(violations[0], "'ts-type-forge'");
  });

  test('reports a re-export and a dynamic import of a package', () => {
    const violations = nodeLoadViolations('a.mts', {
      read: filesOf({
        'a.mts': dedent`
          export { Arr } from 'ts-data-forge';

          await import('yaml');
        `,
      }),
      packagesInstalled: false,
    });

    assert.strictEqual(violations.length, 2);

    assert.include(violations[0], "'ts-data-forge'");

    assert.include(violations[1], "'yaml'");
  });

  test('accepts packages from a script run once they are installed', () => {
    assert.deepStrictEqual(
      nodeLoadViolations('a.mts', {
        read: filesOf({
          'a.mts': dedent`
            import { Arr } from 'ts-data-forge';

            await import('synstate');

            Arr.range(1);
          `,
        }),
        packagesInstalled: true,
      }),
      [],
    );
  });

  test('reports a relative .mjs that names a .mts, which Node does not map', () => {
    const violations = nodeLoadViolations('tools/a.mts', {
      read: filesOf({
        'tools/a.mts': "import { b } from './lib/b.mjs';\n\nb();\n",
        'tools/lib/b.mts': 'export const b = (): void => {};\n',
      }),
      packagesInstalled: true,
    });

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], "'./lib/b.mjs'");
  });

  test('follows a relative import and judges the file it loads', () => {
    const violations = nodeLoadViolations('tools/a.mts', {
      read: filesOf({
        'tools/a.mts': "import { b } from './lib/b.mjs';\n\nb();\n",
        'tools/lib/b.mjs': "import 'yaml';\n\nexport const b = () => {};\n",
      }),
      packagesInstalled: false,
    });

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], 'tools/lib/b.mjs');

    assert.include(violations[0], "'yaml'");
  });

  test('reports an import by absolute path or URL', () => {
    const violations = nodeLoadViolations('a.mts', {
      read: filesOf({
        'a.mts': dedent`
          import '/abs/b.mjs';
          import 'file:///abs/c.mjs';
        `,
      }),
      packagesInstalled: true,
    });

    assert.strictEqual(violations.length, 2);

    assert.include(violations[0], 'a path or URL');

    assert.include(violations[1], 'a path or URL');
  });

  test('reports syntax Node cannot strip', () => {
    const violations = nodeLoadViolations('a.mts', {
      read: filesOf({
        'a.mts': 'export namespace N {\n  export const a = 1;\n}\n',
      }),
      packagesInstalled: true,
    });

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], 'a.mts');
  });

  test('reports a file that does not exist', () => {
    const violations = nodeLoadViolations('missing.mts', {
      read: filesOf({}),
      packagesInstalled: true,
    });

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], 'missing.mts');
  });
});

describe(judgeNodeRuns, () => {
  test('lets a listed script load packages, and no other', () => {
    const violations = judgeNodeRuns({
      runs: [
        { file: 'bench.mts', origin: 'libs/a/package.json `benchmark`' },
        { file: 'setup.mts', origin: '.github/actions/setup/action.yml' },
      ],
      read: filesOf({
        'bench.mts': "import 'synstate';\n",
        'setup.mts': "import 'yaml';\n",
      }),
      runAfterInstall: new Set<string>(['bench.mts']),
    });

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], 'setup.mts');

    assert.include(violations[0], '.github/actions/setup/action.yml');
  });

  test('reports a listed script node no longer runs', () => {
    const violations = judgeNodeRuns({
      runs: [],
      read: filesOf({}),
      runAfterInstall: new Set<string>(['bench.mts']),
    });

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], 'bench.mts');
  });

  test('judges a script run from several places once', () => {
    const violations = judgeNodeRuns({
      runs: [
        { file: 'setup.mts', origin: 'one' },
        { file: 'setup.mts', origin: 'two' },
      ],
      read: filesOf({ 'setup.mts': "import 'yaml';\n" }),
      runAfterInstall: new Set<string>(),
    });

    assert.strictEqual(violations.length, 1);
  });
});

describe(readCompositeSteps, () => {
  test("reads each run step's script and directory", () => {
    assert.deepStrictEqual(
      readCompositeSteps(
        'action.yml',
        dedent`
          runs:
            using: composite
            steps:
              - uses: actions/setup-node@v6
              - shell: bash
                run: node ./tools/scripts/cmd/workflow-steps.mts install
              - shell: bash
                working-directory: libs/a
                run: |
                  node ./scripts/x.mts
        `,
      ),
      Result.ok([
        {
          run: 'node ./tools/scripts/cmd/workflow-steps.mts install',
          directory: '.',
        },
        { run: 'node ./scripts/x.mts\n', directory: 'libs/a' },
      ]),
    );
  });

  test('reports YAML it cannot parse', () => {
    assert.isTrue(Result.isErr(readCompositeSteps('action.yml', 'a: [')));
  });
});

describe(hookCommands, () => {
  test('collects every command, however deep', () => {
    assert.deepStrictEqual(
      hookCommands({
        permissions: { allow: ['Bash(node:*)'] },
        hooks: {
          PostToolUse: [
            { matcher: 'Edit', hooks: [{ type: 'command', command: 'a' }] },
          ],
          SessionStart: [{ hooks: [{ type: 'command', command: 'b' }] }],
        },
      }),
      ['a', 'b'],
    );
  });
});
