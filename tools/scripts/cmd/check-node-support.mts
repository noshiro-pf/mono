import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Num,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { glob, isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Holds `tools/configs/node-support.json`, every `package.json` field derived
 * from it, and the compatibility matrix to one story about which Node versions
 * this repository supports.
 *
 * Three fields answer three different questions, and conflating them is what
 * this check exists to stop:
 *
 * - **`engines.node` answers the consumer's question** — the range a published
 *   package needs to work. Its lower bound is `targets.minimum`, and it moves
 *   only by a deliberate decision (raising it is a breaking change), never
 *   because the matrix was refreshed.
 * - **`volta.node` / `devEngines.runtime` answer the contributor's question** —
 *   the Node this repository is developed and built on. `volta.node` is what
 *   `actions/setup-node` resolves `node-version-file: 'package.json'` to, so
 *   it is the version nine of the ten workflows actually run. It tracks
 *   `targets.current` and carries no semver meaning at all.
 * - **The matrix answers what was tested.** `targets.minimum` is tested
 *   *exactly*, because a floor nothing runs on is a claim rather than a fact;
 *   `lts` and `current` float up with their lines.
 *
 * The direction is one-way: the `engines` floor is decided first, and the
 * matrix minimum follows it. A patch refresh of `lts` / `current` must never
 * push the floor up — see `update-node-support.mts`, which refuses to move
 * `targets.minimum` without being told to.
 *
 * The upper bound is derived, not written by hand, so that "we know it breaks
 * above N" cannot drift into "we have not tried above N": under the default
 * `reactive` policy an upper bound exists exactly while `knownBroken` names the
 * version that broke.
 */
export const checkNodeSupport = async (
  options: Readonly<{ fix: boolean }>,
): Promise<Result<CheckSummary, string>> =>
  Result.safeTry(async function* () {
    const config = yield* Result.safeUnwrap(await readNodeSupportConfig());

    const expected = expectedFields(config);

    const manifests = yield* Result.safeUnwrap(await collectManifests());

    const manifestViolations = manifests.flatMap((manifest) =>
      checkManifest(manifest, expected),
    );

    const workflowViolations = await checkWorkflowMatrix(config);

    const violations = [...manifestViolations, ...workflowViolations];

    if (!Arr.isNonEmpty(violations)) {
      return Result.ok({ manifestCount: manifests.length, fixedCount: 0 });
    }

    if (!options.fix) {
      return Result.err(formatViolations(violations, expected));
    }

    const fixable = violations.filter(
      (violation) => violation.fix !== undefined,
    );

    const unfixable = violations.filter(
      (violation) => violation.fix === undefined,
    );

    await applyFixes(fixable);

    if (Arr.isNonEmpty(unfixable)) {
      return Result.err(formatViolations(unfixable, expected));
    }

    return Result.ok({
      manifestCount: manifests.length,
      fixedCount: fixable.length,
    });
  });

/**
 * The values every governed `package.json` field must hold, derived from the
 * config so that the check and the updater cannot disagree about them.
 */
export const expectedFields = (config: NodeSupportConfig): ExpectedFields => {
  const lower = `>=${config.targets.minimum}`;

  const ceiling = expectedCeiling(config);

  return {
    enginesNode: ceiling === undefined ? lower : `${lower} <${ceiling}`,
    voltaNode: config.targets.current,
    devEnginesRuntime: `^${config.targets.current}`,
  };
};

export const readNodeSupportConfig = async (): Promise<
  Result<NodeSupportConfig, string>
> => {
  const parsed = await readJsonFile(nodeSupportConfigPath);

  if (Result.isErr(parsed)) {
    return Result.err(parsed.value);
  }

  return parseNodeSupportConfig(parsed.value);
};

/**
 * Validates the parsed contents of `node-support.json`.
 *
 * Exported for the unit tests: it is the only part of this file that is a
 * pure function of its input, and it is where every rejection message the
 * config can produce is decided.
 */
export const parseNodeSupportConfig = (
  parsed: unknown,
): Result<NodeSupportConfig, string> =>
  Result.safeTry(function* () {
    if (!isRecord(parsed)) {
      return Result.err(`❌ ${nodeSupportConfigPath} is not an object.`);
    }

    const policy: unknown = hasKey(parsed, 'policy')
      ? parsed.policy
      : undefined;

    if (
      policy !== 'none' &&
      policy !== 'reactive' &&
      policy !== 'major-ceiling'
    ) {
      return Result.err(
        '❌ `policy` must be one of "none", "reactive", "major-ceiling".',
      );
    }

    const targetsResult = yield* Result.safeUnwrap(
      parseTargets(hasKey(parsed, 'targets') ? parsed.targets : undefined),
    );

    const knownBroken = yield* Result.safeUnwrap(
      parseKnownBroken(
        hasKey(parsed, 'knownBroken') ? parsed.knownBroken : undefined,
      ),
    );

    if (policy === 'none' && knownBroken !== null) {
      return Result.err(
        [
          '❌ `policy` is "none", which promises never to bound the top of',
          '   `engines.node`, but `knownBroken` names a version that broke.',
          '   Switch the policy to "reactive" — bounding the top is the honest',
          '   thing to do once something is known to be broken.',
        ].join('\n'),
      );
    }

    return Result.ok({ policy, knownBroken, targets: targetsResult });
  });

export const nodeSupportConfigPath = path.resolve(
  projectRootPath,
  'tools/configs/node-support.json',
);

/**
 * Compares two `major.minor.patch` strings. Enough for the release versions
 * this repository pins: none of them carries a prerelease tag, and one is
 * rejected by `parseVersion` before reaching here.
 */
export const compareVersions = (a: Version, b: Version): number =>
  a.major !== b.major
    ? a.major - b.major
    : a.minor !== b.minor
      ? a.minor - b.minor
      : a.patch - b.patch;

export const parseVersion = (value: string): Version | undefined => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/u.exec(value);

  if (match === null) return undefined;

  const [, major, minor, patch] = match;

  if (major === undefined || minor === undefined || patch === undefined) {
    return undefined;
  }

  return {
    major: Result.unwrapOkOr(Num.safeParseInt(major), Number.NaN),
    minor: Result.unwrapOkOr(Num.safeParseInt(minor), Number.NaN),
    patch: Result.unwrapOkOr(Num.safeParseInt(patch), Number.NaN),
  };
};

