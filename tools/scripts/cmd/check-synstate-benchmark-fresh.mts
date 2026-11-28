import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  BLOCKS_RELEASE_LABEL,
  MERGE_QUEUED_LABEL,
  PRIORITY_HIGH_LABEL,
} from 'pr-report-core';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type {
  MutableFixedLengthTuple,
  ReadonlyRecord,
  StrictOmit,
} from 'ts-type-forge';
import { describeFailure, runFile } from '../lib/child-process.mjs';
import { resolveDiffBase } from '../lib/diff-base.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Holds a release of synstate until its documentation's benchmark table was
 * measured on the code, the library versions and the Node.js major the tree
 * has.
 *
 * The table (`apps/synstate-docs/src/data/benchmark-results.json`) is measured
 * by hand, by dispatching `synstate-benchmark.yml`, rather than on every pull
 * request: a run takes over an hour. Nothing else notices a table older than
 * the code it describes, so the runner records what it measured
 * (`readMeasuredInputs` in `measured-inputs.mts`: a digest of the code the
 * scenarios run, the other libraries' versions, and the versions of what those
 * run on), beside the Node.js version that ran it, and this check compares that
 * record with the tree. Node.js is compared by its major alone, against the
 * version the workflow sets up (`volta.node`): a new major moves every figure,
 * while a patch, which the toolchain takes often, rarely does.
 *
 * It holds only the version pull request: it fails when the tree raises
 * synstate's version past the diff base (`resolveDiffBase` in
 * `tools/scripts/lib/diff-base.mts` says which commit that is) and the record
 * no longer matches. A pull request that changes synstate or a library's version
 * passes, so that the measurement is made once per release rather than once per
 * change. Every package is released by that one pull request, so holding it
 * holds the others' releases too, until the table is measured again. Any other
 * tree also fails when the measured inputs cannot be read.
 */
// A `check:prose` guard because it reads the diff base (CLAUDE.md, "Commands"),
// which only `style-check.yml` fetches and sets as `PROSE_DIFF_BASE`, as
// `check:prose:next-major` does. Under `check:root` it would compare with the
// merge base of a clone that has no `origin/main`, and fail every run.
// `skip-ci` keeps it off the version pull request until that is queued, so the
// author first learns of a hold there; posting the verdict when `release.yml`
// rebuilds that pull request, as `next-major-reminder.mts` does, is deferred to
// an issue.
export const checkBenchmarkFreshness = ({
  baseVersion,
  version,
  recorded,
  current,
}: Readonly<{
  /** synstate's version at the base. */
  baseVersion: string;
  /** synstate's version in the tree, which differs from the base's. */
  version: string;
  /** What the committed table says it measured. */
  recorded: Recorded;
  /** What the tree would measure now. */
  current: Readonly<{
    /** `volta.node`, the version the workflow measures on. */
    node: string;
    measuredCode: string;
    libraries: ReadonlyRecord<string, string>;
    libraryDependencies: ReadonlyRecord<string, string>;
  }>;
}>): Result<string, string> => {
  // The tree's digest is left out of the message: the record has to come from a
  // run of the workflow, and a digest to copy into the table invites the
  // opposite.
  const differences = Arr.generate(function* () {
    if (recorded.measuredCode === undefined) {
      yield 'the table records no digest of the code it measured';
    } else if (recorded.measuredCode !== current.measuredCode) {
      yield 'the code it measured has changed since, or esbuild now bundles it differently';
    }

    if (recorded.node === undefined) {
      yield 'the table records no Node.js version';
    } else if (majorOf(recorded.node) !== majorOf(current.node)) {
      yield `Node.js: measured ${recorded.node}, set up ${current.node}`;
    }

    yield* versionDifferences(recorded.libraries, current.libraries);

    if (recorded.libraryDependencies === undefined) {
      yield 'the table records no versions of what the libraries run on';
    } else {
      yield* versionDifferences(
        recorded.libraryDependencies,
        current.libraryDependencies,
      );
    }
  });

  return Arr.isNonEmpty(differences)
    ? Result.err(
        [
          `❌ This tree releases synstate ${version} (from ${baseVersion}), but its benchmark table (${RESULTS_PATH}) was measured on something else:`,
          '',
          ...differences.map((difference) => `  - ${difference}`),
          '',
          'Measure it again before the release, once every other pull request the release',
          `waits for (\`${BLOCKS_RELEASE_LABEL}\`) has merged, since one that changes what the table`,
          'records (the measured code, a version of a measured library or of what it runs',
          'on, through a manifest or the lockfile, or the Node.js version) merging later',
          'makes the new table stale too. Keep the queue from merging one while the run',
          `goes on (take \`${MERGE_QUEUED_LABEL}\` off any such pull request until the release`,
          'lands): dispatch `synstate-benchmark.yml` on `main`, commit the file of the',
          'artifact it uploads in place of the table in a pull request labelled',
          `\`${BLOCKS_RELEASE_LABEL}\` and \`${PRIORITY_HIGH_LABEL}\` (the record is what that run measured;`,
          'editing it by hand publishes figures it does not describe), and run',
          '`pnpm --filter @synstate/docs run gen:benchmark` there, rewording any sentence',
          'the new figures no longer bear out. The version pull request is rebuilt once',
          `that pull request merges; label it \`${PRIORITY_HIGH_LABEL}\` too. Both labels put each`,
          'ahead of the queued pull requests, any of which could change what the table',
          'records again. They do not hold `pnpm-update.yml`, which arms auto-merge on',
          'its pull request on every run: disable that workflow, and disarm its open pull',
          `request and take \`${MERGE_QUEUED_LABEL}\` off it, until the release lands.`,
        ].join('\n'),
      )
    : Result.ok(
        `synstate ${version} is released with a benchmark table measured on the code, library versions and Node.js major it ships.`,
      );
};

