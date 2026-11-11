import { execFile } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as util from 'node:util';
import { Arr, hasKey, isRecord, isString } from 'ts-data-forge';
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';
import * as ts from 'typescript';
import { parse as parseYaml } from 'yaml';
import { closingStdin } from '../scripts/lib/child-process.mjs';
import { readScripts } from '../scripts/lib/manifest-scripts.mjs';
import { readShellScript } from '../scripts/lib/shell-commands.mjs';
import { projectRootPath } from '../scripts/project-root-path.mjs';
import { scriptsRunBeforeInstall } from './scripts-run-before-install.mjs';

const execFileAsync = util.promisify(execFile);

/**
 * The tracked files that can start a command: manifests, workflows and
 * composite actions, the Claude Code hooks, and shell scripts.
 */
const commandFiles = async (): Promise<readonly string[]> => {
  const { stdout } = await closingStdin(
    execFileAsync(
      'git',
      [
        'ls-files',
        '-z',
        '--',
        '**/package.json',
        'package.json',
        '.github/**.yml',
        '.github/**.yaml',
        HOOK_SETTINGS,
        '*.sh',
        ':!experimental/**',
      ],
      { cwd: projectRootPath, encoding: 'utf8' },
    ),
  );

  return stdout.split('\0').filter((file) => file !== '');
};

const read = (file: string): string =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a tracked file of the repository.
  fs.readFileSync(path.resolve(projectRootPath, file), 'utf8');

/** Every string under `key`, at any depth of a decoded document. */
const stringsUnder = (value: unknown, key: string): readonly string[] =>
  Arr.isArray(value)
    ? value.flatMap((item: unknown) => stringsUnder(item, key))
    : isRecord(value)
      ? Object.entries(value).flatMap(([name, item]) =>
          name === key && isString(item) ? [item] : stringsUnder(item, key),
        )
      : ([] as const);

/**
 * The shell scripts a command file holds, each run by a shell of its own: a
 * manifest's `scripts`, every `run:` of a workflow or composite action, every
 * hook `command`, and a `*.sh` file whole. Decoded as JSON or YAML first, so an
 * escape (`\n`, a `\` before one) is what the shell is handed.
 */
const shellScriptsIn = (file: string, text: string): readonly string[] =>
  file.endsWith('.sh')
    ? ([text] as const)
    : file.endsWith('package.json')
      ? Object.values(readScripts(JSON.parse(text)))
      : file === HOOK_SETTINGS
        ? stringsUnder(JSON.parse(text), 'command')
        : stringsUnder(parseYaml(text), 'run');

/**
 * The root `tools/**.mts` a word names: at its start, or after `./`, `../` or
 * an expansion (`$GITHUB_WORKSPACE/`, `${{ github.workspace }}/`), never inside
 * another directory.
 */