export type NodeSupportConfig = Readonly<{
  /**
   * What an upper bound on `engines.node` is allowed to mean here.
   *
   * - `none` — never bound the top. `knownBroken` must stay `null`; a
   *   repository that discovers an incompatibility changes the policy
   *   deliberately rather than sliding into a bound.
   * - `reactive` (default) — bound the top exactly while `knownBroken` names a
   *   version that broke. The canary job in `node-support-update.yml` is what
   *   fills that in, from a nightly build, months before the release reaches
   *   anyone.
   * - `major-ceiling` — always bound the top at the major after
   *   `targets.current`, whether or not anything is known to be broken.
   */
  policy: 'major-ceiling' | 'none' | 'reactive';

  /**
   * The lowest Node version known *not* to work, and why. `null` while nothing
   * is known to be broken.
   */
  knownBroken: KnownBroken | null;

  /**
   * One pinned version per matrix entry. `minimum` doubles as the `engines`
   * floor; the keys are the matrix entries `node-version-compatibility.yml`
   * runs, in ascending order.
   */
  targets: Readonly<{
    minimum: string;
    lts: string;
    current: string;
  }>;
}>;

export type KnownBroken = Readonly<{
  /** The version that broke, as `major.minor.patch`. */
  since: string;
  /** What broke, in one line. */
  reason: string;
  /** The issue tracking it, if there is one. */
  issue: number | null;
}>;

export type ExpectedFields = Readonly<{
  enginesNode: string;
  voltaNode: string;
  devEnginesRuntime: string;
}>;

export type Version = Readonly<{
  major: number;
  minor: number;
  patch: number;
}>;

export type CheckSummary = Readonly<{
  manifestCount: number;
  fixedCount: number;
}>;

type Manifest = Readonly<{
  /** Repository-relative path, for messages. */
  relativePath: string;
  absolutePath: string;
  content: string;
  parsed: unknown;
}>;

type Violation = Readonly<{
  file: string;
  detail: string;
  /** Absent when the check cannot rewrite the file for you. */
  fix?: Readonly<{
    absolutePath: string;
    keyPath: readonly string[];
    value: string;
  }>;
}>;

/**
 * `apps/*` and the private packages under `languages/*` are workspace members
 * like any other, so they are governed too where they declare a field. What is
 * *not* required is that they declare one: adding `engines` to thirty private
 * applications would be noise, and a field that is absent makes no claim to be
 * wrong.
 */
const manifestGlobs = [
  'package.json',
  'libs/*/package.json',
  'apps/*/package.json',
  'tools/*/package.json',
  'languages/*/*/package.json',
] as const;

const workflowPath = path.resolve(
  projectRootPath,
  '.github/workflows/node-version-compatibility.yml',
);

