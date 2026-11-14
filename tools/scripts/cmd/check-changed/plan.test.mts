import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import * as ts from 'typescript';
import { projectRootPath } from '../../project-root-path.mjs';
import { TEST_DOCUMENTS } from '../check-test-documents.mjs';
import { ignoredBy, readGateList } from '../workflow-steps.mjs';
import { readPackages } from './packages.mjs';
import {
  buildPlan,
  classifyChanges,
  isLintToolchain,
  isSpellCheckedByCi,
  readManifestDependencies,
  stepEnvironment,
  type PackageInfo,
  type Step,
} from './plan.mjs';

const pkg = (
  dir: string,
  scripts: readonly string[],
  {
    workspaceDependencies = [],
    buildDependencies = [],
    exportsBuild = false,
    isPrivate = false,
    forgottenExportsRead = false,
    lintImports = [],
  }: Readonly<{
    workspaceDependencies?: readonly string[];
    buildDependencies?: readonly string[];
    exportsBuild?: boolean;
    isPrivate?: boolean;
    forgottenExportsRead?: boolean;
    lintImports?: readonly string[];
  }> = {},
): PackageInfo =>
  ({
    name: dir.slice(dir.lastIndexOf('/') + 1),
    dir,
    scripts: new Set(scripts),
    isPrivate,
    workspaceDependencies: new Set(workspaceDependencies),
    buildDependencies: new Set(buildDependencies),
    runtimeMembers: new Set(buildDependencies),
    exportsBuild,
    forgottenExportsRead,
    lintImports: new Set(lintImports),
  }) as const;

const packages = [
  pkg('libs/ts-data-forge', [
    'gen',
    'fix:lint',
    'check:types',
    'check:test',
    'check:test:cov',
  ]),
  pkg('apps/profile', ['fix:lint', 'check:types', 'check:test']),
  pkg('languages/sumi/checker', ['check:types', 'check:sumi']),
  pkg('strict-lib/v7.0', ['gen:lib', 'check:types']),
  pkg('libs/synstate', ['gen', 'build', 'check:types'], {
    exportsBuild: true,
    forgottenExportsRead: true,
  }),
  pkg('libs/synstate-react-hooks', ['gen', 'build', 'check:types'], {
    workspaceDependencies: ['synstate'],
    exportsBuild: true,
  }),
  pkg('apps/synstate-docs', ['gen', 'check:types'], {
    workspaceDependencies: ['synstate', 'synstate-react-hooks'],
  }),
  pkg('apps/react-utils', ['gen', 'build', 'check:types'], {
    workspaceDependencies: ['react-base'],
    buildDependencies: ['react-base'],
  }),
  // Declared by react-utils alone, no generator's own.
  pkg('libs/react-base', ['build', 'check:types'], { exportsBuild: true }),
  pkg('apps/react-app', ['gen', 'check:types'], {
    workspaceDependencies: ['react-utils'],
  }),
  pkg('libs/leaf', ['build', 'check:types'], { exportsBuild: true }),
  // Sorts before what it depends on, so that directory order is not build
  // order.
  pkg('libs/a-leaf-user', ['build', 'check:types'], {
    workspaceDependencies: ['leaf'],
    buildDependencies: ['leaf'],
    exportsBuild: true,
  }),
  pkg('apps/leaf-docs', ['gen'], {
    workspaceDependencies: ['leaf', 'a-leaf-user'],
  }),
  pkg('libs/lonely', ['build', 'check:types'], {
    exportsBuild: true,
    forgottenExportsRead: true,
  }),
  pkg('libs/private-lib', ['build', 'check:types'], {
    exportsBuild: true,
    isPrivate: true,
  }),
  // Private, and read by check:forgotten-exports all the same.
  pkg('libs/synstate-next', ['build', 'check:types'], {
    exportsBuild: true,
    isPrivate: true,
    forgottenExportsRead: true,
  }),
  pkg('apps/app-with-dist', ['build', 'check:types'], { exportsBuild: true }),
  // A pair with no dependent generator, the user sorting first.
  pkg('libs/z-base', ['build', 'check:types'], {
    exportsBuild: true,
    forgottenExportsRead: true,
  }),
  pkg('libs/y-user', ['build', 'check:types'], {
    workspaceDependencies: ['z-base'],
    buildDependencies: ['z-base'],
    exportsBuild: true,
    forgottenExportsRead: true,
  }),
  // Read, and built against private-lib, which is not.
  pkg('libs/x-on-private', ['build', 'check:types'], {
    workspaceDependencies: ['private-lib'],
    buildDependencies: ['private-lib'],
    exportsBuild: true,
    forgottenExportsRead: true,
  }),
  // Read, and built against a package its imports reach as sources.
  pkg('libs/v-on-source', ['build', 'check:types'], {
    workspaceDependencies: ['source-lib'],
    buildDependencies: ['source-lib'],
    exportsBuild: true,
    forgottenExportsRead: true,
  }),
  pkg('libs/source-lib', ['build', 'check:types']),
  // A chain through a member no test changes, the top sorting first.
  pkg('libs/c-top', ['build', 'check:types'], {
    workspaceDependencies: ['m-middle'],
    buildDependencies: ['m-middle'],
    exportsBuild: true,
    forgottenExportsRead: true,
  }),
  pkg('libs/m-middle', ['build', 'check:types'], {
    workspaceDependencies: ['d-bottom'],
    buildDependencies: ['d-bottom'],
    exportsBuild: true,
    forgottenExportsRead: true,
  }),
  pkg('libs/d-bottom', ['build', 'check:types'], {
    exportsBuild: true,
    forgottenExportsRead: true,
  }),
  pkg('apps/no-gen', ['check:types'], {
    workspaceDependencies: ['synstate', 'lonely'],
  }),
  // An ESLint plugin, built against a rule kit and a helper that sort after it,
  // and loaded by one app's `fix:lint`.
  pkg('libs/eslint-plugin-demo', ['build', 'fix:lint', 'check:types'], {
    workspaceDependencies: ['eslint-rule-demo', 'lint-helper'],
    buildDependencies: ['eslint-rule-demo', 'lint-helper'],
    exportsBuild: true,
    // Its own config loads its build, as `eslint-config-typed`'s does.
    lintImports: ['eslint-plugin-demo'],
  }),
  pkg('libs/eslint-rule-demo', ['build', 'fix:lint', 'check:types'], {
    exportsBuild: true,
  }),
  pkg('libs/lint-helper', ['build', 'fix:lint', 'check:types'], {
    exportsBuild: true,
  }),
  pkg('apps/lint-user', ['fix:lint', 'check:types'], {
    workspaceDependencies: ['eslint-plugin-demo'],
    lintImports: ['eslint-plugin-demo'],
  }),
] as const;

const rootScripts = [
  'check:root:types',
  'check:root:lint',
  'check:root:test',
  'check:root:actionlint',
  'check:root:ci-commands',
  'check:prose',
  'check:prose:next-major',
  'check:knip',
] as const;

/** The gate's `code` list, as `tools/configs/gate-ignore-lists.json` gives it. */
const proseGateResult = readGateList('code', projectRootPath);

// Empty when the list is not read, which the first test below reports by its
// message rather than failing the whole file at import.
const proseGate = proseGateResult.ok ? proseGateResult.value : ([] as const);

const noReaders = new Map<string, readonly string[]>();

const classify = (files: readonly string[]) =>
  classifyChanges({
    files,
    packages,
    proseGate,
    generatorReaders: noReaders,
  });

const sortedAreas = (
  classification: Readonly<{ areas: ReadonlySet<string> }>,
): readonly string[] =>
  Array.from(classification.areas).toSorted((x, y) => x.localeCompare(y));

const plan = (files: readonly string[], coverage = true) =>
  buildPlan({
    classification: classify(files),
    base: 'abc123',
    rootScripts,
    coverage,
    spellChecked: files,
  });