const SCRIPT =
  /(?<=^|\.\/|\$\{?\w+\}?\/|\}\}\/|["')}]\/)tools\/[\w./-]+\.mts$/u;

/** The `node` options whose value is the next word when not given with `=`. */
const NODE_VALUE_OPTIONS: ReadonlySet<string> = new Set<string>([
  '--conditions',
  '--env-file',
  '--import',
  '--loader',
  '--require',
  '--experimental-loader',
  '-C',
  '-r',
]);

/** The `node` options that load a module before the script: tsx among them. */
const NODE_LOADER_OPTIONS: ReadonlySet<string> = new Set<string>([
  '--import',
  '--loader',
  '--require',
  '--experimental-loader',
  '-r',
]);

/** The `node` options that run no script file. */
const NODE_NO_SCRIPT_OPTIONS: ReadonlySet<string> = new Set<string>([
  '--eval',
  '--print',
  '-e',
  '-p',
]);

/**
 * The script a `node` command runs under plain `node`, from its words, or
 * `undefined`: for another program, for `node` that loads tsx first
 * (`--import=tsx`), and for one that runs no file (`-e`).
 */
const nodeScriptOf = (words: readonly string[]): string | undefined => {
  if (path.posix.basename(words[0] ?? '') !== 'node') {
    return undefined;
  }

  const mut_cursor = { at: 1 };

  while (mut_cursor.at < words.length) {
    const word = words[mut_cursor.at] ?? '';

    if (!word.startsWith('-')) {
      return word;
    }

    const equals = word.indexOf('=');

    const option = equals === -1 ? word : word.slice(0, equals);

    if (NODE_NO_SCRIPT_OPTIONS.has(option)) {
      return undefined;
    }

    const value =
      equals === -1 ? words[mut_cursor.at + 1] : word.slice(equals + 1);

    if (NODE_LOADER_OPTIONS.has(option) && /\btsx\b/u.test(value ?? '')) {
      return undefined;
    }

    mut_cursor.at += equals === -1 && NODE_VALUE_OPTIONS.has(option) ? 2 : 1;
  }

  return undefined;
};

/**
 * The root `tools/**.mts` scripts a shell script runs under plain `node`, read
 * as the shell reads it (`readShellScript`): the script of each `node` command,
 * by path or by a variable the script assigns before it.
 */
const scriptsRunByNodeIn = (script: string): readonly string[] => {
  const { commands, assignments } = readShellScript(script);

  return commands.flatMap((words, index) => {
    const word = nodeScriptOf(words);

    if (word === undefined) {
      return [];
    }

    const expanded = word.replaceAll(
      /\$(?:\{(?<braced>\w+)\}|(?<bare>\w+))/gu,
      (written, ...rest: readonly unknown[]) => {
        const groups = rest.at(-1);

        const name = isRecord(groups)
          ? (groups['braced'] ?? groups['bare'])
          : undefined;

        const assigned = assignments.findLast(
          (assignment) =>
            assignment.name === name && assignment.before <= index,
        );

        return assigned?.value ?? written;
      },
    );

    const matched = SCRIPT.exec(expanded)?.[0];

    return matched === undefined ? [] : [matched];
  });
};

/** Every `tools/**.mts` a command file runs under plain `node`. */
const scriptsRunByNode = async (): Promise<readonly string[]> => {
  const files = await commandFiles();

  return Arr.uniq(
    files.flatMap((file) =>
      shellScriptsIn(file, read(file)).flatMap(scriptsRunByNodeIn),
    ),
  ).toSorted();
};

const specifierText = (node: ts.Node): string =>
  ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
    ? node.text
    : NOT_A_LITERAL;

/** `import(…)`, `require(…)` or `createRequire(…)(…)`. */
const loadsModule = (call: DeepReadonly<ts.CallExpression>): boolean =>
  call.expression.kind === ts.SyntaxKind.ImportKeyword ||
  (ts.isIdentifier(call.expression) && call.expression.text === 'require') ||
  (ts.isCallExpression(call.expression) &&
    ts.isIdentifier(call.expression.expression) &&
    call.expression.expression.text === 'createRequire');

/**
 * Every module a file loads at runtime, read from what Node runs: the file with
 * its types erased as `verbatimModuleSyntax` erases them, which is what Node's
 * type stripping keeps. A static `import` and `export … from`, `import(…)`,
 * `require(…)` and `createRequire(…)(…)`; one whose specifier is not a string
 * literal is `NOT_A_LITERAL`, since what it loads cannot be read.
 */
const runtimeImports = (text: string): readonly string[] => {
  const { outputText } = ts.transpileModule(text, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
      verbatimModuleSyntax: true,
    },
  });

  const sourceFile = ts.createSourceFile(
    'emitted.mjs',
    outputText,
    ts.ScriptTarget.Latest,
    true,
  );

  return Arr.generate(function* () {
    const mut_stack: ts.Node[] = [sourceFile];

    while (Arr.isNonEmpty(mut_stack)) {
      const node = mut_stack.pop();

      if (node === undefined) {
        break;
      }

      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier !== undefined
      ) {
        yield specifierText(node.moduleSpecifier);
      } else if (ts.isCallExpression(node) && loadsModule(node)) {
        const [first] = node.arguments;

        yield first === undefined ? NOT_A_LITERAL : specifierText(first);
      }

      mut_stack.push(...node.getChildren());
    }
  });
};