const parseTargets = (
  value: unknown,
): Result<NodeSupportConfig['targets'], string> => {
  if (!isRecord(value)) {
    return Result.err('❌ `targets` must be an object.');
  }

  const keys = ['minimum', 'lts', 'current'] as const;

  const entries = keys.map((key) => {
    const raw: unknown = hasKey(value, key) ? value[key] : undefined;

    return [key, isString(raw) ? raw : undefined] as const;
  });

  const missing = entries.filter(([, raw]) => raw === undefined);

  if (Arr.isNonEmpty(missing)) {
    return Result.err(
      `❌ \`targets\` is missing: ${missing.map(([key]) => key).join(', ')}.`,
    );
  }

  const parsedEntries = entries.map(([key, raw]) => {
    const parsed = raw === undefined ? undefined : parseVersion(raw);

    return { key, raw, parsed } as const;
  });

  const malformed = parsedEntries.filter(({ parsed }) => parsed === undefined);

  if (Arr.isNonEmpty(malformed)) {
    return Result.err(
      [
        '❌ Every `targets` entry must be an exact `major.minor.patch`:',
        ...malformed.map(({ key, raw }) => `     ${key}: ${String(raw)}`),
        '',
        '   A range would defeat the point — the matrix pins the versions the',
        '   checks actually ran on, so that a green run names them.',
      ].join('\n'),
    );
  }

  const ascending = parsedEntries.every(({ parsed }, index) => {
    const previous = parsedEntries[index - 1]?.parsed;

    return (
      index === 0 ||
      previous === undefined ||
      parsed === undefined ||
      compareVersions(previous, parsed) < 0
    );
  });

  if (!ascending) {
    return Result.err(
      [
        '❌ `targets` must ascend: minimum < lts < current.',
        '   The keys are read positionally by `update-node-support.mts`, which',
        '   maps them onto the maintenance / active / current release lines.',
      ].join('\n'),
    );
  }

  const [minimum, lts, current] = parsedEntries;

  if (
    minimum?.raw === undefined ||
    lts?.raw === undefined ||
    current?.raw === undefined
  ) {
    return Result.err('❌ `targets` is missing an entry.');
  }

  return Result.ok({
    minimum: minimum.raw,
    lts: lts.raw,
    current: current.raw,
  });
};

const parseKnownBroken = (
  value: unknown,
): Result<KnownBroken | null, string> => {
  if (value === null || value === undefined) return Result.ok(null);

  if (!isRecord(value)) {
    return Result.err('❌ `knownBroken` must be an object or null.');
  }

  const since: unknown = hasKey(value, 'since') ? value.since : undefined;

  const reason: unknown = hasKey(value, 'reason') ? value.reason : undefined;

  const issue: unknown = hasKey(value, 'issue') ? value.issue : undefined;

  if (!isString(since) || parseVersion(since) === undefined) {
    return Result.err(
      '❌ `knownBroken.since` must be an exact `major.minor.patch`.',
    );
  }

  if (reason === '' || !isString(reason)) {
    return Result.err(
      [
        '❌ `knownBroken.reason` must say what broke.',
        '   It is the justification for the upper bound this adds to every',
        '   published `engines.node`, and it is the only place that reason is',
        '   written down.',
      ].join('\n'),
    );
  }

  return Result.ok({
    since,
    reason,
    issue: typeof issue === 'number' ? issue : null,
  });
};

/**
 * The major the `engines` range must stop below, or `undefined` for no upper
 * bound.
 *
 * Bounds are always at a major boundary. A patch-level bound (`<=26.3.1`) is
 * false the day 26.3.2 ships, and the thing being described — an
 * incompatibility with a Node release line — is a property of the major.
 */
const expectedCeiling = (config: NodeSupportConfig): number | undefined => {
  const broken =
    config.knownBroken === null
      ? undefined
      : parseVersion(config.knownBroken.since)?.major;

  if (broken !== undefined) return broken;

  if (config.policy !== 'major-ceiling') return undefined;

  const current = parseVersion(config.targets.current);

  return current === undefined ? undefined : current.major + 1;
};

const collectManifests = async (): Promise<
  Result<readonly Manifest[], string>
> => {
  const result = await glob(Array.from(manifestGlobs), {
    cwd: projectRootPath,
    ignore: ['**/node_modules/**'],
    absolute: true,
  });

  if (Result.isErr(result)) {
    return Result.err(
      `❌ Failed to list package.json files: ${unknownToString(result.value)}`,
    );
  }

  const manifests = await Promise.all(
    result.value.toSorted().map(async (absolutePath) => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const content = await fs.readFile(absolutePath, 'utf8');

      return {
        relativePath: path.relative(projectRootPath, absolutePath),
        absolutePath,
        content,
        parsed: parseJson(content),
      };
    }),
  );

  return Result.ok(manifests);
};

