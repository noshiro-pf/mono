import { Arr, Result, unknownToString } from 'ts-data-forge';
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
 * Every file under {@link SHARED_DIRS} of a package must exist in
 * {@link REFERENCE} and in that package with the same contents, unless the
 * package's entry in {@link COPIES} names it, says how it departs, and why. An
 * entry whose file no longer departs that way fails too, so the list cannot
 * outlive its reasons.
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
    compareWithReference(reference, files, copy.departures).map(
      (finding) => `${copy.dir}: ${finding}`,
    ),
  );

  if (Arr.isNonEmpty(findings)) {
    return Result.err(
      [
        `❌ The synstate hooks packages have drifted apart from ${REFERENCE}:`,
        '',
        ...findings.map((finding) => `  ${finding}`),
        '',
        'Apply the change to every package. A file that has to depart from',
        "the reference on purpose goes in the package's departures in",
        'tools/scripts/cmd/check-synstate-hooks-copies.mts, with the reason.',
      ].join('\n'),
    );
  }

  return Result.ok(listed.length);
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
 */
export const compareWithReference = (
  reference: ReadonlyMap<string, string>,
  copy: ReadonlyMap<string, string>,
  departures: ReadonlyRecord<string, Departure>,
): readonly string[] => {
  const everyPath = new Set<string>([
    ...reference.keys(),
    ...copy.keys(),
    ...Object.keys(departures),
  ]);

  const paths = Arr.toSorted(Array.from(everyPath), (a, b) =>
    a.localeCompare(b),
  );

  return paths.flatMap((file): readonly string[] => {
    const found = departureOf(reference.get(file), copy.get(file));

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
const SHARED_DIRS = ['src', 'test', 'scripts', 'configs'] as const;

/** A path inside a package that {@link SHARED_DIRS} covers. */
type SharedPath = `${(typeof SHARED_DIRS)[number]}/${string}`;

/**
 * The packages compared with {@link REFERENCE}, each with the files that depart
 * from it on purpose, keyed by their path inside the package.
 */
const COPIES = [
  {
    dir: 'libs/synstate-react-hooks-compat',
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
          "The alias names the package's own name, and the browser tests also run on React 16.8 and 17.",
      },
      'test/legacy-react/hydrate.test.mts': {
        kind: 'copy only',
        reason:
          'test/browser/hydrate.test.mts for React 16.8 and 17, which hydrate through ReactDOM.hydrate.',
      },
      'test/legacy-react/testing-library-react.mts': {
        kind: 'copy only',
        reason:
          '@testing-library/react for the React 16.8 and 17 runs, which the reference package has no use for.',
      },
      'scripts/cmd/embed-examples.mts': {
        kind: 'differs',
        reason:
          "The useObservableValue README sample is the reference package's alone.",
      },
    },
  },
  {
    dir: 'libs/synstate-preact-hooks',
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
      'test/browser/create-state.test.mts': {
        kind: 'differs',
        reason: 'Renders with @testing-library/preact.',
      },
      'test/browser/use-observable-effect.test.mts': {
        kind: 'differs',
        reason: 'Renders with @testing-library/preact.',
      },
      'test/browser/use-observable-value.test.mts': {
        kind: 'differs',
        reason: 'Renders with @testing-library/preact.',
      },
      'test/browser/use-value-as-observable.test.mts': {
        kind: 'differs',
        reason: 'Renders with @testing-library/preact.',
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
        reason:
          'The alias names the package, and the browser tests optimize Preact.',
      },
      'scripts/cmd/embed-examples.mts': {
        kind: 'differs',
        reason:
          "The useObservableValue README sample is the reference package's alone.",
      },
    },
  },
] as const satisfies readonly Readonly<{
  dir: string;
  departures: ReadonlyRecord<SharedPath, Departure>;
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
 * The files of every package's {@link SHARED_DIRS} that git would commit,
 * repository-relative: tracked, or untracked and not ignored, and present in
 * the working tree.
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
      ...Arr.toUnshifted(REFERENCE)(COPIES.map((copy) => copy.dir)).flatMap(
        (dir) => SHARED_DIRS.map((shared) => `${dir}/${shared}`),
      ),
    ]),
  ).filter(isRegularFile);

/**
 * The shared files of a package, keyed by their path inside it. A file that
 * cannot be read throws, which the caller reports.
 */
const readSharedFiles = async (
  dir: string,
  listed: readonly string[],
): Promise<ReadonlyMap<string, string>> =>
  new Map<string, string>(
    await Promise.all(
      filesOf(dir, listed).map(
        async (file) =>
          [
            file,
            Result.unwrapThrow(await readRepositoryFile(`${dir}/${file}`)),
          ] as const,
      ),
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