const describeStep = ({ cwd, args }: Step): string =>
  `${cwd === '.' ? '' : `${cwd}: `}${args.join(' ')}` as const;

/** The index of `command` in `commands`, failing when it is not there. */
const at = (commands: readonly string[], command: string): number => {
  assert.include(commands, command);

  return commands.indexOf(command);
};

/** The last index of `command` in `commands`, failing when it is not there. */
const lastAt = (commands: readonly string[], command: string): number => {
  assert.include(commands, command);

  return commands.lastIndexOf(command);
};

const lints = (commands: readonly string[]): readonly string[] =>
  commands.filter((command) => command.endsWith('run fix:lint'));

const commandsOf = (files: readonly string[], coverage = true) =>
  plan(files, coverage).map(describeStep);

/** The commands planned for `files` over a workspace of `members` alone. */
const planCommands = (
  members: readonly PackageInfo[],
  files: readonly string[],
): readonly string[] =>
  buildPlan({
    classification: classifyChanges({
      files,
      packages: members,
      proseGate,
      generatorReaders: noReaders,
    }),
    base: 'abc123',
    rootScripts,
    coverage: true,
    spellChecked: [],
  }).map(describeStep);

/** Whether the root's own lint runs for a change to `file`. */
const rootLint = (file: string): boolean =>
  commandsOf([file]).some(
    (command) =>
      command.startsWith('exec run-p') && command.includes('check:root:lint'),
  );

describe('the code gate, read through readGateList', () => {
  test('understand every pattern the code gate has', () => {
    assert.deepStrictEqual(
      proseGateResult.ok ? undefined : proseGateResult.message,
      undefined,
    );

    assert.isNotEmpty(proseGate);

    assert.doesNotThrow(() => ignoredBy(proseGate)('x'));
  });

  test.each([
    ['README.md', true],
    ['libs/a/README.md', true],
    ['docs/anything.ts', true],
    ['libs/a/cspell.config.yaml', true],
    ['.cspell.config.yaml', true],
    ['LICENSE', true],
    ['libs/a/LICENSE', false],
    ['libs/a/src/x.mts', false],
    ['tools/scripts/cmd/x.mts', false],
    ['apps/a/README.md', true],
    // A page an app builds, which its e2e checks judge (#2817).
    ['apps/a/src/content/docs/ja/page.md', false],
  ] as const)('%s is prose: %s', (file, expected) => {
    assert.strictEqual(ignoredBy(proseGate)(file), expected);
  });

  test('a pattern of an unknown shape throws rather than misfiling', () => {
    assert.throws(() => ignoredBy(['src/*/x.ts'])('a'), /Unsupported/u);
  });
});

describe('stepEnvironment', () => {
  test('every step runs as CI does, against the base it was given', () => {
    assert.deepStrictEqual(stepEnvironment('abc123'), {
      CI: 'true',
      CODEMOD_DIFF_BASE: 'abc123',
      PROSE_DIFF_BASE: 'abc123',
    });
  });
});

describe('isSpellCheckedByCi', () => {
  test.each([
    ['libs/a/src/x.mts', true],
    ['.github/workflows/code-check.yml', true],
    ['CLAUDE.md', true],
    ['.changeset/brave-cats.md', false],
    ['.claude/settings.json', false],
    ['.cspell.config.yaml', false],
    ['libs/a/.oxlintrc.json', false],
  ] as const)('%s → %s', (file, expected) => {
    assert.strictEqual(isSpellCheckedByCi(file), expected);
  });

  test('the cspell step leaves out what CI does not spell-check', () => {
    const step = buildPlan({
      classification: classify(['.claude/settings.json', 'CLAUDE.md']),
      base: 'abc123',
      rootScripts,
      coverage: false,
      spellChecked: ['.claude/settings.json', 'CLAUDE.md'],
    }).find(({ args }) => args.includes('cspell'));

    assert.deepStrictEqual(step?.args.slice(-1), ['./CLAUDE.md']);
  });
});

describe('classifyChanges', () => {
  test('a source file touches its package as code', () => {
    const result = classify(['libs/ts-data-forge/src/array.mts']);

    assert.deepStrictEqual(
      result.packages.map(({ pkg: { dir }, code, emitted }) => ({
        dir,
        code,
        emitted,
      })),
      [{ dir: 'libs/ts-data-forge', code: true, emitted: true }],
    );

    assert.deepStrictEqual(sortedAreas(result), [
      'published-source',
      'root-guards',
    ]);
  });

  test('a README touches its package as documents only', () => {
    const result = classify(['libs/ts-data-forge/README.md']);

    assert.deepStrictEqual(
      result.packages.map(({ code }) => code),
      [false],
    );

    assert.deepStrictEqual(sortedAreas(result), ['prose']);
  });

  test('the longest member directory wins', () => {
    const result = classify(['languages/sumi/checker/src/a.mts']);

    assert.deepStrictEqual(
      result.packages.map(({ pkg: { dir } }) => dir),
      ['languages/sumi/checker'],
    );
  });

  test('strict-lib/ is one area, not its members', () => {
    const result = classify(['strict-lib/v7.0/source/x.mts']);

    assert.deepStrictEqual(result.packages, []);

    assert.deepStrictEqual(sortedAreas(result), [
      'root-guards',
      'strict-lib',
      'strict-lib-output',
    ]);
  });

  test.each([
    ['strict-lib/scripts-common/src/convert.mts', true],
    ['strict-lib/scripts/cmd/gen-version-diff.mts', true],
    ['strict-lib/v7.0/scripts/gen.mts', true],
    ['strict-lib/v5.0/output/diff-from-prev/summary.txt', true],
    ['strict-lib/v7.0/temp/copied/lib.es5.d.ts', true],
    ['strict-lib/v7.0/CHANGELOG.md', true],
    ['strict-lib/v7.0/package.json', true],
    ['strict-lib/.oxfmtrc.json', true],
    ['strict-lib/eslint.config.mts', false],
    ['strict-lib/README.md', false],
    ['strict-lib/docs/notes.md', false],
    ['strict-lib/configs/tsconfig/tsconfig.lib-check.json', false],
    ['strict-lib/tsconfig.tooling.json', false],
  ] as const)(
    '%s reaches what the strict-lib generators read or write: %s',
    (file, expected) => {
      assert.strictEqual(
        classify([file]).areas.has('strict-lib-output'),
        expected,
      );
    },
  );

  test('experimental/ is ignored', () => {
    const result = classify(['experimental/old/a.ts']);

    assert.deepStrictEqual(result.ignored, ['experimental/old/a.ts']);

    assert.deepStrictEqual(sortedAreas(result), []);
  });

  test.each([
    ['tools/scripts/cmd/x.mts', ['root', 'root-guards']],
    ['tools/configs/vite-config.mts', ['root', 'root-guards', 'shared-config']],
    ['eslint.config.mts', ['published-source', 'root', 'root-guards']],
    ['tsconfig.json', ['root', 'root-guards']],
    ['libs/ts-data-forge/configs/vitest.config.mts', ['root', 'root-guards']],
    [
      'libs/ts-data-forge/eslint.config.mts',
      ['published-source', 'root', 'root-guards'],
    ],
    [
      'libs/ts-data-forge/samples/eslint.config.mts',
      ['published-source', 'root', 'root-guards'],
    ],
    [
      'languages/sumi/cli/eslint.config.mts',
      ['published-source', 'root', 'root-guards'],
    ],
    ['.markdownlint-cli2.mjs', ['prose', 'root']],
    ['verify-npm-packages/isolate-hooks.mjs', ['root', 'root-guards']],
    ['tools/scripts/cmd/check-changed/README.md', ['prose']],
    // Code to the gate, and still Markdown for `check:md`.
    [
      'apps/synstate-docs/src/content/docs/ja/getting-started/installation.md',
      ['prose', 'root-guards'],
    ],
    // A document a unit test reads (`check:root:test-documents`): code to the
    // gate too, so that its package's tests run.
    ...Object.values(TEST_DOCUMENTS).map(
      (document) => [document, ['prose', 'root-guards']] as const,
    ),
    ['.cspell.config.yaml', ['prose', 'spell-config']],
    ['libs/ts-data-forge/cspell.config.yaml', ['prose', 'spell-config']],
    ['.prettierrc', ['format-config', 'prose']],
    ['.github/workflows/code-check.yml', ['root-guards']],
    ['.claude/settings.json', ['root-guards']],
    ['libs/ts-data-forge/tsconfig.json', ['root-guards']],
    ['libs/ts-data-forge/package.json', ['manifest', 'root-guards']],
    ['pnpm-lock.yaml', ['manifest', 'root-guards']],
    ['.changeset/brave-cats.md', ['changeset', 'prose']],
    ['repo-settings/rulesets/main.json', ['repo-settings', 'root-guards']],
  ] as const)('%s touches %j', (file, areas) => {
    assert.deepStrictEqual(sortedAreas(classify([file])), areas);
  });

  test('every file the root tsconfig.json names touches the root program', () => {
    const parsed = ts.getParsedCommandLineOfConfigFile(
      path.join(projectRootPath, 'tsconfig.json'),
      {},
      { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined },
    );

    assert.isDefined(parsed);

    const missed = parsed.fileNames
      .map((file) =>
        path.relative(projectRootPath, file).replaceAll(path.sep, '/'),
      )
      .filter((file) => !classify([file]).areas.has('root'));

    assert.deepStrictEqual(missed, []);
  });
});

