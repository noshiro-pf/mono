import { Arr, isRecord, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { readRepositoryFile } from '../lib/repo-files.mjs';
import { git, isRegularFile, splitZ } from '../lib/step-runner.mjs';

/**
 * Fails when the synstate hooks packages drift apart in the files they share.
 *
 * `synstate-react-hooks-compat` (React before `useSyncExternalStore`) and
 * `synstate-preact-hooks` publish the hooks of `synstate-react-hooks`, and
 * their sources, tests, scripts and configurations are copies of it except
 * where that difference reaches. A fix applied to one copy and not the others
 * ships two behaviors of the same hook, and nothing else notices.
 *
 * Every shared file of a package ({@link isSharedFile}: its sources, tests,
 * scripts, configurations, samples and root configuration files, and the
 * scripts of its `package.json` as {@link SCRIPTS_FILE}) must exist in
 * {@link REFERENCE} and in that package with the same contents, once the
 * package's mechanical substitutions (its name, `preact` for `react`, …) are
 * applied to both, unless the package's entry in {@link COPIES} names it, says
 * how it departs, and why. An entry whose file no longer departs that way fails
 * too, so the list cannot outlive its reasons.
 *
 * The files are those git would commit: tracked or untracked but not ignored,
 * and not deleted from the working tree. So a new file is compared before it is
 * added, and an editor's or the system's stray file is not.
 *
 * Rejects when a listed file cannot be read.
 */
export const checkSynstateHooksCopies = async (): Promise<
  Result<number, string>
> => {
  const listed = await listSharedFiles();

  const [reference, copies] = await Promise.all([
    readSharedFiles(REFERENCE, listed),
    Promise.all(
      COPIES.map(async (copy) => ({
        copy,
        files: await readSharedFiles(copy.dir, listed),
      })),
    ),
  ]);

  const findings = copies.flatMap(({ copy, files }) =>
    compareWithReference(
      reference,
      files,
      copy.departures,
      copy.substitutions,
    ).map((finding) => `${copy.dir}: ${finding}`),
  );

  if (Arr.isNonEmpty(findings)) {
    return Result.err(
      [
        `❌ The synstate hooks packages have drifted apart from ${REFERENCE}:`,
        '',
        ...findings.map((finding) => `  ${finding}`),
        '',
        'Apply the change to every package. A difference every file of a package',
        "has (a name, an import) goes in the package's substitutions, and a file",
        'that has to depart from the reference on purpose in its departures, with',
        'the reason, both in tools/scripts/cmd/check-synstate-hooks-copies.mts.',
      ].join('\n'),
    );
  }

  return Result.ok(
    copies.reduce((count, { files }) => count + files.size, reference.size),
  );
};

/**
 * What is wrong between the reference's shared files and a copy's, one line
 * each: a file only one side has, a file whose contents differ, and a listed
 * departure the files no longer show.
 *
 * @param reference The contents of the reference package's files, keyed by
 *   their path inside the package.
 * @param copy The same for the package compared with it.
 * @param departures The paths allowed to depart from the reference, and how.
 * @param substitutions Applied to both sides before they are compared
 *   ({@link substitute}).
 */
export const compareWithReference = (
  reference: ReadonlyMap<string, string>,
  copy: ReadonlyMap<string, string>,
  departures: ReadonlyRecord<string, Departure>,
  substitutions: Substitutions = [],
): readonly string[] => {
  const normalized = (text: string | undefined): string | undefined =>
    text === undefined ? undefined : substitute(text, substitutions);

  const everyPath = new Set<string>([
    ...reference.keys(),
    ...copy.keys(),
    ...Object.keys(departures),
  ]);

  const paths = Arr.toSorted(Array.from(everyPath), (a, b) =>
    a.localeCompare(b),
  );

  return paths.flatMap((file): readonly string[] => {
    const found = departureOf(
      normalized(reference.get(file)),
      normalized(copy.get(file)),
    );

    const listed = departures[file];

    if (listed === undefined) {
      return found === undefined ? [] : [`${file}: ${MESSAGE[found]}`];
    }

    if (found === listed.kind) {
      return [];
    }

    const actually =
      found !== undefined
        ? MESSAGE[found]
        : reference.has(file)
          ? 'both packages have it, identical'
          : 'in neither package';

    return [`${file}: listed as "${listed.kind}", but ${actually}`];
  });
};

/**
 * The paths inside `dir` of the files in `listed`, a list of repository-relative
 * paths.
 */
export const filesOf = (
  dir: string,
  listed: readonly string[],
): readonly string[] => {
  const prefix = `${dir}/` as const;

  // `git ls-files --cached` lists an unmerged path once per stage.
  return Array.from(
    new Set<string>(
      listed
        .filter((file) => file.startsWith(prefix))
        .map((file) => file.slice(prefix.length)),
    ),
  );
};

/**
 * `text` with each substitution of a copy applied in order: the copy's spelling
 * of something the reference spells otherwise, replaced by the reference's, so
 * that what is left to compare is what the copy does differently.
 */
export const substitute = (
  text: string,
  substitutions: Substitutions,
): string =>
  substitutions.reduce(
    // A function, so that the replacement is taken as written, `$` and all.
    (mut_text, [pattern, replacement]) =>
      mut_text.replaceAll(pattern, () => replacement),
    text,
  );

/** Whether a path inside a package is one of the files compared. */
export const isSharedFile = (file: string): boolean =>
  SHARED_DIRS.some((dir) => file.startsWith(`${dir}/`)) ||
  SHARED_ROOT_FILE.test(file);

/**
 * The scripts of a package's `package.json`, as the text compared under
 * {@link SCRIPTS_FILE}: one per line, sorted by name, so that an order the
 * packages happen to differ in is not a difference.
 */
export const scriptsFile = (packageJson: string): string => {
  const manifest: unknown = JSON.parse(packageJson);

  const scripts = isRecord(manifest) ? manifest['scripts'] : undefined;

  const entries = isRecord(scripts)
    ? Arr.toSorted(Object.entries(scripts), ([a], [b]) => a.localeCompare(b))
    : ([] as const);

  return `${JSON.stringify(Object.fromEntries(entries), undefined, 2)}\n`;
};

/**
 * A copy's substitutions: a pattern, `g`-flagged, and the text that replaces
 * each match, as written.
 */
export type Substitutions = readonly (readonly [RegExp, string])[];

/** How a file of a copy departs from the reference on purpose. */
export type Departure = Readonly<{
  /**
   * `differs`: both packages have the file, with different contents.
   * `reference only` and `copy only`: one package has it, the other has none.
   */
  kind: 'differs' | 'reference only' | 'copy only';
  reason: string;
}>;

/** The package every other one is compared with, from the repository root. */
const REFERENCE = 'libs/synstate-react-hooks';

/** The directories of each package whose files are compared. */
const SHARED_DIRS = ['src', 'test', 'scripts', 'configs', 'samples'] as const;

/** The files at the root of each package that are compared. */
const SHARED_ROOT_FILE = /^(?:eslint\.config\.mts|tsconfig[\w.-]*\.json)$/u;

/** The name the scripts of `package.json` are compared under. */
const SCRIPTS_FILE = 'package.json (scripts)';

/** A path inside a package that is compared. */
type SharedPath =
  | `${(typeof SHARED_DIRS)[number]}/${string}`
  | 'eslint.config.mts'
  | `tsconfig${string}.json`
  | typeof SCRIPTS_FILE;

/**
 * The packages compared with {@link REFERENCE}, each with the files that depart
 * from it on purpose, keyed by their path inside the package.
 */
const COPIES = [
  {
    dir: 'libs/synstate-react-hooks-compat',
    substitutions: [[/synstate-react-hooks-compat/gu, 'synstate-react-hooks']],
    departures: {
      'src/react-version-hooks.mts': {
        kind: 'differs',
        reason:
          'React 16 and 17 have no useInsertionEffect; compat falls back to useLayoutEffect.',
      },
      'src/use-observable-value.mts': {
        kind: 'differs',
        reason:
          'React 16 and 17 have no useSyncExternalStore; compat reads through use-sync-external-store/shim, and keeps the overloads it published.',
      },
      'configs/vitest.config.mts': {
        kind: 'differs',
        reason:
          "The alias is longer by the package name's `-compat`, so Prettier wraps it.",
      },
      'scripts/cmd/embed-examples.mts': {
        kind: 'differs',
        reason:
          "The useObservableValue README sample is the reference package's alone.",
      },
      'samples/readme/03-use-observable-value.tsx': {
        kind: 'reference only',
        reason:
          "The useObservableValue README sample is the reference package's alone.",
      },
      'eslint.config.mts': {
        kind: 'differs',
        reason:
          'It allows use-sync-external-store/shim, and, being no Sumi dogfood target, does not turn off the rules Sumi covers.',
      },
      'tsconfig.sumi.json': {
        kind: 'reference only',
        reason: 'Not a Sumi dogfood target.',
      },
      [SCRIPTS_FILE]: {
        kind: 'differs',
        reason: 'No check:sumi: not a Sumi dogfood target.',
      },
    },
  },
  {
    dir: 'libs/synstate-preact-hooks',
    substitutions: [
      [/synstate-preact-hooks/gu, 'synstate-react-hooks'],
      [/@testing-library\/preact\b/gu, '@testing-library/react'],
      // Preact's `act` returns a promise to await, so a test that calls it is
      // `async`.
      [/\bawait act\(/gu, 'act('],
      [/(?<=\btest\((?:'[^']*'|"[^"]*"|`[^`]*`), )async (?=\(\) =>)/gu, ''],
      [
        /import type \* as Preact from 'preact';/gu,
        "import type * as React from 'react';",
      ],
      [/\bPreact\.JSX\b/gu, 'React.JSX'],
    ],
    departures: {
      'src/react-version-hooks.mts': {
        kind: 'reference only',
        reason:
          'The Preact hooks call preact/hooks and preact/compat directly; there is one Preact to support.',
      },
      'src/use-observable-effect.mts': {
        kind: 'differs',
        reason: 'Written against preact/hooks.',
      },
      'src/use-observable-value.mts': {
        kind: 'differs',
        reason: "Written against preact/compat's useSyncExternalStore.",
      },
      'src/use-value-as-observable.mts': {
        kind: 'differs',
        reason: 'Written against preact/hooks.',
      },
      'test/browser/use-observable-effect.test.mts': {
        kind: 'differs',
        reason:
          'Unmounts with a bare render(null, …), whose effect cleanup preact 11 runs a frame later (#3917), and tests that case.',
      },
      'test/browser/use-value-as-observable.test.mts': {
        kind: 'differs',
        reason:
          'Tests the Preact implementation, which has no StrictMode and completes its observable without a timer.',
      },
      'test/browser/hydrate.test.mts': {
        kind: 'reference only',
        reason:
          'Hydrates with react-dom, which the Preact package does not depend on.',
      },
      'test/server-render.test.mts': {
        kind: 'reference only',
        reason:
          'Renders with react-dom/server, which the Preact package does not depend on.',
      },
      'configs/vitest.config.mts': {
        kind: 'differs',
        reason: 'The browser tests optimize Preact rather than React.',
      },
      'scripts/cmd/embed-examples.mts': {
        kind: 'differs',
        reason:
          "The useObservableValue README sample is the reference package's alone.",
      },
      'samples/readme/03-use-observable-value.tsx': {
        kind: 'reference only',
        reason:
          "The useObservableValue README sample is the reference package's alone.",
      },
      'tsconfig.json': {
        kind: 'differs',
        reason: "JSX is compiled for Preact's runtime (jsxImportSource).",
      },
      'tsconfig.sumi.json': {
        kind: 'differs',
        reason:
          'Needs no dom lib: its useValueAsObservable completes without setTimeout.',
      },
      [SCRIPTS_FILE]: {
        kind: 'differs',
        reason:
          'gen:index:src excludes no react-version-hooks.mts, which the package does not have.',
      },
    },
  },
] as const satisfies readonly Readonly<{
  dir: string;
  substitutions: Substitutions;
  departures: Partial<ReadonlyRecord<SharedPath, Departure>>;
}>[];

const MESSAGE = {
  differs: 'contents differ',
  'reference only': 'only in the reference',
  'copy only': 'not in the reference',
} as const satisfies ReadonlyRecord<Departure['kind'], string>;

/** How a file departs from the reference, or `undefined` when it does not. */
const departureOf = (
  inReference: string | undefined,
  inCopy: string | undefined,
): Departure['kind'] | undefined =>
  inReference === undefined
    ? inCopy === undefined
      ? undefined
      : 'copy only'
    : inCopy === undefined
      ? 'reference only'
      : inReference === inCopy
        ? undefined
        : 'differs';

/**
 * The files of every package that git would commit, repository-relative:
 * tracked, or untracked and not ignored, and present in the working tree.
 * {@link readSharedFiles} keeps the shared ones.
 */
const listSharedFiles = async (): Promise<readonly string[]> =>
  splitZ(
    await git([
      'ls-files',
      '-z',
      '--cached',
      '--others',
      '--exclude-standard',
      '--',
      ...Arr.toUnshifted(REFERENCE)(COPIES.map((copy) => copy.dir)),
    ]),
  ).filter(isRegularFile);

/**
 * The shared files of a package, keyed by their path inside it, and its scripts
 * under {@link SCRIPTS_FILE}. A file that cannot be read throws, which the
 * caller reports.
 */
const readSharedFiles = async (
  dir: string,
  listed: readonly string[],
): Promise<ReadonlyMap<string, string>> =>
  new Map<string, string>(
    Arr.toPushed(
      await Promise.all(
        filesOf(dir, listed)
          .filter(isSharedFile)
          .map(
            async (file) =>
              [
                file,
                Result.unwrapThrow(await readRepositoryFile(`${dir}/${file}`)),
              ] as const,
          ),
      ),
      [
        SCRIPTS_FILE,
        scriptsFile(
          Result.unwrapThrow(await readRepositoryFile(`${dir}/package.json`)),
        ),
      ],
    ),
  );

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkSynstateHooksCopies().catch((error: unknown) =>
    Result.err(`❌ ${unknownToString(error)}`),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} file(s) checked; the synstate hooks packages match ${REFERENCE} outside their listed departures.`,
  );
}
