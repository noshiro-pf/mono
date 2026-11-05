import { Arr, isRecord, isString } from 'ts-data-forge';
import type { ReadonlyRecord, StrictPick } from 'ts-type-forge';
import { entryPointTargets } from '../assert-deps-built.mjs';
// The gate's own matcher, so that what check-changed calls prose is what CI
// skips. It lives in the gate's script rather than tools/scripts/lib/ because
// that script runs under plain `node`, which resolves an import by the name
// written, and the imports here name `.mjs` files that only tsx maps to `.mts`
// (assert-deps-built.mts above is shared the same way, for the same reason).
import { matchesGatePattern } from '../workflow-steps.mjs';
/**
 * Which commands a set of changed paths needs: the pure half of
 * `check-changed`, which `main.mts` feeds with what git and the manifests say.
 */

/**
 * Sorts the changed paths into the packages they belong to and the
 * repository-wide areas they touch.
 *
 * A path belongs to the workspace member whose directory is its longest prefix.
 * Under a package, a path the code gate ignores (`proseGate`, the `code` list
 * of `tools/configs/gate-ignore-lists.json` that `code-check.yml` gates on)
 * touches the package's documents only: its generators run, its type check and
 * tests do not, as CI's would not. `strict-lib/` is one area whatever member a
 * path is in, because its harnesses are checked by the root `strict-lib:*`
 * scripts rather than their own; `experimental/` is outside everything.
 */
export const classifyChanges = ({
  files,
  packages,
  proseGate,
}: Readonly<{
  /** Repository-relative, `/`-separated. */
  files: readonly string[];
  packages: readonly PackageInfo[];
  proseGate: readonly string[];
}>): Classification => {
  const mut_touched = new Map<string, { pkg: PackageInfo; code: boolean }>();

  const mut_areas = new Set<Area>();

  const mut_ignored: string[] = [];

  const byDepth = packages.toSorted((a, b) => b.dir.length - a.dir.length);

  for (const file of files) {
    if (file.startsWith('experimental/')) {
      mut_ignored.push(file);

      continue;
    }

    const prose = proseGate.some((pattern) =>
      matchesGatePattern(file, pattern),
    );

    // CI runs `check:root` on every diff its code gate lets through, and the
    // guards in it read package files too (`check:root:example-coverage` reads
    // `src/`, `check:root:tsconfig-paths` every tsconfig), so any such change
    // asks for them. The root program's own type check, lint and tests are
    // slower and read only what the root `tsconfig.json` takes in.
    if (!prose) {
      mut_areas.add('root-guards');
    }

    // `.markdownlint-cli2.mjs` is the one file the gate counts as prose that
    // the root program also type-checks.
    if (
      isRootProgramFile(file) &&
      (!prose || file === '.markdownlint-cli2.mjs')
    ) {
      mut_areas.add('root');
    }

    // A config that decides other files' verdicts asks for the whole check.
    if (SPELL_CONFIG.test(file)) {
      mut_areas.add('spell-config');
    }

    if (FORMAT_CONFIG.has(file)) {
      mut_areas.add('format-config');
    }

    if (MANIFEST_FILES.has(basename(file))) {
      mut_areas.add('manifest');
    }

    if (readsGeneratorInput(file, ROOT_GENERATORS['gen:deps-graph'].inputs)) {
      mut_areas.add('deps-graph');
    }

    if (
      readsGeneratorInput(file, ROOT_GENERATORS['gen:license-files'].inputs) ||
      basename(file) === 'LICENSE'
    ) {
      mut_areas.add('license');
    }

    // Only its tooling's checks: the generators rewrite thousands of files and
    // are `strict-lib-gen.yml`'s, as they are not `check-all`'s either.
    if (file.startsWith('strict-lib/')) {
      mut_areas.add('strict-lib');

      continue;
    }

    if (prose) {
      mut_areas.add('prose');
    }

    if (file.startsWith('tools/configs/')) {
      mut_areas.add('shared-config');
    }

    if (file.startsWith('.changeset/')) {
      mut_areas.add('changeset');

      continue;
    }

    if (file.startsWith('repo-settings/')) {
      mut_areas.add('repo-settings');

      continue;
    }

    const pkg = byDepth.find(({ dir }) => file.startsWith(`${dir}/`));

    if (pkg === undefined) {
      continue;
    }

    const entry = mut_touched.get(pkg.dir) ?? { pkg, code: false };

    mut_touched.set(pkg.dir, { pkg, code: entry.code || !prose });
  }

  const codeChanged: ReadonlySet<string> = new Set<string>(
    Array.from(mut_touched.values())
      .filter(({ code }) => code)
      .map(({ pkg }) => pkg.name),
  );

  return {
    packages: Array.from(mut_touched.values()).toSorted((a, b) =>
      a.pkg.dir.localeCompare(b.pkg.dir),
    ),
    dependents: packages
      .filter((pkg) =>
        Array.from(pkg.workspaceDependencies).some(
          (name) => name !== pkg.name && codeChanged.has(name),
        ),
      )
      .toSorted((a, b) => a.dir.localeCompare(b.dir)),
    areas: mut_areas,
    ignored: mut_ignored,
  };
};