// A document a unit test reads is taken back by the code gate so that its test
// runs for a diff of it alone (`check:root:test-documents`); this asks the plan
// itself, with the workspace as it is.
// `assert.isTrue` takes no message in this repository's typings (TS2554), and
// these failures need one: `expect(…, message).toBe(true)` instead.
describe('the documents a unit test reads', () => {
  test.each(Object.entries(TEST_DOCUMENTS))(
    'a diff of the one %s reads runs that test',
    async (testFile, document) => {
      expect(
        proseGateResult.ok,
        'The code gate list could not be read; see the first test.',
      ).toBe(true);

      const members = await readPackages();

      const member = members
        .filter(({ dir }) => testFile.startsWith(`${dir}/`))
        .toSorted((a, b) => b.dir.length - a.dir.length)[0];

      const steps = buildPlan({
        classification: classifyChanges({
          files: [document],
          packages: members,
          proseGate,
          generatorReaders: noReaders,
        }),
        base: 'abc123',
        rootScripts: ['check:root:test'],
        coverage: false,
        spellChecked: [],
      });

      // A test in a member runs by its `check:test`; one in no member is the
      // root program's, which `check:root:test` runs when it is under
      // tools/scripts/ or tools/configs/.
      const runs =
        member === undefined
          ? /^tools\/(?:scripts|configs)\/.*\.test\.mts$/u.test(testFile) &&
            steps.some(
              ({ cwd, args }) =>
                cwd === '.' && args.includes('check:root:test'),
            )
          : steps.some(
              ({ cwd, args }) =>
                cwd === member.dir && args.includes('check:test'),
            );

      expect(
        runs,
        `check-changed would not run ${testFile} for a diff of ${document} alone: keep the document in the test's workspace package, or the test in the document's (for a test of the root program, the test under tools/scripts/ or tools/configs/ and the document under tools/).`,
      ).toBe(true);
    },
  );
});

