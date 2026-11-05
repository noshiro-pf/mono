import { projectRootPath } from '../../project-root-path.mjs';
import { matchesGatePattern, readGateList } from '../workflow-steps.mjs';
import {
  buildPlan,
  classifyChanges,
  isSpellCheckedByCi,
  readManifestDependencies,
  stepEnvironment,
  type PackageInfo,
} from './plan.mjs';

const pkg = (
  dir: string,
  scripts: readonly string[],
  {
    workspaceDependencies = [],
    buildDependencies = [],
    exportsBuild = false,
  }: Readonly<{
    workspaceDependencies?: readonly string[];
    buildDependencies?: readonly string[];
    exportsBuild?: boolean;
  }> = {},
): PackageInfo =>
  ({
    name: dir.slice(dir.lastIndexOf('/') + 1),
    dir,
    scripts: new Set(scripts),
    isPrivate: false,
    workspaceDependencies: new Set(workspaceDependencies),
    buildDependencies: new Set(buildDependencies),
    exportsBuild,
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
  }),
  pkg('libs/synstate-react-hooks', ['gen', 'build', 'check:types'], {
    workspaceDependencies: ['synstate'],
    exportsBuild: true,
  }),
  pkg('apps/synstate-docs', ['gen', 'check:types'], {
    workspaceDependencies: ['synstate', 'synstate-react-hooks'],
  }),
  pkg('apps/react-utils', ['gen', 'build', 'check:types']),
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
  pkg('libs/lonely', ['build', 'check:types'], { exportsBuild: true }),
  pkg('apps/no-gen', ['check:types'], {
    workspaceDependencies: ['synstate', 'lonely'],
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
    spellChecked: files,
  });

const commandsOf = (files: readonly string[], coverage = true) =>
  plan(files, coverage).map(
    ({ cwd, args }) => `${cwd === '.' ? '' : `${cwd}: `}${args.join(' ')}`,
  );

describe('the code gate, read through readGateList', () => {
  test('understand every pattern the code gate has', () => {
    assert.deepStrictEqual(
      proseGateResult.ok ? undefined : proseGateResult.message,
      undefined,
    );

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
    assert.throws(() => matchesGatePattern('a', 'src/*/x.ts'), /Unsupported/u);
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
      result.packages.map(({ pkg: { dir }, code }) => ({ dir, code })),
      [{ dir: 'libs/ts-data-forge', code: true }],
    );

    assert.deepStrictEqual(sortedAreas(result), ['root-guards']);
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
    ['tools/scripts/cmd/x.mts', ['root', 'root-guards']],
    ['tools/configs/vite-config.mts', ['root', 'root-guards', 'shared-config']],
    ['eslint.config.mts', ['root', 'root-guards']],
    ['tsconfig.json', ['root', 'root-guards']],
    ['libs/ts-data-forge/configs/vitest.config.mts', ['root', 'root-guards']],
    ['libs/ts-data-forge/eslint.config.mts', ['root', 'root-guards']],
    ['libs/ts-data-forge/samples/eslint.config.mts', ['root', 'root-guards']],
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
      'run gen:verify-npm-packages',
      'run fix:codemod:affected',
      'run z:format-diff-from abc123',
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

  test('a package with no dependent generator is not built', () => {
    assert.notInclude(
      commandsOf(['libs/lonely/src/index.mts']).join('\n'),
      'run build',
    );
  });

  test('the builds run in dependency order, not directory order', () => {
    assert.deepStrictEqual(
      commandsOf([
        'libs/a-leaf-user/src/index.mts',
        'libs/leaf/src/index.mts',
      ]).filter((command) => command.endsWith('run build')),
      ['libs/leaf: run build', 'libs/a-leaf-user: run build'],
    );
  });

  test('a document change runs no dependent generator', () => {
    const commands = commandsOf(['libs/synstate/README.md']);

    assert.notInclude(commands, 'libs/synstate: run build');

    assert.notInclude(commands, 'apps/synstate-docs: run gen');
  });

  test('prose alone does not regenerate them', () => {
    assert.notInclude(
      commandsOf(['verify-npm-packages/README.md']),
      'run gen:verify-npm-packages',
    );
  });
});

describe('readManifestDependencies', () => {
  test('reads the workspace members of each field, and whether dist/ is exported', () => {
    const facts = readManifestDependencies({
      dependencies: { a: 'workspace:^', external: '^1.0.0' },
      peerDependencies: { b: 'workspace:*' },
      devDependencies: { c: 'workspace:*', d: 'catalog:' },
      exports: {
        '.': { types: './dist/index.d.mts', default: './dist/index.mjs' },
      },
    });

    assert.deepStrictEqual(Array.from(facts.workspaceDependencies), [
      'a',
      'c',
      'b',
    ]);

    assert.deepStrictEqual(Array.from(facts.buildDependencies), ['a', 'b']);

    assert.isTrue(facts.exportsBuild);
  });

  test.each([
    [{ exports: './src/index.mts' }, false],
    [{ main: 'dist/index.mjs' }, true],
    [{ bin: { x: './src/cmd/x.mts' } }, false],
    ['not a manifest', false],
  ] as const)('%j exports its build: %s', (manifest, expected) => {
    assert.strictEqual(
      readManifestDependencies(manifest).exportsBuild,
      expected,
    );
  });
});