/**
 * The commands for a {@link Classification}, in the order they run.
 *
 * - **Format first**, so that what the generators' own `fix:fmt` would do to
 *   a hand-edited file is not later blamed on the generator.
 * - **Generators next**, one package at a time; `main.mts` fails the run when
 *   one changes the tree, naming the generator and the files. After those of
 *   the touched packages, those of every member that declares one whose code
 *   changed, which is built first when they read its `dist/`.
 * - **Then the fixers**: the codemod, the formatter over what it reprinted,
 *   and `fix:lint` over the result; then the checks, and the formatter once
 *   more for what the fixers wrote (`fix:fmt:full` instead when Prettier's own
 *   config changed).
 *
 * The codemod is in the plan because no lint rule stands behind it:
 * `prefer-as-const` rewrites `as 'foo'` and says nothing about an `as const`
 * that is missing, so `code-check (fix:codemod:affected)` is otherwise the
 * first thing to mention it.
 *
 * What CI runs that no plan does is `CI_ONLY` in `reach.mts`, and
 * `check:root:check-changed-reach` fails on anything else CI runs that no plan
 * reaches.
 */
export const buildPlan = ({
  classification,
  base,
  rootScripts,
  coverage,
  spellChecked,
}: Readonly<{
  classification: Classification;
  /** The commit the diff is taken from (a merge base). */
  base: string;
  rootScripts: readonly string[];
  coverage: boolean;
  /** The changed files that still exist and are not ignored, for cspell. */
  spellChecked: readonly string[];
}>): readonly Step[] => {
  const { packages, dependents, areas } = classification;

  const code = packages.filter(({ code: isCode }) => isCode);

  const dependentGenerators = dependents.filter(({ scripts }) =>
    scripts.has('gen'),
  );

  return [
    formatStep('format the diff (before)', base),

    ...packages.flatMap(({ pkg }) => packageStep(pkg, 'generate', 'gen')),

    // A generator can read a package it declares: the docs measure its bundle
    // and embed its JSDoc, the hooks packages re-export what it exports. Those
    // that read its build output read it rebuilt, and a dependent the diff
    // touches runs its generator again for that reason.
    ...inBuildOrder(
      code
        .map(({ pkg }) => pkg)
        .filter(
          (pkg) =>
            pkg.exportsBuild &&
            dependentGenerators.some(({ workspaceDependencies }) =>
              workspaceDependencies.has(pkg.name),
            ),
        ),
    ).flatMap((pkg) => packageStep(pkg, 'build', 'build')),

    ...dependentGenerators.map(
      (pkg) =>
        ({
          title: `${pkg.name}: gen (declares ${code
            .map(({ pkg: { name } }) => name)
            .filter((name) => pkg.workspaceDependencies.has(name))
            .join(', ')})`,
          kind: 'generate',
          cwd: pkg.dir,
          args: ['run', 'gen'],
        }) as const,
    ),

    ...(areas.has('manifest') || areas.has('deps-graph')
      ? [rootStep('generate', 'gen:deps-graph')]
      : []),

    // Every published package's LICENSE is written from the license its
    // manifest declares, which `style-check.yml` regenerates and then asserts a
    // clean tree on.
    ...(areas.has('manifest') || areas.has('license')
      ? [rootStep('generate', 'gen:license-files')]
      : []),

    // Its committed `local/` copies are written from `smoke/`, the manifests,
    // the generator and the libraries it calls, which no list here would keep
    // up with; it only writes files, so it runs for any change that is not
    // prose alone. CI's dirty-tree check finds them stale otherwise, naming no
    // generator.
    ...(areas.has('root-guards')
      ? [rootStep('generate', 'gen:verify-npm-packages')]
      : []),

    // The codemod before the lint, so that what it rewrites is linted too, and
    // as CI runs it: `fix:codemod:affected` runs it over the diff from
    // `CODEMOD_DIFF_BASE` (which `main.mts` sets to the base), the untracked
    // files included, or over everything when what decides its output changed
    // (the lockfile, a script naming its transformers), which need not be
    // TypeScript.
    ...(areas.has('root-guards')
      ? [
          rootStep('fix', 'fix:codemod:affected'),
          // The codemod parenthesizes what it reprints and leaves the formatter
          // to take the parentheses off, and a lint rule can judge them
          // meanwhile: oxlint's `no-invalid-void-type` rejects
          // `() => (Promise<void> | void)`, on a line nobody changed (#2998).
          // CI lints only the formatted tree. `fix:codemod:affected` formats
          // once it is done, but not when the codemod fails; the root checks'
          // `eslint --fix` lints too, so this runs whether or not a package has
          // a `fix:lint`.
          formatStep('format what the codemod reprinted', base),
        ]
      : []),

    ...code.flatMap(({ pkg }) => packageStep(pkg, 'fix', 'fix:lint')),

    ...code.flatMap(({ pkg }) => [
      ...packageStep(pkg, 'check', 'check:types'),
      // `check:test` with coverage turned on rather than `check:test:cov`,
      // which in some packages runs the browser project as well. A
      // `check:test:cov` is what says the package's Vitest has coverage set up,
      // and that its `check:test` ends in `vitest`.
      ...packageStep(
        pkg,
        'check',
        'check:test',
        coverage && pkg.scripts.has('check:test:cov')
          ? { coverage: { packageDir: pkg.dir } }
          : {},
      ),
      ...packageStep(pkg, 'check', 'check:sumi'),
    ]),

    // Every file in a package counts, a document included: CI runs it in
    // `style-check.yml`, whose gate drops nothing but `experimental/`.
    ...packages.flatMap(({ pkg }) => packageStep(pkg, 'check', 'check:ext')),

    ...rootSteps({ areas, rootScripts, coverage }),

    ...(areas.has('strict-lib')
      ? [
          rootStep('check', 'strict-lib:check:types'),
          rootStep('check', 'strict-lib:check:lint'),
          rootStep('fix', 'strict-lib:fix:fmt'),
        ]
      : []),

    ...(areas.has('manifest')
      ? [
          rootStep('check', 'check:knip'),
          rootStep('check', 'check:published-deps'),
        ]
      : []),

    ...(areas.has('prose') ? [rootStep('check', 'check:md')] : []),

    // Buildless and quick, and some of its guards read code too
    // (`check:prose:dependent-releases` reads `src/` for re-exports).
    rootStep('check', 'check:prose'),

    // `check:cspell` reads the whole repository; the changed files are what can
    // have changed its verdict. Given paths, cspell still finds each file's
    // nearest `cspell.config.yaml`.
    ...(areas.has('spell-config')
      ? [rootStep('check', 'check:cspell')]
      : spellChecked.some(isSpellCheckedByCi)
        ? [
            {
              title: 'cspell over the changed files',
              kind: 'check',
              cwd: '.',
              narrows: 'check:cspell',
              args: [
                'exec',
                'cspell',
                '--no-progress',
                '--no-must-find-files',
                '--gitignore',
                ...spellChecked
                  .filter(isSpellCheckedByCi)
                  .map((file) => `./${file}`),
              ],
            } as const,
          ]
        : []),

    ...(areas.has('changeset') && !areas.has('spell-config')
      ? [rootStep('check', 'check:cspell:changeset')]
      : []),

    areas.has('format-config')
      ? rootStep('fix', 'fix:fmt:full')
      : formatStep('format the diff (after)', base),
  ];
};

