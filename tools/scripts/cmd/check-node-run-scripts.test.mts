// cspell:ignore pushd

import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  commonJsLoaderLines,
  hookCommands,
  judgeNodeRuns,
  nodeLoadViolations,
  nodeRunFilesOf,
  readCompositeSteps,
  readNodeOptions,
  runsOf,
  runtimeSpecifiers,
  selectCommandFiles,
  shellScriptsOf,
} from './check-node-run-scripts.mjs';

// Every reading of node's arguments needs these, so a Node whose help this
// cannot read fails the file as a whole, with the reason.
const nodeOptions = Result.unwrapThrow(await readNodeOptions());

const at = (
  directory: string,
  existing: readonly string[] = [],
): Parameters<typeof nodeRunFilesOf>[1] =>
  ({
    directory,
    variables: {},
    exists: (file) => existing.includes(file),
    nodeOptions,
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

  test('gives an option node --help does not list no word of its own', () => {
    // V8's options, `--stack-size` among them, take a value after `=` alone.
    assert.deepStrictEqual(
      nodeRunFilesOf(
        dedent`
          node --stack-size=2000 ./tools/a.mts
          node --allow-natives-syntax ./tools/b.mts
          node --security-revert CVE-0 ./tools/c.mts
        `,
        at(''),
      ),
      Result.ok(['tools/a.mts', 'tools/b.mts', 'tools/c.mts']),
    );
  });

  test('reports a script read from standard input, which it cannot name', () => {
    for (const script of [
      'node --input-type=module-typescript - < ./tools/a.mts',
      'node -- - ./tools/a.mts',
    ]) {
      const result = nodeRunFilesOf(script, at(''));

      assert.isTrue(Result.isErr(result));

      assert.include(result.value, 'standard input');
    }

    // Under `--test`, `-` is a test file's name, not an option.
    assert.deepStrictEqual(
      nodeRunFilesOf('node --test - ./a.test.mts', at('')),
      Result.ok(['a.test.mts']),
    );
  });

  test('reads every word after `--` as no option', () => {
    assert.deepStrictEqual(
      nodeRunFilesOf(
        dedent`
          node -- -x.mts
          node --test -- ./a.test.mts -b.test.mts
        `,
        at(''),
      ),
      Result.ok(['-x.mts', 'a.test.mts', '-b.test.mts']),
    );
  });

  test("takes the value of an option node lists as taking one, and no other's", () => {
    assert.deepStrictEqual(
      nodeRunFilesOf(
        dedent`
          node --watch-path ./src ./tools/a.mts
          node --test-reporter spec --test ./tools/b.test.mts
          node --no-warnings ./x.mjs ./arg.mts
          node --enable-source-maps dist/cli.mjs src/c.mts
          node --no-experimental-transform-types x.mjs ./d.mts
        `,
        at(''),
      ),
      Result.ok(['tools/a.mts', 'tools/b.test.mts']),
    );
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

  test('reads node called by its path', () => {
    assert.deepStrictEqual(
      nodeRunFilesOf(
        dedent`
          /opt/node/bin/node ./tools/a.mts
          "$NODE_DIR"/bin/node ./tools/b.mts
        `,
        { ...at(''), variables: { NODE_DIR: '/opt/node' } },
      ),
      Result.ok(['tools/a.mts', 'tools/b.mts']),
    );
  });

  test("ignores what node runs after preloading tsx's ES module loader, which compiles it", () => {
    assert.deepStrictEqual(
      nodeRunFilesOf(
        dedent`
          node --import=tsx ./tools/a.mts 'src/**/*.{ts,tsx}'
          node --import tsx ./tools/b.mts
          node --import tsx/esm ./tools/c.mts
          node --import ./node_modules/tsx/dist/esm/index.mjs ./tools/e.mts
          node --import ./node_modules/tsx/dist/loader.mjs ./tools/h.mts
          node --import ./node_modules/tsx/dist/esm/api/index.mjs ./tools/i.mts
          node --import ./tsx-like.mts ./tools/d.mts
          node -r tsx/cjs ./tools/f.mts
          node --import=./setup=x.mts ./tools/g.mts
        `,
        at(''),
      ),
      Result.ok([
        'tools/i.mts',
        'tsx-like.mts',
        'tools/d.mts',
        'tools/f.mts',
        'setup=x.mts',
        'tools/g.mts',
      ]),
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

  test('expands a variable as it stands where node runs', () => {
    assert.deepStrictEqual(
      nodeRunFilesOf(
        'f=./tools/a.mts; node "$f"; f=./x.mjs; f=./tools/b.mts',
        at(''),
      ),
      Result.ok(['tools/a.mts']),
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
          nodeOptions,
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
  test('reports a module named at runtime rather than skipping it', () => {
    expect(
      nodeLoadViolations('a.mts', {
        read: filesOf({ 'a.mts': 'const m = await import(name);' }),
        packagesInstalled: true,
      }),
    ).toHaveLength(1);
  });

  test('reports a CommonJS loader by its line, a member or a pattern included, before the install and after it', () => {
    const read = filesOf({
      'a.mts': "import * as fs from 'node:fs';\nconst m = require('node:fs');",
      'b.mts': dedent`
        export const c = manifest.exports.require;
        export const { require: d } = manifest.exports;
      `,
      'c.mts': dedent`
        import * as m from 'node:module';
        module.require('yaml');
        m.createRequire(import.meta.url);
      `,
    });

    // Before the install and after it, a loader is reported by its line
    // (a.mts), data named `require` too (b.mts), and so is a loader called as a
    // member or reached through a namespace import (c.mts).
    for (const packagesInstalled of [false, true]) {
      for (const [file, lines] of [
        ['a.mts', [2]],
        ['b.mts', [1, 2]],
        ['c.mts', [2, 3]],
      ] as const) {
        expect(
          nodeLoadViolations(file, { read, packagesInstalled }).map(
            (violation) => violation.split(': ', 1)[0],
          ),
        ).toStrictEqual(lines.map((line) => `${file}:${line}`));
      }
    }
  });

  test('points a CommonJS loader report to the doc that says why data counts', () => {
    const [message] = nodeLoadViolations('a.mts', {
      read: filesOf({ 'a.mts': 'export const c = manifest.exports.require;' }),
      packagesInstalled: true,
    });

    assert.include(
      message,
      `\`${commonJsLoaderLines.name}\` in tools/scripts/cmd/check-node-run-scripts.mts`,
    );
  });

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

describe(runtimeSpecifiers, () => {
  test.each([
    ["import * as fs from 'node:fs';", ['node:fs']],
    ["import 'ts-data-forge';", ['ts-data-forge']],
    ["import {} from 'ts-type-forge';", ['ts-type-forge']],
    ["export { Arr } from 'ts-data-forge';", ['ts-data-forge']],
    ["const m = await import('ts-data-forge');", ['ts-data-forge']],
    ['const m = await import(`ts-data-forge`);', ['ts-data-forge']],
    ['const m = await import(name);', [undefined]],
    // eslint-disable-next-line no-template-curly-in-string -- the template is the input.
    ['const m = await import(`${name}`);', [undefined]],
    // A CommonJS loader is `commonJsLoaderLines`'.
    ["const m = require('ts-data-forge');", []],
    ['import {\n  a, // don\'t\n  b,\n} from "./x.mjs";', ['./x.mjs']],
  ] as const)('reads %s as importing %j', (text, expected) => {
    expect(runtimeSpecifiers(text)).toStrictEqual(expected);
  });
});

describe(commonJsLoaderLines, () => {
  test.each([
    ["const m = require('ts-data-forge');", [1]],
    ["const m = (0, require)('ts-data-forge');", [1]],
    [
      "import { createRequire } from 'node:module';\nconst req = createRequire(import.meta.url);\nreq('yaml');",
      [1, 2],
    ],
    [
      "import { 'createRequire' as cr } from 'node:module';\ncr(import.meta.url)('yaml');",
      [1],
    ],
    ["import * as m from 'node:module';\nm.createRequire;", [2]],
    // A member counts on any object, data included, as the doc says.
    ['const c = entry.exports.require;', [1]],
    ["(module).require('yaml');", [1]],
    ['const r = module.require;', [1]],
    ["(0, globalThis['require'])('yaml');", [1]],
    ["if (typeof module.require === 'function') {}", []],
    ['export { foo as require };', []],
    ["export { createRequire as load } from 'node:module';", [1]],
    ["export { require } from './shim.mjs';", [1]],
    ["export { foo as require } from './m.mjs';", []],
    ['typeof (0, require);', []],
    ["import * as m from 'node:module';\nm[('createRequire')];", [2]],
    ["const { createRequire } = await import('node:module');", [1]],
    ['const { require: r } = globalThis;', [1]],
    ["const { ['require' as const]: r } = globalThis;", [1]],
    ['let r;\n({ require: r } = globalThis);', [2]],
    ['const { require: { cache } } = module;', [1]],
    // A name written to takes nothing out, declared or assigned.
    ['const [require] = list;', []],
    ['const { ...require } = g;', []],
    ['function f([require]) {}', []],
    ['const { a: require } = g;', []],
    ['let require;\n({ a: require } = g);', []],
    ['let require;\n[require] = xs;', []],
    ['let require;\nrequire = x;', []],
    ['let require;\n(require) = x;', []],
    ['let require;\n[(require)] = xs;', []],
    ['let require;\nfor (require of xs) {}', []],
    ['let require;\nfor (require in o) {}', []],
    ['let require;\nfor ((require) in o) {}', []],
    ['let require;\nfor ((require) of xs) {}', []],
    ['let require;\n[...require] = xs;', []],
    ['let require;\n[...(require)] = xs;', []],
    ['let require;\n({ a: (require) } = g);', []],
    ["export * as require from './m.mjs';", []],
    ['export default require;', [1]],
    ['const C = class require {};', []],
    // A default value is read, in a pattern or not.
    ['let a;\n[a = require] = xs;', [2]],
    ['const [a = require] = xs;', [1]],
    ["module.require('yaml');", [1]],
    ['const r = require;', [1]],
    ['const o = { require };', [1]],
    ['export { require };', [1]],
    // Names as written, not values: what a variable holds is not read.
    ["const k = 'require';\nglobalThis[k];", []],
    ["globalThis['re' + 'quire'];", []],
    // A key of an object literal, a declared member and `typeof` load nothing.
    ["const o = { require: './a.cjs', ['createRequire']: 1 };", []],
    ["if (typeof require === 'undefined') {}", []],
    ['class A {\n  get require() {}\n  set createRequire(v) {}\n}', []],
    ['require: for (;;) {\n  break require;\n}', []],
  ] as const)(
    'finds %s naming a CommonJS loader on lines %j',
    (text, expected) => {
      expect(commonJsLoaderLines(text)).toStrictEqual(expected);
    },
  );
});

/** The files `node` is given in the scripts `file` holds. */
const filesRun = (
  file: string,
  text: string,
  manifestDirectories: ReadonlySet<string> = new Set<string>(),
): readonly string[] => {
  const sources = shellScriptsOf(file, text, manifestDirectories);

  assert.isTrue(Result.isOk(sources));

  const { runs, problems } = runsOf(sources.value, {
    exists: () => true,
    nodeOptions,
  });

  assert.deepStrictEqual(problems, []);

  return runs.map(({ file: run }) => run);
};

describe(shellScriptsOf, () => {
  test('reads a shell script whole, from the root', () => {
    assert.deepStrictEqual(
      filesRun('scripts/setup.sh', 'set -eu\nf=./tools/a.mts\nnode "$f"\n'),
      ['tools/a.mts'],
    );
  });

  test('reads each script of a manifest outside the workspace, from its directory', () => {
    assert.deepStrictEqual(
      filesRun(
        'verify-npm-packages/x/package.json',
        JSON.stringify({
          scripts: { a: 'f=./a.mts', b: 'node ./b.mts', c: 1 },
        }),
      ),
      ['verify-npm-packages/x/b.mts'],
    );
  });

  test('decodes a hook command before it is read as a shell script', () => {
    // A continuation written inside JSON: a backslash, then an escaped newline.
    const settings = String.raw`{ "hooks": { "Stop": [{ "hooks": [{ "type": "command", "command": "node \\\n  \"$CLAUDE_PROJECT_DIR/tools/a.mts\"" }] }] } }`;

    assert.deepStrictEqual(filesRun('.claude/settings.json', settings), [
      'tools/a.mts',
    ]);
  });

  test('reads every run of a workflow, a multi-line one included', () => {
    const workflow = dedent`
      on: push
      jobs:
        x:
          runs-on: ubuntu-latest
          steps:
            - run: |
                pnpm install
                node ./tools/b.mts
    `;

    assert.deepStrictEqual(filesRun('.github/workflows/x.yml', workflow), [
      'tools/b.mts',
    ]);
  });

  test("reads a shell script under a manifest of its own, which runs from its caller's directory, as running no node", () => {
    const manifests = new Set<string>([
      '.',
      'apps/foo',
      'verify-npm-packages/x',
    ]);

    // One that runs none passes; `apps/foobar` is no part of `apps/foo`, and is
    // read from the root.
    assert.deepStrictEqual(
      filesRun('apps/foo/deploy.sh', 'firebase deploy\n', manifests),
      [],
    );

    assert.deepStrictEqual(
      filesRun('apps/foobar/run.sh', 'node ./a.mts\n', manifests),
      ['a.mts'],
    );

    for (const file of ['apps/foo/run.sh', 'verify-npm-packages/x/run.sh']) {
      const sources = shellScriptsOf(
        file,
        'node ./scripts/gen.mts\n',
        manifests,
      );

      assert.isTrue(Result.isOk(sources));

      const { runs, problems } = runsOf(sources.value, {
        exists: () => true,
        nodeOptions,
      });

      assert.deepStrictEqual(runs, []);

      assert.lengthOf(problems, 1);

      assert.include(problems[0], file);
    }
  });

  test('reads nothing from another file', () => {
    assert.deepStrictEqual(filesRun('docs/x.md', 'node ./tools/a.mts'), []);
  });
});

describe(selectCommandFiles, () => {
  test("reads every command file but a member's manifest, and nothing in experimental/", () => {
    assert.deepStrictEqual(
      selectCommandFiles(
        [
          'package.json',
          'setup.sh',
          'apps/foo/package.json',
          'apps/foo/run.sh',
          'verify-npm-packages/x/package.json',
          '.github/workflows/ci.yml',
          '.github/actions/setup/action.yml',
          '.claude/settings.json',
          'experimental/old.sh',
          'docs/x.md',
        ],
        new Set<string>(['.', 'apps/foo']),
      ),
      [
        'setup.sh',
        'apps/foo/run.sh',
        'verify-npm-packages/x/package.json',
        '.github/workflows/ci.yml',
        '.github/actions/setup/action.yml',
        '.claude/settings.json',
      ],
    );
  });
});