/**
 * Whether the tree releases synstate: its version is above the base's by semver
 * precedence, build metadata aside. A lower one, as a revert leaves, publishes
 * nothing, since npm refuses a version it already has; one this does not parse
 * is held, as a release would be.
 */
export const releasesSynstate = (
  baseVersion: string,
  version: string,
): boolean => {
  const before = parseSemver(baseVersion);

  const after = parseSemver(version);

  if (before === undefined || after === undefined) {
    return baseVersion !== version;
  }

  const coreDifference = before.core
    .map((part, index) => compareNumeric(after.core[index] ?? '0', part))
    .find((delta) => delta !== 0);

  if (coreDifference !== undefined) {
    return coreDifference > 0;
  }

  // The same `major.minor.patch`: a release ranks above its prereleases.
  return after.prerelease === undefined || before.prerelease === undefined
    ? after.prerelease === undefined && before.prerelease !== undefined
    : comparePrerelease(after.prerelease, before.prerelease) > 0;
};

/**
 * The verdict on a tree, from what `run` read: the table and the measured
 * inputs must read on every tree, and only a release compares them.
 */
export const judgeTree = async ({
  baseVersion,
  version,
  table,
  measured,
  readNode,
}: Readonly<{
  /** synstate's version at the base; `undefined` where the base has none. */
  baseVersion: string | undefined;
  version: string;
  /** The committed table's text, or why it could not be read. */
  table: Result<string, unknown>;
  /** The inputs the tree would measure, or why they could not be read. */
  measured: Result<StrictOmit<CurrentInputs, 'node'>, unknown>;
  /** `volta.node`, read only for a release. */
  readNode: () => Promise<string>;
}>): Promise<Result<string, string>> => {
  const recorded = Result.isOk(table)
    ? Result.fromThrowable(() => readRecorded(table.value))
    : table;

  const problems = [
    ...(Result.isErr(table)
      ? ([
          `❌ ${RESULTS_PATH} cannot be read (${unknownToString(table.value)}); if the benchmark table moved, update RESULTS_PATH in check-synstate-benchmark-fresh.mts.`,
        ] as const)
      : Result.isErr(recorded)
        ? ([`❌ ${unknownToString(recorded.value)}`] as const)
        : ([] as const)),
    ...(Result.isErr(measured)
      ? ([
          `❌ The benchmark's measured inputs cannot be read. This guard reads them on every tree, releasing or not, so that what keeps them from being read fails on the pull request that makes it: ${unknownToString(measured.value)}`,
        ] as const)
      : ([] as const)),
  ] as const;

  if (Result.isErr(recorded) || Result.isErr(measured)) {
    return Result.err(problems.join('\n'));
  }

  // A base with no synstate has nothing to compare with: a package's first
  // release is manual (`libs/first-release.md`).
  if (baseVersion === undefined) {
    return Result.ok(
      'The base has no synstate; its first release is manual, and not held for the benchmark table.',
    );
  }

  if (!releasesSynstate(baseVersion, version)) {
    return Result.ok(
      `synstate stays at ${version}; the measured inputs read cleanly, and no release is held for the benchmark table.`,
    );
  }

  return checkBenchmarkFreshness({
    baseVersion,
    version,
    recorded: recorded.value,
    current: { node: await readNode(), ...measured.value },
  });
};

/**
 * The record the committed table holds. A field the table does not have, or
 * holds in another shape, reads as missing, which fails a release like a
 * mismatch.
 */