/**
 * What every step runs with.
 *
 * - `CI=true`, as GitHub Actions sets it, since some tools read it:
 *   typescript-estree then parses a linted file from disk rather than the text
 *   it was given, and Vitest refuses `.only`. A test can pass without it and
 *   fail in CI.
 * - The base, so that what reads a diff reads this one: the codemod
 *   (`fix:codemod:affected`) and the `check:prose` guards (`resolveDiffBase`)
 *   otherwise fall back to the merge base with origin/main, which on a stacked
 *   branch takes in the layer below.
 */
export const stepEnvironment = (base: string): ReadonlyRecord<string, string> =>
  ({
    CI: 'true',
    CODEMOD_DIFF_BASE: base,
    PROSE_DIFF_BASE: base,
  }) as const;

/**
 * Whether `check:cspell` reads a path: its glob takes in everything but
 * dot-directories and dotfiles, `.github/` excepted. A changeset is
 * `check:cspell:changeset`'s, under the config of the package it names, and
 * would be judged under the wrong one here.
 */
export const isSpellCheckedByCi = (file: string): boolean =>
  file.startsWith('.github/') ||
  file.split('/').every((segment) => !segment.startsWith('.'));

export type PackageInfo = Readonly<{
  name: string;
  /** Repository-relative, `/`-separated, no trailing slash. */
  dir: string;
  scripts: ReadonlySet<string>;
  /** `"private": true` in its manifest. */
  isPrivate: boolean;
  /**
   * The workspace members its manifest names in `dependencies`,
   * `devDependencies` or `peerDependencies`.
   */
  workspaceDependencies: ReadonlySet<string>;
  /**
   * The workspace members in `dependencies` and `peerDependencies` alone, the
   * fields `ws:build` orders its stages by.
   */
  buildDependencies: ReadonlySet<string>;
  /** Whether an import of it resolves to its build output (`dist/`). */
  exportsBuild: boolean;
}>;

