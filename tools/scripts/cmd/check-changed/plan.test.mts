import * as fs from 'node:fs';
import * as path from 'node:path';
import { isRecord, isString } from 'ts-data-forge';
import { projectRootPath } from '../../project-root-path.mjs';
import {
  buildPlan,
  classifyChanges,
  isSpellCheckedByCi,
  matchesGatePattern,
  parsePathsIgnore,
  type PackageInfo,
} from './plan.mjs';

const pkg = (dir: string, scripts: readonly string[]): PackageInfo =>
  ({
    name: dir.slice(dir.lastIndexOf('/') + 1),
    dir,
    scripts: new Set(scripts),
    isPrivate: false,
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

/** The gate list as the root package.json gives it. */
const proseGate = (() => {
  const manifest: unknown = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixed path in this repository.
    fs.readFileSync(path.join(projectRootPath, 'package.json'), 'utf8'),
  );

  const scripts =
    isRecord(manifest) && isRecord(manifest['scripts'])
      ? manifest['scripts']
      : ({} as const);

  const command = scripts['z:check-should-run:code-checks'];

  return parsePathsIgnore(isString(command) ? command : '');
})();

const classify = (files: readonly string[]) =>
  classifyChanges({ files, packages, proseGate });

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
    hasUntracked: false,
    spellChecked: files,
  });

const commandsOf = (files: readonly string[], coverage = true) =>
  plan(files, coverage).map(
    ({ cwd, args }) => `${cwd === '.' ? '' : `${cwd}: `}${args.join(' ')}`,
  );

describe('parsePathsIgnore and matchesGatePattern', () => {
  test('understand every pattern the code gate has', () => {
    assert.isNotEmpty(proseGate);

    for (const pattern of proseGate) {
      assert.doesNotThrow(() => matchesGatePattern('x', pattern));
    }
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
  ] as const)('%s is prose: %s', (file, expected) => {
    assert.strictEqual(
      proseGate.some((pattern) => matchesGatePattern(file, pattern)),
      expected,
    );
  });

  test('a pattern of an unknown shape throws rather than misfiling', () => {
    assert.throws(() => matchesGatePattern('a', 'src/**/*.ts'), /Unsupported/u);
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
      hasUntracked: false,
      spellChecked: ['.claude/settings.json', 'CLAUDE.md'],
    }).find(({ args }) => args.includes('cspell'));

    assert.deepStrictEqual(step?.args.slice(-1), ['./CLAUDE.md']);
  });
});

describe('classifyChanges', () => {
  test('a source file touches its package as code', () => {
    const result = classify(['libs/ts-data-forge/src/array.mts']);

    assert.deepStrictEqual(
      result.packages.map(({ pkg: { dir }, code }) => ({ dir, code })),
      [{ dir: 'libs/ts-data-forge', code: true }],
    );

    assert.deepStrictEqual(sortedAreas(result), ['codemod', 'root-guards']);
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

    assert.deepStrictEqual(sortedAreas(result), ['root-guards', 'strict-lib']);
  });

  test('experimental/ is ignored', () => {
    const result = classify(['experimental/old/a.ts']);

    assert.deepStrictEqual(result.ignored, ['experimental/old/a.ts']);

    assert.deepStrictEqual(sortedAreas(result), []);
  });

  test.each([
    ['tools/scripts/cmd/x.mts', ['codemod', 'root', 'root-guards']],
    [
      'tools/configs/vite-config.mts',
      ['codemod', 'root', 'root-guards', 'shared-config'],
    ],
    ['eslint.config.mts', ['codemod', 'root', 'root-guards']],
    ['tsconfig.json', ['root', 'root-guards']],
    [
      'libs/ts-data-forge/configs/vitest.config.mts',
      ['codemod', 'root', 'root-guards'],
    ],
    [
      'libs/ts-data-forge/eslint.config.mts',
      ['codemod', 'root', 'root-guards'],
    ],
    [
      'libs/ts-data-forge/samples/eslint.config.mts',
      ['codemod', 'root', 'root-guards'],
    ],
    ['.markdownlint-cli2.mjs', ['prose', 'root']],
    ['tools/scripts/cmd/check-changed/README.md', ['prose']],
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
});

describe('buildPlan', () => {
  test('a package source change: format, generate, fix, check, spell, format', () => {
    assert.deepStrictEqual(commandsOf(['libs/ts-data-forge/src/array.mts']), [
      'run z:format-diff-from abc123',
      'libs/ts-data-forge: run gen',
      'run z:ts-codemod --diff-from abc123',
      'libs/ts-data-forge: run fix:lint',
      'libs/ts-data-forge: run check:types',
      'libs/ts-data-forge: run check:test',
      'exec run-p --continue-on-error --print-label check:root:actionlint check:root:ci-commands',
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

    assert.notInclude(commands.join('\n'), 'z:ts-codemod');
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

    assert.include(commands, 'run check:knip');

    assert.include(commands, 'run check:published-deps');
  });

  test('the codemod runs over the untracked files too when there are any', () => {
    const steps = buildPlan({
      classification: classify(['tools/scripts/cmd/new.mts']),
      base: 'abc123',
      rootScripts,
      coverage: false,
      hasUntracked: true,
      spellChecked: [],
    });

    assert.deepStrictEqual(
      steps
        .filter(({ args }) => args.includes('z:ts-codemod'))
        .map(({ args }) => args.join(' ')),
      ['run z:ts-codemod --diff-from abc123', 'run z:ts-codemod --uncommitted'],
    );
  });

  test('generators are the only steps of kind generate', () => {
    assert.deepStrictEqual(
      plan(['libs/ts-data-forge/package.json'])
        .filter(({ kind }) => kind === 'generate')
        .map(({ title }) => title),
      ['ts-data-forge: gen', 'gen:deps-graph'],
    );
  });
});