const checkManifest = (
  manifest: Manifest,
  expected: ExpectedFields,
): readonly Violation[] => [
  ...checkEnginesNode(manifest, expected),
  ...checkVoltaNode(manifest, expected),
  ...checkDevEnginesRuntime(manifest, expected),
];

const checkEnginesNode = (
  manifest: Manifest,
  expected: ExpectedFields,
): readonly Violation[] => {
  const declared = readStringAt(manifest.parsed, ['engines', 'node']);

  // A package that makes no claim has none to get wrong. Requiring `engines`
  // everywhere would mean adding it to thirty private applications that
  // nobody installs.
  if (declared === undefined || declared === expected.enginesNode) return [];

  return [
    {
      file: manifest.relativePath,
      detail: `engines.node is "${declared}", expected "${expected.enginesNode}".`,
      fix: rewriteStringAt(manifest, ['engines', 'node'], expected.enginesNode),
    },
  ];
};

const checkVoltaNode = (
  manifest: Manifest,
  expected: ExpectedFields,
): readonly Violation[] => {
  const declared = readStringAt(manifest.parsed, ['volta', 'node']);

  if (declared === undefined || declared === expected.voltaNode) return [];

  return [
    {
      file: manifest.relativePath,
      detail: `volta.node is "${declared}", expected "${expected.voltaNode}".`,
      fix: rewriteStringAt(manifest, ['volta', 'node'], expected.voltaNode),
    },
  ];
};

/**
 * `devEngines.runtime` is governed where it is declared, and required nowhere.
 *
 * Nothing declares it today, and adopting it is a bigger decision than it
 * looks: pnpm implements only `onFail: "download"` — `error`, `warn` and
 * `ignore` are read and ignored — and under `download` it treats the runtime
 * as a dependency, writing `node@runtime:^X.Y.Z` into `pnpm-lock.yaml` and
 * fetching Node itself on every install. So the field is either inert here or
 * it changes how the repository installs, and neither belongs in a check that
 * is meant to keep three existing fields honest.
 *
 * `volta.node` carries the same information in the meantime, and carries it
 * where it is read: `actions/setup-node` resolves
 * `node-version-file: 'package.json'` through `volta.node` first,
 * `devEngines.runtime` second.
 */
const checkDevEnginesRuntime = (
  manifest: Manifest,
  expected: ExpectedFields,
): readonly Violation[] => {
  const declared = readStringAt(manifest.parsed, [
    'devEngines',
    'runtime',
    'version',
  ]);

  if (declared === undefined || declared === expected.devEnginesRuntime) {
    return [];
  }

  return [
    {
      file: manifest.relativePath,
      detail: `devEngines.runtime.version is "${declared}", expected "${expected.devEnginesRuntime}".`,
      fix: rewriteStringAt(
        manifest,
        ['devEngines', 'runtime', 'version'],
        expected.devEnginesRuntime,
      ),
    },
  ];
};

/**
 * The workflow holds the matrix *keys*; this file holds the versions they
 * resolve to. Only the key list can drift, and only when a release line is
 * added or dropped — which is exactly when someone should be made to look at
 * the workflow.
 */
const checkWorkflowMatrix = async (
  config: NodeSupportConfig,
): Promise<readonly Violation[]> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const text = await Result.fromPromise(fs.readFile(workflowPath, 'utf8'));

  const relativePath = path.relative(projectRootPath, workflowPath);

  if (Result.isErr(text)) {
    return [{ file: relativePath, detail: 'could not be read.' }];
  }

  const match = /^ *target: *\[(?<entries>[^\]]*)\]/mu.exec(text.value);

  const entries = match?.groups?.['entries'];

  if (entries === undefined) {
    return [
      {
        file: relativePath,
        detail:
          'has no `target: [...]` matrix line for this check to compare against.',
      },
    ];
  }

  const declared = entries
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '');

  const wanted = Object.keys(config.targets);

  if (declared.join(',') === wanted.join(',')) return [];

  return [
    {
      file: relativePath,
      detail: `matrix targets are [${declared.join(', ')}], expected [${wanted.join(', ')}].`,
    },
  ];
};