/**
 * What {@link PackageInfo} reads from a manifest's dependency fields and entry
 * points. A range counts when it is `workspace:`, the only way a member names
 * another.
 */
export const readManifestDependencies = (
  manifest: unknown,
): StrictPick<
  PackageInfo,
  'workspaceDependencies' | 'buildDependencies' | 'exportsBuild'
> => {
  const membersIn = (fields: readonly string[]): ReadonlySet<string> =>
    new Set(
      isRecord(manifest)
        ? fields.flatMap((field) => {
            const ranges = manifest[field];

            return isRecord(ranges)
              ? Object.entries(ranges)
                  .filter(
                    ([, range]) =>
                      isString(range) && range.startsWith('workspace:'),
                  )
                  .map(([name]) => name)
              : [];
          })
        : [],
    );

  return {
    workspaceDependencies: membersIn([
      'dependencies',
      'devDependencies',
      'peerDependencies',
    ]),
    buildDependencies: membersIn(['dependencies', 'peerDependencies']),
    exportsBuild: entryPointTargets(manifest).some((target) =>
      BUILD_OUTPUT.test(target),
    ),
  };
};

/**
 * The root generators a change to what they read runs: each with its entry
 * file, and the files and directories (ending in `/`) its output depends on —
 * the generator, what it writes (so a hand edit is put back), and the library
 * code it calls (#3336). `generator-inputs.test.mts` holds `inputs` to the
 * import graph of `entry`.
 */
export const ROOT_GENERATORS = {
  'gen:deps-graph': {
    entry: 'tools/scripts/cmd/gen-dependency-graph.mts',
    inputs: [
      'tools/scripts/cmd/gen-dependency-graph.mts',
      'docs/package-dependencies.md',
      'tools/scripts/project-root-path.mts',
      'libs/ts-repo-utils/src/functions/workspace-utils/',
      'libs/ts-repo-utils/src/functions/assert-path-exists.mts',
      'libs/ts-repo-utils/src/functions/diff.mts',
      'libs/ts-repo-utils/src/functions/exec-async.mts',
      'libs/ts-repo-utils/src/functions/format.mts',
      'libs/ts-repo-utils/src/functions/glob.mts',
      'libs/ts-repo-utils/src/functions/is-directly-executed.mts',
    ],
  },
  'gen:license-files': {
    entry: 'tools/scripts/cmd/gen-license-files.mts',
    inputs: [
      'tools/scripts/cmd/gen-license-files.mts',
      'tools/scripts/project-root-path.mts',
      'libs/ts-repo-utils/src/functions/is-directly-executed.mts',
    ],
  },
} as const satisfies ReadonlyRecord<
  string,
  Readonly<{ entry: string; inputs: readonly string[] }>
