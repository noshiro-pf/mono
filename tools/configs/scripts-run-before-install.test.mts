import { execFile } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as util from 'node:util';
import { Arr } from 'ts-data-forge';
import { closingStdin } from '../scripts/lib/child-process.mjs';
import { projectRootPath } from '../scripts/project-root-path.mjs';
import { scriptsRunBeforeInstall } from './scripts-run-before-install.mjs';

const HOOK_SETTINGS = '.claude/settings.json';

const execFileAsync = util.promisify(execFile);

/** The tracked files that can start a command: manifests, workflows, hooks. */
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

/**
 * A path to a root `tools/**.mts`: at the start of a word, or after `./`, `../`
 * or a variable (`$GITHUB_WORKSPACE/`), never inside another directory.
 */
const SCRIPT =
  /(?<=^|[\s"'=]|\.\/|\$\{?\w+\}?\/|["')}]\/)tools\/[\w./-]+\.mts/gu;

/** `node` and `tsx` as the word that runs a command, not part of a name. */
const runsNode = /(?:^|[\s"'(`])node(?=\s)/u;

const runsTsx = /(?:^|[\s"'/])tsx(?=\s|$)/u;

/**
 * The scripts a manifest, workflow or hook file runs under plain `node` rather
 * than `tsx`. Continued lines are joined and every line is split into its
 * commands (newlines, a JSON `\n` escape, `&&`, `||`, `;`, `|`); one that runs `node` and not `tsx` runs each
 * `tools/**.mts` it names, however spelled (`node ./tools/…`,
 * `node --flag "$GITHUB_WORKSPACE/tools/…"`), and the script of a variable it
 * names, as last assigned before it (the hooks' `f="…/tools/…"; … node "$f"`).
 */
const scriptsRunByNodeIn = (text: string): readonly string[] => {
  const commands = text
    .replaceAll(/\\\r?\n/gu, ' ')
    .split(/\r?\n|\\n|&&|\|\||;|\|/u);

  // Bound in order, as the shell does, so that each hook's `f` is its own.
  const mut_variables = new Map<string, string>();

  return commands.flatMap((command) => {
    for (const [, name, value] of command.matchAll(/(\w+)=(\S*)/gu)) {
      const script = value?.match(SCRIPT)?.[0];

      if (name !== undefined) {
        if (script === undefined) {
          mut_variables.delete(name);
        } else {
          mut_variables.set(name, script);
        }
      }
    }

    return runsNode.test(command) && !runsTsx.test(command)
      ? [
          ...(command.match(SCRIPT) ?? []),
          ...Array.from(command.matchAll(/\$\{?(\w+)/gu), (match) =>
            mut_variables.get(match[1] ?? ''),
          ).filter((script) => script !== undefined),
        ]
      : [];
  });
};

/** Every `tools/**.mts` a manifest, workflow or hook runs under `node`. */
const scriptsRunByNode = async (): Promise<readonly string[]> => {
  const files = await commandFiles();

  return Arr.uniq(
    files.flatMap((file) => scriptsRunByNodeIn(read(file))),
  ).toSorted();
};

/**
 * Every module a file loads at runtime: a static `import` that is not
 * `import type`, a side-effect `import '…'`, an `export … from`, and a dynamic
 * `import(…)`. An inline `import { type X }` still loads its module.
 */
const runtimeImports = (text: string): readonly string[] =>
  Array.from(
    text.matchAll(
      /^\s*(?:import(?!\s+type\s)[^;'"]*?\sfrom\s*|import\s*|export\s[^;'"]*?\sfrom\s*)["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']/gmu,
    ),
    (match) => match[1] ?? match[2] ?? '',
  );

describe('scriptsRunBeforeInstall', () => {
  test.each([
    ['node ./tools/a.mts && vitest run', ['tools/a.mts']],
    ["node ./tools/a.mts --glob 'src/**/*.tsx'", ['tools/a.mts']],
    [
      'tsx --tsconfig ./tsconfig.tsx.json x && node ./tools/a.mts',
      ['tools/a.mts'],
    ],
    ['run: |\n  f=./tools/a.mts\n  node "$f"', ['tools/a.mts']],
    ['node \\\n  ./tools/a.mts', ['tools/a.mts']],
    ['NODE_OPTIONS=--x f=./tools/a.mts; node "$f"', ['tools/a.mts']],
    ["- 'tools/scripts/cmd/check-node-support.mts'", []],
    ['node ./libs/foo/tools/b.mts', []],
    ['out="$(node ./tools/a.mts)"', ['tools/a.mts']],
    ['x=`node ./tools/a.mts`', ['tools/a.mts']],
    // eslint-disable-next-line no-template-curly-in-string -- a workflow expression, not a template.
    ['node "${{ github.workspace }}/tools/a.mts"', ['tools/a.mts']],
    ['node "$PWD"/tools/a.mts', ['tools/a.mts']],
    [
      String.raw`f=\"$CLAUDE_PROJECT_DIR/tools/a.mts\"\nnode \"$f\"`,
      ['tools/a.mts'],
    ],
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
  ] as const)('reads %s as running %j under node', (line, expected) => {
    expect(scriptsRunByNodeIn(line)).toStrictEqual(expected);
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
    ["const m = await import('ts-data-forge');", ['ts-data-forge']],
    ['import {\n  a,\n  b,\n} from "./x.mjs";', ['./x.mjs']],
  ] as const)('reads %s as loading %j', (text, expected) => {
    expect(runtimeImports(text)).toStrictEqual(expected);
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

  test.each(scriptsRunBeforeInstall)(
    '%s disables no ts-data-forge rule line by line (the override does)',
    (file) => {
      expect(read(file)).not.toMatch(/eslint-disable[^\n]*ts-data-forge\//u);
    },
  );
});