const NOT_A_LITERAL = '<not a string literal>';

const HOOK_SETTINGS = '.claude/settings.json';

/**
 * The listed scripts that run only on the Node the repository pins
 * (`volta.node`), and so may use what the oldest supported Node lacks.
 */
const RUNS_ON_PINNED_NODE: ReadonlyRecord<string, string> = {
  'tools/scripts/cmd/mature-updates.mts':
    'Runs in pnpm-update.yml after the setup action has installed `volta.node`.',
} as const;

describe('scriptsRunBeforeInstall', () => {
  test.each([
    ['node ./tools/a.mts && vitest run', ['tools/a.mts']],
    ["node ./tools/a.mts --glob 'src/**/*.tsx'", ['tools/a.mts']],
    [
      'tsx --tsconfig ./tsconfig.tsx.json x && node ./tools/a.mts',
      ['tools/a.mts'],
    ],
    ['f=./tools/a.mts\nnode "$f"', ['tools/a.mts']],
    ['node \\\n  ./tools/a.mts', ['tools/a.mts']],
    ['NODE_OPTIONS=--x; f=./tools/a.mts; node "$f"', ['tools/a.mts']],
    ['node ./libs/foo/tools/b.mts', []],
    ['out="$(node ./tools/a.mts)"', ['tools/a.mts']],
    ['x=`node ./tools/a.mts`', ['tools/a.mts']],
    // eslint-disable-next-line no-template-curly-in-string -- a workflow expression, not a template.
    ['node "${{ github.workspace }}/tools/a.mts"', ['tools/a.mts']],
    ['node "$PWD"/tools/a.mts', ['tools/a.mts']],
    ['f=./tools/a.mts; f=./x.mjs; node "$f"', []],
    ['node ../../tools/a.mts', ['tools/a.mts']],
    ['node tools/a.mts', ['tools/a.mts']],
    [
      'node --enable-source-maps "$GITHUB_WORKSPACE/tools/a.mts"',
      ['tools/a.mts'],
    ],
    [
      'f="$CLAUDE_PROJECT_DIR/tools/a.mts"; [ ! -f "$f" ] || node "$f"',
      ['tools/a.mts'],
    ],
    ['f="$CLAUDE_PROJECT_DIR/tools/a.mts"; pnpm exec tsx "$f"', []],
    ['tsx --tsconfig ./x.json ./tools/a.mts', []],
    ['node ./x.mjs && tsx ./tools/a.mts', []],
    ['[ -f "$CLAUDE_PROJECT_DIR/tools/a.mts" ]', []],
    // A prefix assignment sets a variable; `node` runs what follows it.
    ['FOO=./tools/a.mts node ./x.mjs', []],
    // A `node` called by its path.
    ['/opt/node/bin/node ./tools/a.mts', ['tools/a.mts']],
    ['"$NODE_DIR"/bin/node ./tools/a.mts', ['tools/a.mts']],
    // `node` that loads tsx is tsx, whatever its arguments.
    ["node --import=tsx ./tools/a.mts 'src/**/*.{ts,tsx}'", []],
    ['node --import tsx ./tools/a.mts', []],
    ['node -e "import(\'./tools/a.mts\')"', []],
  ] as const)('reads %s as running %j under node', (script, expected) => {
    expect(scriptsRunByNodeIn(script)).toStrictEqual(expected);
  });

  test('reads each manifest script, hook and step as a shell of its own', () => {
    const scripts = shellScriptsIn(
      'package.json',
      JSON.stringify({
        scripts: { a: 'f=./tools/a.mts', b: 'node "$f"', c: 1 },
      }),
    );

    assert.deepStrictEqual(scripts, ['f=./tools/a.mts', 'node "$f"']);

    assert.deepStrictEqual(scripts.flatMap(scriptsRunByNodeIn), []);
  });

  test('decodes a hook command before it is read as a shell script', () => {
    // A continuation written inside JSON: a backslash, then an escaped newline.
    const settings = String.raw`{ "hooks": { "Stop": [{ "hooks": [{ "type": "command", "command": "node \\\n  \"$CLAUDE_PROJECT_DIR/tools/a.mts\"" }] }] } }`;

    assert.deepStrictEqual(
      shellScriptsIn(HOOK_SETTINGS, settings).flatMap(scriptsRunByNodeIn),
      ['tools/a.mts'],
    );
  });

  test('reads every run of a workflow or composite action', () => {
    const workflow = [
      'runs:',
      '  using: composite',
      '  steps:',
      '    - run: node ./tools/a.mts',
      '      shell: bash',
      'jobs:',
      '  x:',
      '    steps:',
      '      - run: |',
      '          node ./tools/b.mts',
    ].join('\n');

    assert.deepStrictEqual(
      shellScriptsIn('.github/actions/x/action.yml', workflow).flatMap(
        scriptsRunByNodeIn,
      ),
      ['tools/a.mts', 'tools/b.mts'],
    );
  });

  test('names every script a command runs under plain node, and only those', async () => {
    expect(scriptsRunBeforeInstall.toSorted()).toStrictEqual(
      await scriptsRunByNode(),
    );
  });

  test.each([
    ["import * as fs from 'node:fs';", ['node:fs']],
    ["import type { X } from 'ts-type-forge';", []],
    ["import { type X } from 'ts-type-forge';", ['ts-type-forge']],
    ["import 'ts-data-forge';", ['ts-data-forge']],
    ["export { Arr } from 'ts-data-forge';", ['ts-data-forge']],
    ["export type { X } from 'ts-type-forge';", []],
    ["const m = await import('ts-data-forge');", ['ts-data-forge']],
    ['const m = await import(`ts-data-forge`);', ['ts-data-forge']],
    ['const m = await import(name);', [NOT_A_LITERAL]],
    // eslint-disable-next-line no-template-curly-in-string -- the template is the input.
    ['const m = await import(`${name}`);', [NOT_A_LITERAL]],
    [
      "import { createRequire } from 'node:module';\nconst m = createRequire(import.meta.url)('ts-data-forge');",
      ['node:module', 'ts-data-forge'],
    ],
    ['import {\n  a,\n  b,\n} from "./x.mjs";', ['./x.mjs']],
    ['import {\n  a, // don\'t\n  b,\n} from "./x.mjs";', ['./x.mjs']],
  ] as const)('reads %s as loading %j', (text, expected) => {
    expect(runtimeImports(text).toSorted()).toStrictEqual(expected);
  });

  test.each(scriptsRunBeforeInstall)(
    '%s loads nothing but node: builtins at runtime',
    (file) => {
      const specifiers = runtimeImports(read(file));

      // Each imports `node:*`, so an empty result means the scan read nothing.
      assert.isNotEmpty(specifiers);

      expect(
        specifiers.filter((specifier) => !specifier.startsWith('node:')),
      ).toStrictEqual([]);
    },
  );

  test.each(
    scriptsRunBeforeInstall.filter(
      (file) => !hasKey(RUNS_ON_PINNED_NODE, file),
    ),
  )(
    '%s uses no Temporal, which the minimum Node in node-support.json lacks',
    (file) => {
      expect(read(file)).not.toMatch(/\bTemporal\./u);
    },
  );

  test.each(scriptsRunBeforeInstall)(
    '%s neither disables nor configures a ts-data-forge rule inline (the override turns them off)',
    (file) => {
      const text = read(file);

      expect(text).not.toMatch(/eslint-disable[^\n]*ts-data-forge\//u);

      expect(text).not.toMatch(/\/\*\s*eslint\s[^*]*ts-data-forge\//u);
    },
  );
});