const applyFixes = async (violations: readonly Violation[]): Promise<void> => {
  // One file can carry more than one violation — `engines.node` and
  // `volta.node` in the same manifest — so the fixes are grouped and applied
  // in one pass per file rather than each overwriting the last.
  const mut_byFile = new Map<string, readonly Violation['fix'][]>();

  for (const { fix } of violations) {
    if (fix === undefined) continue;

    mut_byFile.set(
      fix.absolutePath,
      Arr.toPushed(mut_byFile.get(fix.absolutePath) ?? [], fix),
    );
  }

  await Promise.all(
    Array.from(mut_byFile, async ([absolutePath, fixes]) => {
      const parsed = await readJsonFile(absolutePath);

      if (Result.isErr(parsed)) return;

      const updated = fixes.reduce<unknown>(
        (source, fix) =>
          fix === undefined
            ? source
            : setStringAt(source, fix.keyPath, fix.value),
        parsed.value,
      );

      // Written back as JSON rather than patched as text. These files belong to
      // Prettier — `prettier-plugin-packagejson` decides their key order and
      // spacing — so the shape it would produce anyway is the shape to write,
      // and `pnpm run fmt` after this is a no-op rather than a second diff.
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(
        absolutePath,
        `${JSON.stringify(updated, undefined, 2)}\n`,
      );
    }),
  );
};

const formatViolations = (
  violations: readonly Violation[],
  expected: ExpectedFields,
): string =>
  [
    `❌ ${violations.length} Node support violation(s):`,
    '',
    ...violations.map(
      (violation) => `  ${violation.file}\n    ${violation.detail}`,
    ),
    '',
    'Expected, derived from tools/configs/node-support.json:',
    `  engines.node             ${expected.enginesNode}`,
    `  volta.node               ${expected.voltaNode}`,
    `  devEngines.runtime       ${expected.devEnginesRuntime}`,
    '',
    'Run `pnpm run check:root:node-support --fix` to apply what is mechanical.',
    'Change the versions in tools/configs/node-support.json, never in the',
    'manifests: raising the `engines` floor is a breaking change for every',
    'consumer, and it is decided there.',
  ].join('\n');

/**
 * Records a fix for one string leaf of a `package.json`.
 *
 * `undefined` when the leaf is not there to begin with: the caller only asks
 * about fields it has already found, so this is the "cannot be rewritten
 * mechanically" case rather than a normal one.
 */
const rewriteStringAt = (
  manifest: Manifest,
  keyPath: readonly string[],
  value: string,
): Violation['fix'] =>
  readStringAt(manifest.parsed, keyPath) === undefined
    ? undefined
    : { absolutePath: manifest.absolutePath, keyPath, value };

/**
 * A copy of `source` with `keyPath` set to `value`, creating the objects along
 * the way. Nothing is mutated: the manifests are read once and the fixes are
 * folded over the result.
 */
const setStringAt = (
  source: unknown,
  keyPath: readonly string[],
  value: string,
): unknown => {
  const [head, ...tail] = keyPath;

  if (head === undefined) return value;

  const base = isRecord(source) ? source : {};

  return {
    ...base,
    [head]: setStringAt(
      hasKey(base, head) ? base[head] : undefined,
      tail,
      value,
    ),
  };
};

const readStringAt = (
  source: unknown,
  keyPath: readonly string[],
): string | undefined => {
  const walk = (current: unknown, rest: readonly string[]): unknown => {
    const [head, ...tail] = rest;

    if (head === undefined) return current;

    if (!isRecord(current) || !hasKey(current, head)) return undefined;

    return walk(current[head], tail);
  };

  const found = walk(source, keyPath);

  return isString(found) ? found : undefined;
};

/**
 * `JSON.parse` types its result `any`; this is the one place that widens it to
 * `unknown`, so that everything downstream has to guard rather than assert.
 */
const parseJson = (text: string): unknown => JSON.parse(text);

const readJsonFile = async (
  filePath: string,
): Promise<Result<unknown, string>> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const text = await Result.fromPromise(fs.readFile(filePath, 'utf8'));

  if (Result.isErr(text)) {
    return Result.err(
      `❌ Failed to read ${filePath}: ${unknownToString(text.value)}`,
    );
  }

  const parsed = Result.fromThrowable<unknown>(() => JSON.parse(text.value));

  return Result.isErr(parsed)
    ? Result.err(
        `❌ Failed to parse ${filePath}: ${unknownToString(parsed.value)}`,
      )
    : Result.ok(parsed.value);
};

if (isDirectlyExecuted(import.meta.url)) {
  const fix = process.argv.includes('--fix');

  const result = await checkNodeSupport({ fix }).catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  const { manifestCount, fixedCount } = result.value;

  console.info(
    fixedCount === 0
      ? `${manifestCount} package.json checked; engines, volta and devEngines agree with tools/configs/node-support.json.`
      : `${manifestCount} package.json checked; ${fixedCount} field(s) rewritten to match tools/configs/node-support.json.`,
  );
}