>;

/** Whether `file` is one of `inputs`, or under one ending in `/`. */
export const readsGeneratorInput = (
  file: string,
  inputs: readonly string[],
): boolean =>
  inputs.some((input) =>
    input.endsWith('/') ? file.startsWith(input) : file === input,
  );

/**
 * What a change touches beyond its package. `root` asks for every
 * `check:root:*` (tools/ and the root configuration); `root-guards` for the
 * guards alone, without the root program's own type check, lint and tests.
 * `root-guards` is any change that is not prose alone, and
 * `gen:verify-npm-packages` runs on it for that reason: narrowing it to what
 * the guards read would leave that generator's copies stale. `license` is a
 * `LICENSE` or what `gen:license-files` reads ({@link ROOT_GENERATORS});
 * `gen:license-files` runs on it and on `manifest`, whose `license` and
 * `private` fields decide what it writes. `deps-graph` is what `gen:deps-graph`
 * reads, the document it writes included, which it otherwise regenerates only
 * for a `manifest`.
 */
export const AREAS = [
  'root',
  'root-guards',
  'prose',
  'manifest',
  'license',
  'deps-graph',
  'strict-lib',
  'changeset',
  'repo-settings',
  'shared-config',
  'spell-config',
  'format-config',
] as const;

export type Area = (typeof AREAS)[number];

export type Classification = Readonly<{
  packages: readonly Readonly<{ pkg: PackageInfo; code: boolean }>[];
  /**
   * The members that declare a package whose code changed, touched by the diff
   * or not.
   */
  dependents: readonly PackageInfo[];
  areas: ReadonlySet<Area>;
  ignored: readonly string[];
}>;

export type StepKind = 'format' | 'generate' | 'build' | 'fix' | 'check';

export type Step = Readonly<{
  title: string;
  kind: StepKind;
  /** Repository-relative directory to run `pnpm` in. */
  cwd: string;
  /** Arguments to `pnpm`. */
  args: readonly string[];
  /**
   * Present on a test step whose coverage is read afterwards; `main.mts`
   * appends the reporter options, which `pnpm run` hands to the script's last
   * command, `vitest`.
   */
  coverage?: Readonly<{ packageDir: string }>;
  /**
   * The root script CI runs over everything that this step runs over the diff
   * alone, for `check-changed-gap.mts` to tell the two apart.
   */
  narrows?: string;
}>;

const rootStep = (kind: StepKind, script: string): Step =>
  ({
    title: script,
    kind,
    cwd: '.',
    args: ['run', script],
  }) as const;

/**
 * The `check:root:*` scripts the areas need: all of them for `root`, all but
 * the root program's own for `root-guards`. They run in parallel, as
 * `check:root` runs them, but through `run-p --continue-on-error`: `pnpm run
 * '/regex/'` kills the rest when one fails, which leaves the others' verdicts
 * unknown. `check:root:test` runs on its own so that its coverage can be read.
 */
const rootSteps = ({
  areas,
  rootScripts,
  coverage,
}: Readonly<{
  areas: ReadonlySet<Area>;
  rootScripts: readonly string[];
  coverage: boolean;
}>): readonly Step[] => {
  if (!areas.has('root') && !areas.has('root-guards')) {
    return [];
  }

  const scripts = rootScripts
    .filter(
      (script) =>
        ROOT_CHECK.test(script) &&
        (areas.has('root') || !ROOT_PROGRAM_CHECKS.has(script)),
    )
    .toSorted();

  const parallel = scripts.filter((script) => script !== 'check:root:test');

  return [
    ...(Arr.isNonEmpty(parallel)
      ? [
          {
            title: `check:root (${parallel.length} scripts in parallel)`,
            kind: 'check',
            cwd: '.',
            args: [
              'exec',
              'run-p',
              '--continue-on-error',
              '--print-label',
              ...parallel,
            ],
          } as const,
        ]
      : []),
    ...(scripts.includes('check:root:test')
      ? [
          {
            ...rootStep('check', 'check:root:test'),
            ...(coverage ? { coverage: { packageDir: '.' } } : {}),
          },
        ]
      : []),
  ];
};