describe('buildPlan', () => {
  test('a package source change: format, generate, fix, check, spell, format', () => {
    assert.deepStrictEqual(commandsOf(['libs/ts-data-forge/src/array.mts']), [
      'run z:format-diff-from abc123',
      'libs/ts-data-forge: run gen',
      'run gen:verify-npm-packages',
      'run fix:codemod:affected',
      'run z:format-diff-from abc123',
      'libs/ts-data-forge: run fix:lint',
      'libs/ts-data-forge: run check:types',
      'libs/ts-data-forge: run check:test',
      'exec run-p --continue-on-error --print-label check:root:actionlint check:root:ci-commands',
      'run check:knip',
      'run check:published-deps',
      'run check:prose',
      'exec cspell --no-progress --no-must-find-files --gitignore ./libs/ts-data-forge/src/array.mts',
      'run z:format-diff-from abc123',
    ]);
  });

  test('check:test carries the coverage mark where check:test:cov exists', () => {
    const covered = plan(['libs/ts-data-forge/src/array.mts']).find(
      ({ coverage }) => coverage !== undefined,
    );

    assert.deepStrictEqual(covered?.coverage, {
      packageDir: 'libs/ts-data-forge',
    });

    assert.include(
      commandsOf(['libs/ts-data-forge/src/array.mts'], false),
      'libs/ts-data-forge: run check:test',
    );
  });

  test('a cspell config runs the whole spell check, not the changed files', () => {
    const commands = commandsOf(['.cspell.config.yaml', '.changeset/a.md']);

    assert.include(commands, 'run check:cspell');

    assert.notInclude(commands, 'run check:cspell:changeset');

    assert.notInclude(commands.join('\n'), 'exec cspell');
  });

  test('a Prettier config formats the whole tree at the end', () => {
    assert.strictEqual(commandsOf(['.prettierrc']).at(-1), 'run fix:fmt:full');
  });

  test('a package without a script skips it', () => {
    assert.notInclude(
      commandsOf(['apps/profile/src/index.mts']).join('\n'),
      'apps/profile: run gen',
    );
  });

  test('a README runs the generator and the prose checks, not the code checks', () => {
    const commands = commandsOf(['libs/ts-data-forge/README.md']);

    assert.include(commands, 'libs/ts-data-forge: run gen');

    assert.include(commands, 'run check:md');

    assert.notInclude(commands, 'libs/ts-data-forge: run check:types');

    assert.notInclude(commands, 'run fix:codemod:affected');
  });

  test('tools/ runs every root check, the tests on their own for coverage', () => {
    const commands = commandsOf(['tools/scripts/cmd/x.mts']);

    assert.include(
      commands,
      'exec run-p --continue-on-error --print-label check:root:actionlint check:root:ci-commands check:root:lint check:root:types',
    );

    assert.include(commands, 'run check:root:test');
  });

  test('a workflow runs the root guards without the root program checks', () => {
    assert.include(
      commandsOf(['.github/workflows/code-check.yml']),
      'exec run-p --continue-on-error --print-label check:root:actionlint check:root:ci-commands',
    );
  });

  test('a manifest regenerates the dependency graph and runs knip', () => {
    const commands = commandsOf(['apps/profile/package.json']);

    assert.include(commands, 'run gen:deps-graph');

    assert.include(commands, 'run gen:license-files');

    assert.include(commands, 'run gen:verify-npm-packages');

    assert.include(commands, 'run check:knip');

    assert.include(commands, 'run check:published-deps');
  });

  test.each([
    'tools/scripts/cmd/gen-dependency-graph.mts',
    'docs/package-dependencies.md',
  ])('%s regenerates the dependency graph', (file) => {
    assert.include(commandsOf([file]), 'run gen:deps-graph');
  });

  // #3336: what the generator calls is what it reads, too.
  test('a library function the generator calls regenerates the dependency graph', () => {
    assert.include(
      commandsOf([
        'libs/ts-repo-utils/src/functions/workspace-utils/get-workspace-packages.mts',
      ]),
      'run gen:deps-graph',
    );
  });

  test('a source file does not regenerate the dependency graph', () => {
    assert.notInclude(
      commandsOf(['libs/ts-data-forge/src/array.mts']),
      'run gen:deps-graph',
    );
  });

  test.each([
    'libs/ts-data-forge/LICENSE',
    'LICENSE',
    'tools/scripts/cmd/gen-license-files.mts',
  ])('%s regenerates the LICENSE files', (file) => {
    assert.include(commandsOf([file]), 'run gen:license-files');
  });

  test('a source file does not regenerate the LICENSE files', () => {
    assert.notInclude(
      commandsOf(['libs/ts-data-forge/src/array.mts']),
      'run gen:license-files',
    );
  });

  // `codemod-affected.mts` runs the codemod in full when the lockfile or a
  // script naming its transformers changed, neither of which is TypeScript.
  test.each(['pnpm-lock.yaml', '.github/workflows/code-check.yml'])(
    'a change the code gate lets through runs the codemod: %s',
    (file) => {
      assert.include(commandsOf([file]), 'run fix:codemod:affected');
    },
  );

  test('a package code change runs knip and the published-deps check', () => {
    // Removing a dependency's last import changes code and no manifest, and
    // leaves the dependency unused (#3042).
    const commands = commandsOf(['apps/profile/src/index.mts']);

    assert.include(commands, 'run check:knip');

    assert.include(commands, 'run check:published-deps');
  });

  test('a converter change runs the strict-lib generators, then the version diffs, as generators', () => {
    const commands = commandsOf(['strict-lib/scripts-common/src/convert.mts']);

    const generator = commands.indexOf('run strict-lib:gen:with-codemod-fixed');

    const versionDiff = commands.indexOf('run strict-lib:gen:version-diff');

    assert.isAbove(generator, -1);

    assert.isAbove(versionDiff, generator);

    assert.isAbove(commands.indexOf('run strict-lib:check:types'), versionDiff);

    assert.isAbove(
      commands.indexOf('run gen:verify-npm-packages'),
      versionDiff,
    );

    assert.deepStrictEqual(
      plan(['strict-lib/scripts-common/src/convert.mts'])
        .filter(({ args }) => args[1]?.startsWith('strict-lib:gen') === true)
        .map(({ kind }) => kind),
      ['generate', 'generate'],
    );
  });

  test('the strict-lib generators run before every other generator', () => {
    const steps = plan([
      'strict-lib/scripts-common/src/convert.mts',
      'libs/synstate/src/x.mts',
      'libs/synstate/package.json',
    ]);

    const generators = steps
      .filter(({ kind }) => kind === 'generate')
      .map(({ args }) => args[1]);

    assert.deepStrictEqual(Arr.take(generators, 2), [
      'strict-lib:gen:with-codemod-fixed',
      'strict-lib:gen:version-diff',
    ]);

    assert.includeMembers(Arr.skip(generators, 2), [
      'gen',
      'gen:deps-graph',
      'gen:verify-npm-packages',
    ]);

    assert.isBelow(
      steps.findIndex(({ args }) => args[1] === 'strict-lib:gen:version-diff'),
      steps.findIndex(({ kind }) => kind === 'build'),
    );
  });

  test('a member whose generators import a changed file outside it runs its `gen`, once', () => {
    const steps = buildPlan({
      classification: classifyChanges({
        files: ['tools/configs/gen-shared.mts', 'libs/synstate/src/x.mts'],
        packages,
        proseGate,
        generatorReaders: new Map<string, readonly string[]>([
          ['libs/ts-data-forge', ['tools/configs/gen-shared.mts']],
          // Touched by the diff, so its own `gen` runs already.
          ['libs/synstate', ['tools/configs/gen-shared.mts']],
          // A dependent of synstate, so it runs as one.
          ['apps/synstate-docs', ['tools/configs/gen-shared.mts']],
        ]),
      }),
      base: 'abc123',
      rootScripts,
      coverage: false,
      spellChecked: [],
    });

    const generators = steps
      .filter(({ kind }) => kind === 'generate')
      .map(({ title }) => title);

    assert.include(
      generators,
      'ts-data-forge: gen (imports tools/configs/gen-shared.mts)',
    );

    assert.deepStrictEqual(
      steps
        .filter(({ kind, args }) => kind === 'generate' && args[1] === 'gen')
        .map(({ cwd }) => cwd)
        .filter((cwd) => ['libs/synstate', 'apps/synstate-docs'].includes(cwd)),
      ['libs/synstate', 'apps/synstate-docs'],
    );
  });

  test('a change to the strict-lib tooling alone runs no generator', () => {
    const commands = commandsOf(['strict-lib/eslint.config.mts']);

    assert.include(commands, 'run strict-lib:check:lint');

    assert.notInclude(commands, 'run strict-lib:gen:with-codemod-fixed');

    assert.notInclude(commands, 'run strict-lib:gen:version-diff');
  });

  test.each([
    'tools/scripts/cmd/x.mts',
    'strict-lib/scripts-common/src/convert.mts',
    'apps/synstate-docs/src/content/docs/index.mdx',
    'libs/ts-data-forge/tsconfig.json',
    '.github/workflows/code-check.yml',
  ] as const)('%s runs knip, as CI does for any code change', (file) => {
    assert.include(commandsOf([file]), 'run check:knip');
  });

  test.each([
    ['libs/ts-data-forge/src/array.mts', true],
    ['libs/ts-data-forge/eslint.config.mts', true],
    ['eslint.config.mts', true],
    ['languages/sumi/cli/eslint.config.mts', true],
    ['strict-lib/eslint.config.mts', true],
    ['libs/ts-data-forge/test/array.test.mts', false],
    ['tools/scripts/cmd/x.mts', false],
  ] as const)('%s runs the published-deps check: %s', (file, expected) => {
    assert.strictEqual(
      commandsOf([file]).includes('run check:published-deps'),
      expected,
    );
  });

  test('a document change runs neither knip nor the published-deps check', () => {
    const commands = commandsOf(['libs/ts-data-forge/README.md']);

    assert.notInclude(commands, 'run check:knip');

    assert.notInclude(commands, 'run check:published-deps');
  });

  test('the codemod output is formatted before it is linted', () => {
    const titles = plan(['libs/ts-data-forge/src/array.mts']).map(
      ({ title }) => title,
    );

    assert.deepStrictEqual(
      titles.slice(
        titles.indexOf('fix:codemod:affected'),
        titles.indexOf('ts-data-forge: fix:lint') + 1,
      ),
      [
        'fix:codemod:affected',
        'format what the codemod reprinted',
        'ts-data-forge: fix:lint',
      ],
    );
  });

  test('check:ext runs in every package the diff touches, documents included', () => {
    const steps = buildPlan({
      classification: classifyChanges({
        files: ['libs/ext/README.md'],
        packages: [pkg('libs/ext', ['check:ext', 'check:types'])],
        proseGate,
        generatorReaders: noReaders,
      }),
      base: 'abc123',
      rootScripts,
      coverage: false,
      spellChecked: [],
    }).map(({ title }) => title);

    assert.include(steps, 'ext: check:ext');

    assert.notInclude(steps, 'ext: check:types');
  });

  // check-changed-gap.mts tells a step over the diff from the CI script over
  // everything by this mark, so a new one that leaves it out misreports.
  test('every step given the base or the changed files names what it narrows', () => {
    assert.deepStrictEqual(
      [
        'libs/ts-data-forge/src/array.mts',
        'libs/ts-data-forge/README.md',
        '.prettierrc',
      ].flatMap((file) =>
        plan([file])
          .filter(
            ({ args, narrows }) =>
              (args.includes('abc123') || args.includes(`./${file}`)) &&
              narrows === undefined,
          )
          .map(({ title }) => title),
      ),
      [],
    );
  });

  test('the steps that run a CI script over the diff alone say which', () => {
    const steps = plan(['libs/ts-data-forge/src/array.mts']);

    assert.deepStrictEqual(
      steps
        .filter(({ narrows }) => narrows !== undefined)
        .map(({ title, narrows }) => `${title}: ${narrows}`),
      [
        'format the diff (before): fix:fmt:full',
        'format what the codemod reprinted: fix:fmt:full',
        'cspell over the changed files: check:cspell',
        'format the diff (after): fix:fmt:full',
      ],
    );
  });

  test('a prose-only change formats only before and after', () => {
    assert.deepStrictEqual(
      plan(['libs/ts-data-forge/README.md'])
        .filter(({ args }) =>
          args.some((arg) => arg.includes('fmt') || arg.includes('format')),
        )
        .map(({ title, args }) => `${title}: ${args.join(' ')}`),
      [
        'format the diff (before): run z:format-diff-from abc123',
        'format the diff (after): run z:format-diff-from abc123',
      ],
    );
  });

  test('generators are the only steps of kind generate', () => {
    assert.deepStrictEqual(
      plan(['libs/ts-data-forge/package.json'])
        .filter(({ kind }) => kind === 'generate')
        .map(({ title }) => title),
      [
        'ts-data-forge: gen',
        'gen:deps-graph',
        'gen:license-files',
        'gen:verify-npm-packages',
      ],
    );
  });

  test.each([
    'verify-npm-packages/smoke/pr-merge-queue.mjs',
    'verify-npm-packages/local/packages/synstate/synstate.mjs',
    'tools/scripts/cmd/verify-npm-packages.mts',
    'libs/ts-repo-utils/src/functions/workspace-utils/get-workspace-packages.mts',
  ] as const)(
    '%s regenerates the copies verify-npm-packages installs',
    (file) => {
      assert.include(commandsOf([file]), 'run gen:verify-npm-packages');
    },
  );

  test('a source change builds the package, then runs the generators of what declares it', () => {
    const commands = commandsOf(['libs/synstate/src/index.mts']);

    assert.deepStrictEqual(
      commands.slice(0, commands.indexOf('run gen:verify-npm-packages')),
      [
        'run z:format-diff-from abc123',
        'libs/synstate: run gen',
        'libs/synstate: run build',
        'apps/synstate-docs: run gen',
        'libs/synstate-react-hooks: run gen',
      ],
    );
  });

  test('a dependent the diff touches runs its generator again after the build', () => {
    const commands = commandsOf([
      'libs/synstate/src/index.mts',
      'libs/synstate-react-hooks/src/index.mts',
    ]);

    assert.deepStrictEqual(
      commands.slice(0, commands.indexOf('run gen:verify-npm-packages')),
      [
        'run z:format-diff-from abc123',
        'libs/synstate: run gen',
        'libs/synstate-react-hooks: run gen',
        'libs/synstate: run build',
        'libs/synstate-react-hooks: run build',
        'apps/synstate-docs: run gen',
        'libs/synstate-react-hooks: run gen',
      ],
    );
  });

  test('the generators of what declares it run as generators', () => {
    assert.deepStrictEqual(
      plan(['libs/synstate/src/index.mts'])
        .filter(({ kind }) => kind === 'generate')
        .map(({ title }) => title),
      [
        'synstate: gen',
        'synstate-docs: gen (declares synstate)',
        'synstate-react-hooks: gen (declares synstate)',
        'gen:verify-npm-packages',
      ],
    );
  });

  test('a package its dependents read from source is not built', () => {
    const commands = commandsOf(['apps/react-utils/src/index.mts']);

    assert.include(commands, 'apps/react-app: run gen');

    assert.notInclude(commands, 'apps/react-utils: run build');
  });

  test('a package with no dependent generator is built once, for check:forgotten-exports alone', () => {
    const commands = commandsOf(['libs/lonely/src/index.mts']);

    const builds = commands.filter((command) => command.endsWith('run build'));

    assert.deepStrictEqual(builds, ['libs/lonely: run build']);

    assert.strictEqual(
      commands[commands.indexOf('libs/lonely: run build') + 1],
      'run check:forgotten-exports libs/lonely',
    );
  });

  test('the builds for the generators run in dependency order, not directory order', () => {
    const commands = commandsOf([
      'libs/a-leaf-user/src/index.mts',
      'libs/leaf/src/index.mts',
    ]);

    assert.deepStrictEqual(
      commands
        .slice(0, at(commands, 'apps/leaf-docs: run gen'))
        .filter((command) => command.endsWith('run build')),
      ['libs/leaf: run build', 'libs/a-leaf-user: run build'],
    );
  });

  test('a document change runs no dependent generator', () => {
    const commands = commandsOf(['libs/synstate/README.md']);

    assert.notInclude(commands, 'libs/synstate: run build');

    assert.notInclude(commands, 'apps/synstate-docs: run gen');
  });

  test('a changed package check:forgotten-exports reads is built after its checks, then checked alone', () => {
    const commands = commandsOf(['libs/lonely/src/index.mts']);

    assert.deepStrictEqual(
      commands.slice(
        commands.indexOf('libs/lonely: run check:types'),
        commands.indexOf('run check:forgotten-exports libs/lonely') + 1,
      ),
      [
        'libs/lonely: run check:types',
        'libs/lonely: run build',
        'run check:forgotten-exports libs/lonely',
      ],
    );
  });

  test('a package the generators built is built again after the fixers, which can rewrite it', () => {
    const commands = commandsOf(['libs/synstate/src/index.mts']);

    assert.deepStrictEqual(
      commands.filter((command) => command.endsWith('run build')),
      ['libs/synstate: run build', 'libs/synstate: run build'],
    );

    const lastBuild = commands.lastIndexOf('libs/synstate: run build');

    assert.isAbove(lastBuild, at(commands, 'run fix:codemod:affected'));

    assert.strictEqual(
      commands[lastBuild + 1],
      'run check:forgotten-exports libs/synstate',
    );
  });

  test('check:forgotten-exports builds in dependency order and reads every changed package in one run', () => {
    const files = [
      'libs/y-user/src/index.mts',
      'libs/z-base/src/index.mts',
    ] as const;

    const commands = commandsOf(files);

    const check = commands.indexOf(
      'run check:forgotten-exports libs/y-user libs/z-base',
    );

    assert.deepStrictEqual(commands.slice(check - 2, check), [
      'libs/z-base: run build',
      'libs/y-user: run build',
    ]);

    const steps = plan(files);

    assert.deepStrictEqual(
      steps.filter(({ narrows }) => narrows === 'check:forgotten-exports')
        .length,
      1,
    );
  });

  test('a changed package a read one is built against is built first, and not read', () => {
    const commands = commandsOf([
      'libs/x-on-private/src/index.mts',
      'libs/private-lib/src/index.mts',
    ]);

    const check = commands.indexOf(
      'run check:forgotten-exports libs/x-on-private',
    );

    assert.deepStrictEqual(commands.slice(check - 2, check), [
      'libs/private-lib: run build',
      'libs/x-on-private: run build',
    ]);
  });

  test('the builds follow a dependency through a member the diff does not change, which is not built', () => {
    const commands = commandsOf([
      'libs/c-top/src/index.mts',
      'libs/d-bottom/src/index.mts',
    ]);

    assert.deepStrictEqual(
      commands.filter((command) => command.endsWith('run build')),
      ['libs/d-bottom: run build', 'libs/c-top: run build'],
    );
  });

  test('an unchanged dependency of a changed package is not built', () => {
    assert.deepStrictEqual(
      commandsOf(['libs/y-user/src/index.mts']).filter((command) =>
        command.endsWith('run build'),
      ),
      ['libs/y-user: run build'],
    );
  });

  test('a changed package a read one builds against as sources is not built', () => {
    assert.deepStrictEqual(
      commandsOf([
        'libs/v-on-source/src/index.mts',
        'libs/source-lib/src/index.mts',
      ]).filter((command) => command.endsWith('run build')),
      ['libs/v-on-source: run build'],
    );
  });

  test('a changed package no read one is built against is not built', () => {
    assert.deepStrictEqual(
      commandsOf([
        'libs/lonely/src/index.mts',
        'apps/app-with-dist/src/index.mts',
        'libs/private-lib/src/index.mts',
      ]).filter((command) => command.endsWith('run build')),
      ['libs/lonely: run build'],
    );
  });

  test('a generator reading a package that exports its sources gets what that package is built against', () => {
    const commands = commandsOf([
      'apps/react-utils/src/index.mts',
      'libs/react-base/src/index.mts',
    ]);

    assert.deepStrictEqual(
      commands
        .slice(0, at(commands, 'apps/react-app: run gen'))
        .filter((command) => command.endsWith('run build')),
      ['libs/react-base: run build'],
    );
  });

  test('the builds for a generator take in the changed packages it is built against', () => {
    const commands = commandsOf([
      'libs/leaf/src/index.mts',
      'libs/a-leaf-user/src/index.mts',
    ]);

    assert.deepStrictEqual(
      commands
        .slice(0, at(commands, 'apps/leaf-docs: run gen'))
        .filter((command) => command.endsWith('run build')),
      ['libs/leaf: run build', 'libs/a-leaf-user: run build'],
    );
  });

  test('a private package alone, which the check does not read, is not built', () => {
    assert.notInclude(
      commandsOf(['libs/private-lib/src/index.mts']).join('\n'),
      'run build',
    );
  });

  test('check:forgotten-exports reads a private package only when the package info says it does', () => {
    assert.include(
      commandsOf(['libs/synstate-next/src/index.mts']),
      'run check:forgotten-exports libs/synstate-next',
    );

    assert.notInclude(
      commandsOf(['libs/private-lib/src/index.mts']).join('\n'),
      'check:forgotten-exports',
    );
  });

  test.each([
    // A package the package info says the check does not read.
    'libs/ts-data-forge/src/array.mts',
    'apps/app-with-dist/src/index.mts',
    // A document: the declarations do not change.
    'libs/lonely/README.md',
  ] as const)('%s runs no check:forgotten-exports', (file) => {
    assert.notInclude(commandsOf([file]).join('\n'), 'check:forgotten-exports');
  });

  test('prose alone does not regenerate them', () => {
    assert.notInclude(
      commandsOf(['verify-npm-packages/README.md']),
      'run gen:verify-npm-packages',
    );
  });
});

