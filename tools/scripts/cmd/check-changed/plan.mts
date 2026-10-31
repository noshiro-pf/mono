import { Arr } from 'ts-data-forge';
/**
 * Which commands a set of changed paths needs: the pure half of
 * `check-changed`, which `main.mts` feeds with what git and the manifests say.
 */

/**
 * Sorts the changed paths into the packages they belong to and the
 * repository-wide areas they touch.
 *
 * A path belongs to the workspace member whose directory is its longest prefix.
 * Under a package, a path the code gate ignores (`proseGate`, the patterns
 * `z:check-should-run:code-checks` gives `code-check.yml`) touches the
 * package's documents only: its generators run, its type check and tests do
 * not, as CI's would not. `strict-lib/` is one area whatever member a path is
 * in, because its harnesses are checked by the root `strict-lib:*` scripts
 * rather than their own; `experimental/` is outside everything.
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

    // Only its tooling's checks: the generators rewrite thousands of files and
    // are `strict-lib-gen.yml`'s, as they are not `check-all`'s either.
    if (file.startsWith('strict-lib/')) {
      mut_areas.add('strict-lib');

      continue;
    }

    if (prose) {
      mut_areas.add('prose');
    }

    if (TYPESCRIPT_FILE.test(file)) {
      mut_areas.add('codemod');
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

  return {
    packages: Array.from(mut_touched.values()).toSorted((a, b) =>
      a.pkg.dir.localeCompare(b.pkg.dir),
    ),
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
 *   one changes the tree, naming the generator and the files.
 * - **Then the fixers** (the codemod, then `fix:lint` over what it wrote),
 *   then the checks, and the formatter once more for what the fixers wrote
 *   (`fix:fmt:full` instead when Prettier's own config changed).
 *
 * The codemod is in the plan for any TypeScript change because no lint rule
 * stands behind it: `prefer-as-const` rewrites `as 'foo'` and says nothing
 * about an `as const` that is missing, so `code-check (fix:codemod:full)` is
 * otherwise the first thing to mention it. It runs twice, once over the diff
 * from the base and once over the uncommitted files, because `--diff-from`
 * reads `git diff`, which leaves out untracked files.
 */
export const buildPlan = ({
  classification,
  base,
  rootScripts,
  coverage,
  hasUntracked,
  spellChecked,
}: Readonly<{
  classification: Classification;
  /** The commit the diff is taken from (a merge base). */
  base: string;
  rootScripts: readonly string[];
  coverage: boolean;
  hasUntracked: boolean;
  /** The changed files that still exist and are not ignored, for cspell. */
  spellChecked: readonly string[];
}>): readonly Step[] => {
  const { packages, areas } = classification;

  const code = packages.filter(({ code: isCode }) => isCode);

  return [
    formatStep('format the diff (before)', base),

    ...packages.flatMap(({ pkg }) => packageStep(pkg, 'generate', 'gen')),

    ...(areas.has('manifest') ? [rootStep('generate', 'gen:deps-graph')] : []),

    // The codemod before the lint, so that what it rewrites is linted too.
    ...(areas.has('codemod')
      ? Arr.toUnshifted({
          title: 'codemod over the diff',
          kind: 'fix',
          cwd: '.',
          args: ['run', 'z:ts-codemod', '--diff-from', base],
        } as const)(
          hasUntracked
            ? [
                {
                  title: 'codemod over the uncommitted files',
                  kind: 'fix',
                  cwd: '.',
                  args: ['run', 'z:ts-codemod', '--uncommitted'],
                } as const,
              ]
            : [],
        )
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
 * Whether a path matches one of the code gate's `--paths-ignore` patterns, in
 * the shapes that list uses: `dir/` (a directory prefix), `**.ext` (any file
 * with that extension, as micromatch reads it), `** /name` (that file name in
 * any directory, the root included) and a plain path.
 *
 * Any other shape throws, so that a pattern added to the gate and not
 * understood here is a loud failure rather than a quiet misfiling.
 */
export const matchesGatePattern = (file: string, pattern: string): boolean => {
  if (pattern.endsWith('/')) {
    return file.startsWith(pattern);
  }

  if (pattern.startsWith('**.')) {
    return file.endsWith(assertLiteral(pattern.slice('**'.length), pattern));
  }

  if (pattern.startsWith('**/')) {
    return (
      basename(file) === assertLiteral(pattern.slice('**/'.length), pattern)
    );
  }

  return file === assertLiteral(pattern, pattern);
};

/**
 * Whether `check:cspell` reads a path: its glob takes in everything but
 * dot-directories and dotfiles, `.github/` excepted. A changeset is
 * `check:cspell:changeset`'s, under the config of the package it names, and
 * would be judged under the wrong one here.
 */
export const isSpellCheckedByCi = (file: string): boolean =>
  file.startsWith('.github/') ||
  file.split('/').every((segment) => !segment.startsWith('.'));

/**
 * The `--paths-ignore` values of a `z:check-should-run:*` script, read from its
 * command line so that the list is the gate's own.
 */
export const parsePathsIgnore = (command: string): readonly string[] =>
  Array.from(command.matchAll(PATHS_IGNORE), (match) => match[1] ?? '');

export type PackageInfo = Readonly<{
  name: string;
  /** Repository-relative, `/`-separated, no trailing slash. */
  dir: string;
  scripts: ReadonlySet<string>;
  /** `"private": true` in its manifest. */
  isPrivate: boolean;
}>;

/**
 * What a change touches beyond its package. `root` asks for every
 * `check:root:*` (tools/ and the root configuration); `root-guards` for the
 * guards alone, without the root program's own type check, lint and tests.
 */
export type Area =
  | 'root'
  | 'root-guards'
  | 'prose'
  | 'manifest'
  | 'codemod'
  | 'strict-lib'
  | 'changeset'
  | 'repo-settings'
  | 'shared-config'
  | 'spell-config'
  | 'format-config';

export type Classification = Readonly<{
  packages: readonly Readonly<{ pkg: PackageInfo; code: boolean }>[];
  areas: ReadonlySet<Area>;
  ignored: readonly string[];
}>;

export type StepKind = 'format' | 'generate' | 'fix' | 'check';

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

const assertLiteral = (literal: string, pattern: string): string => {
  if (literal.includes('*') || literal.includes('/')) {
    throw new Error(
      `Unsupported code gate pattern: ${pattern}. Teach matchesGatePattern in tools/scripts/cmd/check-changed/plan.mts its shape.`,
    );
  }

  return literal;
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

const PATHS_IGNORE = /--paths-ignore '([^']+)'/gu;