const formatStep = (title: string, base: string): Step =>
  ({
    title,
    kind: 'format',
    cwd: '.',
    args: ['run', 'z:format-diff-from', base],
    narrows: 'fix:fmt:full',
  }) as const;

const packageStep = (
  pkg: PackageInfo,
  kind: StepKind,
  script: string,
  extra: Readonly<{ coverage?: Step['coverage'] }> = {},
): readonly Step[] =>
  pkg.scripts.has(script)
    ? ([
        {
          title: `${pkg.name}: ${script}`,
          kind,
          cwd: pkg.dir,
          args: ['run', script],
          ...extra,
        },
      ] as const)
    : ([] as const);

/**
 * The packages in an order `ws:build` could build them in: each after those of
 * them it names in `dependencies` or `peerDependencies`, ties in the order
 * given.
 */
const inBuildOrder = (pkgs: readonly PackageInfo[]): readonly PackageInfo[] => {
  const mut_ordered: PackageInfo[] = [];

  const mut_visited = new Set<string>();

  const visit = (pkg: PackageInfo): void => {
    if (mut_visited.has(pkg.name)) {
      return;
    }

    mut_visited.add(pkg.name);

    for (const dependency of pkgs) {
      if (pkg.buildDependencies.has(dependency.name)) {
        visit(dependency);
      }
    }

    mut_ordered.push(pkg);
  };

  for (const pkg of pkgs) {
    visit(pkg);
  }

  return mut_ordered;
};

const basename = (file: string): string =>
  file.slice(file.lastIndexOf('/') + 1);

const ROOT_CHECK = /^check:root:[^:]+$/u;

/**
 * The root program's own checks: what the root `tsconfig.json` includes
 * (tools/, and every package's `configs/` and `eslint.config.mts`), type
 * checked, linted and tested. The slow part of `check:root`, and pointless for
 * a change none of those files see.
 */
const ROOT_PROGRAM_CHECKS: ReadonlySet<string> = new Set<string>([
  'check:root:types',
  'check:root:lint',
  'check:root:test',
]);

/**
 * Whether the root program reads a path: tools/, the root configuration, and
 * what the root `tsconfig.json` includes from anywhere (`configs/`,
 * `eslint.config*.mts`, `vite.config.mts`, `.markdownlint-cli2.mjs`). Taking in
 * too much costs a slower run; too little, a type error CI finds first.
 */
const isRootProgramFile = (file: string): boolean => {
  const name = basename(file);

  return (
    file.startsWith('tools/') ||
    file === '.markdownlint-cli2.mjs' ||
    (!file.includes('/') &&
      (name.endsWith('.json') || name.endsWith('.mts'))) ||
    name === 'vite.config.mts' ||
    (name.startsWith('eslint.config') && name.endsWith('.mts')) ||
    (CONFIGS_SEGMENT.test(file) && TYPESCRIPT_FILE.test(file))
  );
};

/** The cspell configs, root and per package (`check:cspell` reads both). */
const SPELL_CONFIG = /(?:^|\/)\.?cspell\.config\.yaml$/u;

/** Prettier's own config: a change reformats files the diff never touched. */
const FORMAT_CONFIG: ReadonlySet<string> = new Set<string>([
  '.prettierrc',
  '.prettierignore',
]);

const CONFIGS_SEGMENT = /(?:^|\/)configs\//u;

const TYPESCRIPT_FILE = /\.(?:ts|mts|tsx)$/u;

const MANIFEST_FILES: ReadonlySet<string> = new Set<string>([
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
]);

const BUILD_OUTPUT = /^(?:\.\/)?dist\//u;