describe('the ESLint toolchain', () => {
  test.each([
    ['eslint-config-typed', true],
    ['eslint-plugin-ts-data-forge', true],
    ['eslint-rule-forge', true],
    ['ts-data-forge', false],
    ['eslint', false],
    ['prettier-plugin-eslint-x', false],
    ['@sumi-lang/eslint-config', true],
    ['@scope/eslint-plugin', true],
    ['@scope/eslint-plugin-x', true],
    ['@scope/eslint-configs', false],
  ] as const)('%s is part of it: %s', (name, expected) => {
    assert.strictEqual(isLintToolchain(name), expected);
  });

  test('a change to what a plugin emits builds it after the codemod, then lints it and what loads it', () => {
    const commands = commandsOf(['libs/eslint-plugin-demo/src/index.mts']);

    const build = at(commands, 'libs/eslint-plugin-demo: run build');

    assert.isAbove(build, at(commands, 'run fix:codemod:affected'));

    assert.deepStrictEqual(lints(commands.slice(build)), [
      'apps/lint-user: run fix:lint',
      'libs/eslint-plugin-demo: run fix:lint',
    ]);

    assert.deepStrictEqual(lints(commands.slice(0, build)), []);

    assert.notInclude(commands, 'run ws:fix:lint');
  });

  test('a change to a rule kit lints what loads a plugin built against it', () => {
    const commands = commandsOf(['libs/eslint-rule-demo/src/index.mts']);

    assert.deepStrictEqual(lints(commands), [
      'apps/lint-user: run fix:lint',
      'libs/eslint-plugin-demo: run fix:lint',
      'libs/eslint-rule-demo: run fix:lint',
    ]);

    assert.deepStrictEqual(
      commands
        .slice(0, at(commands, 'apps/lint-user: run fix:lint'))
        .filter((command) => command.endsWith('run build')),
      ['libs/eslint-rule-demo: run build'],
    );
  });

  test('what a changed plugin is built against is built first, when the diff changes that too', () => {
    const commands = commandsOf([
      'libs/eslint-plugin-demo/src/index.mts',
      'libs/lint-helper/src/index.mts',
    ]);

    assert.deepStrictEqual(
      commands
        .slice(0, at(commands, 'apps/lint-user: run fix:lint'))
        .filter((command) => command.endsWith('run build')),
      ['libs/lint-helper: run build', 'libs/eslint-plugin-demo: run build'],
    );
  });

  test('a changed plugin loading another changed one is linted after both are built', () => {
    const commands = commandsOf([
      'libs/eslint-plugin-demo/src/index.mts',
      'libs/eslint-rule-demo/src/index.mts',
    ]);

    assert.isAbove(
      at(commands, 'libs/eslint-plugin-demo: run fix:lint'),
      lastAt(commands, 'libs/eslint-rule-demo: run build'),
    );
  });

  test('what loads a plugin built against a changed rule kit through a member outside the toolchain is linted', () => {
    const members = [
      pkg('libs/eslint-rule-x', ['build', 'fix:lint'], { exportsBuild: true }),
      pkg('libs/helper', ['build'], {
        workspaceDependencies: ['eslint-rule-x'],
        buildDependencies: ['eslint-rule-x'],
        exportsBuild: true,
      }),
      pkg('libs/eslint-plugin-x', ['build', 'fix:lint'], {
        workspaceDependencies: ['helper'],
        buildDependencies: ['helper'],
        exportsBuild: true,
      }),
      pkg('apps/user', ['fix:lint'], {
        workspaceDependencies: ['eslint-plugin-x'],
        lintImports: ['eslint-plugin-x'],
      }),
      pkg('apps/other', ['fix:lint']),
    ] as const;

    assert.include(
      planCommands(members, ['libs/eslint-rule-x/src/index.mts']),
      'apps/user: run fix:lint',
    );
  });

  test.each([
    'libs/eslint-plugin-demo/test/rule.test.mts',
    'libs/eslint-plugin-demo/src/rule.test.mts',
    'libs/eslint-plugin-demo/configs/vitest.config.mts',
    'libs/eslint-plugin-demo/eslint.config.mts',
  ] as const)('%s lints its own package alone', (file) => {
    const commands = commandsOf([file]);

    assert.deepStrictEqual(lints(commands), [
      'libs/eslint-plugin-demo: run fix:lint',
    ]);

    assert.notInclude(commands, 'libs/eslint-plugin-demo: run build');
  });

  test.each([
    'libs/eslint-plugin-demo/package.json',
    'libs/eslint-plugin-demo/configs/tsconfig.build.json',
    'libs/eslint-plugin-demo/scripts/cmd/build.mts',
  ] as const)('%s, which its build reads, lints what loads it', (file) => {
    assert.include(commandsOf([file]), 'apps/lint-user: run fix:lint');
  });

  test('strict-lib, whose config loads it too, is linted', () => {
    assert.include(
      commandsOf(['libs/eslint-plugin-demo/src/index.mts']),
      'run strict-lib:check:lint',
    );

    assert.notInclude(
      commandsOf(['libs/lint-helper/src/index.mts']),
      'run strict-lib:check:lint',
    );
  });

  test('strict-lib is linted once when it changed too', () => {
    assert.lengthOf(
      commandsOf([
        'libs/eslint-plugin-demo/src/index.mts',
        'strict-lib/scripts-common/convert.mts',
      ]).filter((command) => command === 'run strict-lib:check:lint'),
      1,
    );
  });

  test('the root program, which loads it too, runs its own checks', () => {
    assert.isTrue(rootLint('libs/eslint-plugin-demo/src/index.mts'));

    assert.isFalse(rootLint('libs/eslint-plugin-demo/test/rule.test.mts'));
  });

  test('a changed package an unchanged plugin is built against is built before what loads the plugin is linted', () => {
    const commands = commandsOf([
      'libs/eslint-rule-demo/src/index.mts',
      'libs/lint-helper/src/index.mts',
    ]);

    assert.isBelow(
      at(commands, 'libs/lint-helper: run build'),
      at(commands, 'apps/lint-user: run fix:lint'),
    );
  });

  test('a toolchain package exporting its sources loads what it declares in devDependencies, an app does not', () => {
    const members = [
      pkg('libs/eslint-plugin-x', ['build', 'fix:lint'], {
        exportsBuild: true,
      }),
      // Exports its sources, so its imports run from wherever it declares them.
      pkg('languages/x/eslint-config', ['fix:lint'], {
        workspaceDependencies: ['eslint-plugin-x'],
        lintImports: ['eslint-plugin-x'],
      }),
      pkg('languages/x/user', ['fix:lint'], {
        workspaceDependencies: ['eslint-config'],
        lintImports: ['eslint-config'],
      }),
      // Declares the plugin to lint itself.
      pkg('apps/app-x', ['fix:lint'], {
        workspaceDependencies: ['eslint-plugin-x'],
        lintImports: ['eslint-plugin-x'],
      }),
      pkg('apps/app-x-user', ['fix:lint'], {
        workspaceDependencies: ['app-x'],
      }),
    ] as const;

    assert.deepStrictEqual(
      lints(planCommands(members, ['libs/eslint-plugin-x/src/index.mts'])),
      [
        'apps/app-x: run fix:lint',
        'languages/x/eslint-config: run fix:lint',
        'languages/x/user: run fix:lint',
        'libs/eslint-plugin-x: run fix:lint',
      ],
    );
  });

  test('a member exporting its sources is followed through what it declares in dependencies', () => {
    const members = [
      pkg('libs/eslint-rule-x', ['build', 'fix:lint'], { exportsBuild: true }),
      // As `@sumi-lang/oxlint-config` names `eslint-rule-forge`.
      pkg('languages/x/oxlint-config', ['fix:lint'], {
        workspaceDependencies: ['eslint-rule-x'],
        buildDependencies: ['eslint-rule-x'],
      }),
      pkg('languages/x/cli', ['fix:lint'], {
        workspaceDependencies: ['oxlint-config'],
        buildDependencies: ['oxlint-config'],
      }),
      pkg('libs/cli-user', ['fix:lint'], {
        workspaceDependencies: ['cli'],
        lintImports: ['cli'],
      }),
      // Names the rule kit in `devDependencies` alone, to lint itself.
      pkg('languages/x/tool', ['fix:lint'], {
        workspaceDependencies: ['eslint-rule-x'],
        lintImports: ['eslint-rule-x'],
      }),
      pkg('libs/tool-user', ['fix:lint'], {
        workspaceDependencies: ['tool'],
        lintImports: ['tool'],
      }),
    ] as const;

    const commands = planCommands(members, [
      'libs/eslint-rule-x/src/index.mts',
    ]);

    assert.include(commands, 'libs/cli-user: run fix:lint');

    assert.include(commands, 'languages/x/tool: run fix:lint');

    assert.notInclude(commands, 'libs/tool-user: run fix:lint');
  });

  test('a toolchain package check:forgotten-exports reads is built again after the lint, which can rewrite it', () => {
    const members = [
      pkg('libs/eslint-plugin-x', ['build', 'fix:lint'], {
        exportsBuild: true,
        forgottenExportsRead: true,
      }),
      pkg('apps/user', ['fix:lint'], {
        workspaceDependencies: ['eslint-plugin-x'],
        lintImports: ['eslint-plugin-x'],
      }),
    ] as const;

    const commands = planCommands(members, [
      'libs/eslint-plugin-x/src/index.mts',
    ]);

    const lint = lastAt(commands, 'libs/eslint-plugin-x: run fix:lint');

    assert.isBelow(at(commands, 'libs/eslint-plugin-x: run build'), lint);

    assert.isAbove(lastAt(commands, 'libs/eslint-plugin-x: run build'), lint);

    assert.isBelow(
      lastAt(commands, 'libs/eslint-plugin-x: run build'),
      at(commands, 'run check:forgotten-exports libs/eslint-plugin-x'),
    );
  });

  test('a toolchain package a read package is built against is built again after the lint, one none reaches only before it', () => {
    const members = [
      pkg('libs/eslint-rule-x', ['build', 'fix:lint'], { exportsBuild: true }),
      pkg('libs/eslint-plugin-y', ['build', 'fix:lint'], {
        exportsBuild: true,
      }),
      pkg('libs/reader', ['build', 'fix:lint'], {
        workspaceDependencies: ['eslint-rule-x'],
        buildDependencies: ['eslint-rule-x'],
        exportsBuild: true,
        forgottenExportsRead: true,
      }),
      pkg('apps/user', ['fix:lint'], {
        lintImports: ['eslint-rule-x', 'eslint-plugin-y'],
      }),
    ] as const;

    const commands = planCommands(members, [
      'libs/eslint-rule-x/src/index.mts',
      'libs/eslint-plugin-y/src/index.mts',
      'libs/reader/src/index.mts',
    ]);

    const builds = (name: string): number =>
      commands.filter((command) => command === `libs/${name}: run build`)
        .length;

    assert.strictEqual(builds('eslint-rule-x'), 2);

    assert.strictEqual(builds('eslint-plugin-y'), 1);
  });

  test('a document under src/ is not what it emits', () => {
    assert.notInclude(
      commandsOf([
        'libs/eslint-plugin-demo/test/rule.test.mts',
        'libs/eslint-plugin-demo/src/notes.md',
      ]),
      'apps/lint-user: run fix:lint',
    );
  });

  test('a change outside it lints the changed package alone', () => {
    assert.deepStrictEqual(
      lints(commandsOf(['libs/lint-helper/src/index.mts'])),
      ['libs/lint-helper: run fix:lint'],
    );
  });

  test('a document change to it lints nothing', () => {
    assert.deepStrictEqual(
      lints(commandsOf(['libs/eslint-plugin-demo/README.md'])),
      [],
    );
  });

  test('a changed package a source-exporting config runs with from devDependencies is built before the lint', () => {
    const members = [
      pkg('libs/helper', ['build', 'fix:lint'], { exportsBuild: true }),
      pkg('languages/x/eslint-config', ['fix:lint'], {
        workspaceDependencies: ['helper'],
      }),
      pkg('languages/x/user', ['fix:lint'], {
        lintImports: ['eslint-config'],
      }),
    ] as const;

    const commands = planCommands(members, [
      'libs/helper/src/index.mts',
      'languages/x/eslint-config/src/index.mts',
    ]);

    assert.isBelow(
      at(commands, 'libs/helper: run build'),
      at(commands, 'languages/x/user: run fix:lint'),
    );
  });

  test('a change behind a package a config imports, outside the toolchain, lints what imports it and runs the root checks', () => {
    const members = [
      // As `@sumi-lang/checker` under `@sumi-lang/cli`.
      pkg('languages/x/checker', ['fix:lint']),
      pkg('languages/x/cli', ['fix:lint'], {
        workspaceDependencies: ['checker'],
        buildDependencies: ['checker'],
      }),
      pkg('libs/cli-user', ['fix:lint'], { lintImports: ['cli'] }),
    ] as const;

    const commands = planCommands(members, [
      'languages/x/checker/src/index.mts',
    ]);

    assert.include(commands, 'libs/cli-user: run fix:lint');

    assert.isTrue(
      commands.some(
        (command) =>
          command.startsWith('exec run-p') &&
          command.includes('check:root:lint'),
      ),
    );
  });

  test('a changed package a config imports under another name lints what imports it, and is not followed further', () => {
    const members = [
      // Imported by a config, as `@sumi-lang/cli` or `ts-data-forge` is.
      pkg('libs/data-lib', ['build', 'fix:lint'], { exportsBuild: true }),
      pkg('libs/eslint-config-y', ['build', 'fix:lint'], {
        workspaceDependencies: ['data-lib'],
        buildDependencies: ['data-lib'],
        exportsBuild: true,
      }),
      pkg('apps/a', ['fix:lint'], { lintImports: ['data-lib'] }),
      pkg('apps/b', ['fix:lint'], { lintImports: ['eslint-config-y'] }),
    ] as const;

    const commands = planCommands(members, ['libs/data-lib/src/index.mts']);

    assert.deepStrictEqual(lints(commands), [
      'apps/a: run fix:lint',
      'libs/data-lib: run fix:lint',
    ]);

    assert.isBelow(
      at(commands, 'libs/data-lib: run build'),
      at(commands, 'apps/a: run fix:lint'),
    );
  });
});