export const readRecorded = (json: string): Recorded => {
  const parsed = parseJson(json, RESULTS_PATH);

  const environment =
    isRecord(parsed) && hasKey(parsed, 'environment')
      ? parsed.environment
      : undefined;

  if (!isRecord(environment)) {
    return {
      node: undefined,
      measuredCode: undefined,
      libraries: {},
      libraryDependencies: undefined,
    };
  }

  return {
    node:
      hasKey(environment, 'node') && isString(environment.node)
        ? environment.node
        : undefined,
    measuredCode:
      hasKey(environment, 'measuredCode') && isString(environment.measuredCode)
        ? environment.measuredCode
        : undefined,
    libraries: stringsIn(environment, 'libraries') ?? {},
    libraryDependencies: stringsIn(environment, 'libraryDependencies'),
  };
};

/** What the tree would measure now. */
export type CurrentInputs = Parameters<
  typeof checkBenchmarkFreshness
>[0]['current'];

export type Recorded = Readonly<{
  /** `process.version` of the run, such as `v26.13.1`. */
  node: string | undefined;
  measuredCode: string | undefined;
  libraries: ReadonlyRecord<string, string>;
  /** `undefined` for a table measured before it was recorded. */
  libraryDependencies: ReadonlyRecord<string, string> | undefined;
}>;

const RESULTS_PATH = 'apps/synstate-docs/src/data/benchmark-results.json';

const MANIFEST_PATH = 'libs/synstate/package.json';

/** `26` of `v26.13.1` or `26.13.1`. */
const majorOf = (version: string): string =>
  version.replace(/^v/u, '').split('.', 1)[0] ?? version;

/**
 * Two strings of digits with no leading zero compared as the numbers they
 * write: by length, and then as text. Read as numbers, two beyond
 * `Number.MAX_SAFE_INTEGER` could round to one.
 */
const compareNumeric = (left: string, right: string): number =>
  left.length !== right.length
    ? left.length - right.length
    : left < right
      ? -1
      : left > right
        ? 1
        : 0;

/**
 * `{ core: ['10', '2', '0'], prerelease: ['next', '1'] }` of `10.2.0-next.1+sha`;
 * `undefined` for another form, which semver does not allow either: a number
 * with a leading zero, which would compare equal to another number, or an empty
 * prerelease identifier.
 */
const parseSemver = (
  version: string,
):
  | Readonly<{
      core: readonly string[];
      prerelease: readonly string[] | undefined;
    }>
  | undefined => {
  const [withoutBuild = ''] = version.split('+', 1);

  const dash = withoutBuild.indexOf('-');

  const core = dash === -1 ? withoutBuild : withoutBuild.slice(0, dash);

  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u.exec(core);

  const prerelease =
    dash === -1 ? undefined : withoutBuild.slice(dash + 1).split('.');

  return match === null ||
    prerelease?.some(
      (identifier) => identifier === '' || /^0\d+$/u.test(identifier),
    ) === true
    ? undefined
    : { core: match.slice(1, 4), prerelease };
};

/**
 * Semver precedence of two prerelease identifier lists: numeric identifiers by
 * value and below alphanumeric ones, which compare as strings; a list that is a
 * prefix of the other ranks below it.
 */
const comparePrerelease = (
  a: readonly string[],
  b: readonly string[],
): number => {
  const numeric = /^\d+$/u;

  for (const [index, left] of a.entries()) {
    const right = b[index];

    if (right === undefined) {
      return 1;
    }

    if (left !== right) {
      const leftNumeric = numeric.test(left);

      const rightNumeric = numeric.test(right);

      return leftNumeric && rightNumeric
        ? compareNumeric(left, right)
        : leftNumeric !== rightNumeric
          ? leftNumeric
            ? -1
            : 1
          : left < right
            ? -1
            : 1;
    }
  }

  return a.length === b.length ? 0 : -1;
};

/** `JSON.parse`, failing with the name of what it read. */
const parseJson = (json: string, source: string): unknown => {
  const parsed = Result.fromThrowable((): unknown => JSON.parse(json));

  if (Result.isErr(parsed)) {
    throw new Error(
      `${source} is not valid JSON: ${unknownToString(parsed.value)}`,
    );
  }

  return parsed.value;
};

const readVersion = (json: string, source: string): string | undefined => {
  const parsed = parseJson(json, source);

  return isRecord(parsed) &&
    hasKey(parsed, 'version') &&
    isString(parsed.version)
    ? parsed.version
    : undefined;
};