/**
 * A member of a fixture whose facts are read from `manifest`, among the members
 * named `members`. One read by check:forgotten-exports is a target, so what it
 * reaches is built for it, as `x-on-private`'s dependency is.
 */
const manifestMember = (
  dir: string,
  manifest: ReadonlyRecord<string, unknown>,
  forgottenExportsRead: boolean,
  members: readonly string[],
): PackageInfo =>
  ({
    ...pkg(dir, ['build', 'check:types'], { forgottenExportsRead }),
    ...readManifestDependencies(
      { ...manifest, main: 'dist/index.mjs' },
      new Set<string>(members),
    ),
  }) as const;

/** A member of the peer-range fixture: the user is a target, the base is not. */
const peerMember = (
  dir: string,
  manifest: ReadonlyRecord<string, unknown>,
  forgottenExportsRead: boolean,
): PackageInfo =>
  manifestMember(dir, manifest, forgottenExportsRead, [
    'a-peer-user',
    'z-peer-base',
  ]);

describe('readManifestDependencies', () => {
  test('reads the workspace members of each field, and whether dist/ is exported', () => {
    const facts = readManifestDependencies(
      {
        dependencies: { a: 'workspace:^', external: '^1.0.0' },
        peerDependencies: { b: 'workspace:*', e: '>=8.0.0', f: '>=1.0.0' },
        devDependencies: { c: 'workspace:*', d: 'catalog:', e: 'workspace:*' },
        exports: {
          '.': { types: './dist/index.d.mts', default: './dist/index.mjs' },
        },
      },
      new Set<string>(['a', 'b', 'c', 'e']),
    );

    assert.deepStrictEqual(Array.from(facts.workspaceDependencies), [
      'a',
      'c',
      'e',
      'b',
    ]);

    // `e` too, a member peer by a semver range; not `f`, which is no member.
    assert.deepStrictEqual(Array.from(facts.buildDependencies), [
      'a',
      'b',
      'e',
    ]);

    // Names a run-time field gives whose installed range is `workspace:`: `e` a
    // plain peer a `workspace:` devDependency supplies; not `f`, a peer nothing
    // supplies, nor `external`.
    assert.deepStrictEqual(Array.from(facts.runtimeMembers).toSorted(), [
      'a',
      'b',
      'e',
    ]);

    assert.isTrue(facts.exportsBuild);
  });

  test('reads a member named by a semver range, as ws:build orders it', () => {
    const facts = readManifestDependencies(
      {
        peerDependencies: { synstate: '>=8.0.0', react: '>=18' },
        devDependencies: { synstate: 'workspace:*' },
      },
      new Set<string>(['synstate']),
    );

    assert.deepStrictEqual(Array.from(facts.buildDependencies), ['synstate']);
  });

  test('a member peer declared by a >= range is built first', () => {
    const commands = planCommands(
      [
        peerMember(
          'libs/a-peer-user',
          {
            peerDependencies: { 'z-peer-base': '>=1.0.0' },
            devDependencies: { 'z-peer-base': 'workspace:*' },
          },
          true,
        ),
        peerMember('libs/z-peer-base', {}, false),
      ],
      ['libs/a-peer-user/src/index.mts', 'libs/z-peer-base/src/index.mts'],
    );

    assert.deepStrictEqual(
      commands.filter((command) => command.endsWith('run build')),
      ['libs/z-peer-base: run build', 'libs/a-peer-user: run build'],
    );
  });

  // Why devDependencies are no build edge: PackageInfo.buildDependencies. The
  // base sorts first so that the walk reaches it first: counted as an edge, its
  // devDependency would take the walk to the hooks and build them first.
  test('a devDependency is no build edge, even where a dependency points back', () => {
    const members = ['a-cycle-base', 'z-cycle-hooks'] as const;

    const commands = planCommands(
      [
        manifestMember(
          'libs/a-cycle-base',
          { devDependencies: { 'z-cycle-hooks': 'workspace:*' } },
          true,
          members,
        ),
        manifestMember(
          'libs/z-cycle-hooks',
          { dependencies: { 'a-cycle-base': 'workspace:*' } },
          true,
          members,
        ),
      ],
      ['libs/a-cycle-base/src/index.mts', 'libs/z-cycle-hooks/src/index.mts'],
    );

    assert.deepStrictEqual(
      commands.filter((command) => command.endsWith('run build')),
      ['libs/a-cycle-base: run build', 'libs/z-cycle-hooks: run build'],
    );
  });

  test.each([
    [
      'a plain `dependencies` entry over a `workspace:` devDependency',
      {
        dependencies: { foo: '^1.0.0' },
        peerDependencies: { foo: '^1.0.0' },
        devDependencies: { foo: 'workspace:*' },
      },
      [],
    ],
    [
      'a plain `optionalDependencies` entry over a `workspace:` devDependency',
      {
        peerDependencies: { foo: '>=1' },
        devDependencies: { foo: 'workspace:*' },
        optionalDependencies: { foo: '^1' },
      },
      [],
    ],
    [
      'a plain devDependency over a `workspace:` peer',
      {
        peerDependencies: { foo: 'workspace:*' },
        devDependencies: { foo: '^1.0.0' },
      },
      [],
    ],
    [
      'a plain `dependencies` entry with a `workspace:` devDependency and no peer',
      {
        dependencies: { bar: '^1.0.0' },
        devDependencies: { bar: 'workspace:*' },
      },
      [],
    ],
    [
      'a `workspace:` optional dependency',
      { optionalDependencies: { opt: 'workspace:*' } },
      ['opt'],
    ],
    [
      'a `workspace:` optional dependency over a plain peer',
      {
        peerDependencies: { opt: '>=1' },
        optionalDependencies: { opt: 'workspace:*' },
      },
      ['opt'],
    ],
  ] as const)('runtimeMembers for %s', (_, manifest, expected) => {
    assert.deepStrictEqual(
      Array.from(
        readManifestDependencies(manifest, new Set<string>()).runtimeMembers,
      ).toSorted(),
      Array.from(expected),
    );
  });

  test.each([
    [{ exports: './src/index.mts' }, false],
    [{ main: 'dist/index.mjs' }, true],
    [{ bin: { x: './src/cmd/x.mts' } }, false],
    ['not a manifest', false],
  ] as const)('%j exports its build: %s', (manifest, expected) => {
    assert.strictEqual(
      readManifestDependencies(manifest, new Set<string>()).exportsBuild,
      expected,
    );
  });
});