/** One line per package whose version differs between the two records. */
const versionDifferences = (
  measured: ReadonlyRecord<string, string>,
  installed: ReadonlyRecord<string, string>,
): readonly string[] =>
  Arr.uniq([...Object.keys(measured), ...Object.keys(installed)])
    .toSorted()
    .filter((name) => measured[name] !== installed[name])
    .map(
      (name) =>
        `${name}: measured ${measured[name] ?? 'none'}, installed ${installed[name] ?? 'none'}`,
    );

/** The string-valued entries of `record[key]`, or `undefined` without one. */
const stringsIn = (
  record: ReadonlyRecord<string, unknown>,
  key: string,
): ReadonlyRecord<string, string> | undefined => {
  const value = record[key];

  return isRecord(value)
    ? Object.fromEntries(
        Object.entries(value).filter(
          (entry): entry is MutableFixedLengthTuple<2, string> =>
            isString(entry[1]),
        ),
      )
    : undefined;
};

/**
 * synstate's version at `base`, `undefined` when the base has no synstate, and
 * an error when git cannot say which: a guard that holds a release fails when
 * it cannot tell, rather than pass.
 */
const readBaseVersion = async (
  base: string,
): Promise<Result<string | undefined, string>> => {
  const listed = await runFile(
    'git',
    ['ls-tree', '--name-only', base, '--', MANIFEST_PATH],
    { cwd: projectRootPath },
  );

  if (listed.status !== 0) {
    return Result.err(
      `❌ Could not list ${MANIFEST_PATH} at ${base}: ${describeFailure(listed)}`,
    );
  }

  if (listed.stdout.trim() === '') {
    return Result.ok(undefined);
  }

  const shown = await runFile('git', ['show', `${base}:${MANIFEST_PATH}`], {
    cwd: projectRootPath,
  });

  if (shown.status !== 0) {
    return Result.err(
      `❌ Could not read ${MANIFEST_PATH} at ${base}: ${describeFailure(shown)}`,
    );
  }

  const version = readVersion(shown.stdout, `${MANIFEST_PATH} at ${base}`);

  return version === undefined
    ? Result.err(`❌ ${MANIFEST_PATH} has no version at ${base}.`)
    : Result.ok(version);
};

/** `volta.node` of the root manifest, the version the workflow sets up. */
const readPinnedNode = async (): Promise<string> => {
  const parsed = parseJson(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the path comes from the repository or a manifest in it, never from input
    await fs.readFile(path.join(projectRootPath, 'package.json'), 'utf8'),
    'package.json',
  );

  const volta =
    isRecord(parsed) && hasKey(parsed, 'volta') ? parsed.volta : undefined;

  if (!isRecord(volta) || !hasKey(volta, 'node') || !isString(volta.node)) {
    throw new Error('package.json has no `volta.node`');
  }

  return volta.node;
};

const run = async (): Promise<Result<string, string>> => {
  const base = await resolveDiffBase('compare synstate versions with');

  const baseVersion = await readBaseVersion(base);

  if (Result.isErr(baseVersion)) {
    return baseVersion;
  }

  const manifest = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the path comes from the repository or a manifest in it, never from input
    fs.readFile(path.join(projectRootPath, MANIFEST_PATH), 'utf8'),
  );

  if (Result.isErr(manifest)) {
    return Result.err(
      `❌ ${MANIFEST_PATH} cannot be read (${unknownToString(manifest.value)}); if synstate moved, point check-synstate-benchmark-fresh.mts and the benchmark's scenarios at it.`,
    );
  }

  const version = readVersion(manifest.value, MANIFEST_PATH);

  if (version === undefined) {
    return Result.err(`❌ ${MANIFEST_PATH} has no version.`);
  }

  // The inputs are read on every tree, though only a release compares them: a
  // change that keeps them from being read (a lazy import, an undeclared one)
  // fails here, on the pull request that makes it, rather than on the version
  // pull request, far from it.
  const measured = await Result.fromPromise(
    // eslint-disable-next-line import-x/no-relative-packages -- the site's runner records these inputs, and this check must compute them the same way; the module reads the site's scenario list, so moving it under tools/ would only move the import
    import('../../../apps/synstate-docs/scripts/benchmark/measured-inputs.mjs').then(
      (inputs) => inputs.readMeasuredInputs(),
    ),
  );

  // Read on every tree too, so that a table moved without this path fails on
  // the pull request that moves it.
  const table = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the path comes from the repository, never from input
    fs.readFile(path.join(projectRootPath, RESULTS_PATH), 'utf8'),
  );

  return judgeTree({
    baseVersion: baseVersion.value,
    version,
    table,
    measured,
    readNode: readPinnedNode,
  });
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await run().catch((error: unknown) =>
    Result.err(`❌ ${unknownToString(error)}`),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(result.value);
}
