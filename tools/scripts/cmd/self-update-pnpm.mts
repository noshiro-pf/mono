import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
// A top-level `import type`, not the inline `import { type … }` the lint
// prefers: Node erases the former and keeps the latter as a bare
// `import {} from 'ts-type-forge'`, which fails to resolve before
// `pnpm install`. The test's runtime-import check guards this.
// eslint-disable-next-line import-x/consistent-type-specifier-style -- see above.
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * Pins the newest pnpm that is already older than `minimumReleaseAge`.
 *
 * `pnpm self-update` ignores `minimumReleaseAge` by design and pins whatever
 * `latest` is into `packageManager`. It only rewrites the pin: the very next
 * pnpm command fetches that version through the registry like any other
 * package, and _that_ fetch honours the hold. So a pnpm release younger than
 * the hold made `pnpm-update.yml` succeed at `self-update` and die one step
 * later with `ERR_PNPM_NO_MATURE_MATCHING_VERSION`, every day until the
 * release matured (2026-09-11, pnpm 12.4.1 one day old). Excluding `pnpm`
 * from the hold would exempt the one package that runs every install script
 * in the tree; this picks a version the hold already accepts instead and
 * hands it to `pnpm self-update <version>`, which is idempotent when the pin
 * already says so.
 *
 * The standalone pnpm binary does not reproduce the failure — it switches
 * versions by another route — which is why a local `pnpm self-update` passes.
 * CI runs the JS build that `pnpm/action-setup` installs with npm, and that
 * one adds the `pnpm` npm package to switch, `@pnpm/exe.*` optional
 * dependencies and all.
 *
 * **Run with `node`, not `tsx`.** The workflow calls this before
 * `pnpm install`, so nothing from `node_modules` exists yet — no `tsx`, no
 * `ts-repo-utils`, no `ts-data-forge`. Node runs `.mts` directly by stripping
 * the types, which is why this file imports only `node:*` modules and uses
 * only erasable syntax (no `enum`, no parameter properties, no namespaces).
 * The same constraint is why version segments stay digit strings compared by
 * length and then lexically (the `ts-data-forge` rules object to `Number()`
 * and `parseInt`, and the helper they want is not there to import), and why
 * the two `eslint-disable` lines below exist. The test runs the file under
 * `node` against a fake `pnpm` to keep all of this true.
 *
 * `pnpm config get` reads `minimumReleaseAge` from `pnpm-workspace.yaml`, so
 * the cutoff cannot disagree with the one the next install applies.
 */
export const selfUpdatePnpm = (
  now: number = Temporal.Now.instant().epochMilliseconds,
): void => {
  const minutes = pnpmStdout(['config', 'get', 'minimumReleaseAge']);

  const cutoff = now - minutesToMilliseconds(minutes);

  const metadata = readPnpmRegistryMetadata();

  const selection = selectMaturePnpmVersion(metadata, cutoff);

  if (selection === undefined) {
    console.error(
      `No stable pnpm release is older than minimumReleaseAge (${minutes} min).`,
    );

    process.exit(1);
  }

  const { target, heldBack } = selection;

  const cutoffText = Temporal.Instant.fromEpochMilliseconds(cutoff).toString();

  console.log(`minimumReleaseAge: ${minutes} min (cutoff ${cutoffText})`);

  console.log(`Newest mature pnpm: ${target}`);

  console.log(`Held back by minimumReleaseAge: [${heldBack.join(', ')}]`);

  execFileSync('pnpm', ['self-update', target], { stdio: 'inherit' });
};

/**
 * The newest stable pnpm published at or before `cutoff` (epoch ms), and the
 * stable versions newer than it that the hold keeps back. `undefined` when no
 * stable version is old enough. A version whose publish time is missing or
 * unreadable is skipped — age unknown is not age proven.
 */
export const selectMaturePnpmVersion = (
  metadata: RegistryMetadata,
  cutoff: number,
): Readonly<{ target: string; heldBack: readonly string[] }> | undefined => {
  const stable = metadata.versions
    .map((version) => ({ version, parsed: parseStableVersion(version) }))
    .filter(
      (entry): entry is Readonly<{ version: string; parsed: StableVersion }> =>
        entry.parsed !== undefined,
    )
    .toSorted((a, b) => compareVersions(a.parsed, b.parsed));

  const mature = stable.filter(({ version }) => {
    const publishedAt = toEpochMilliseconds(metadata.time[version]);

    return publishedAt !== undefined && publishedAt <= cutoff;
  });

  const newest = mature.at(-1);

  if (newest === undefined) {
    return undefined;
  }

  return {
    target: newest.version,
    heldBack: stable
      .filter(({ parsed }) => compareVersions(parsed, newest.parsed) > 0)
      .map(({ version }) => version),
  };
};

/** `x.y.z` and nothing else — a prerelease or a tag is not a candidate. */
export const parseStableVersion = (
  version: string,
): StableVersion | undefined => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/u.exec(version);

  if (match === null) {
    return undefined;
  }

  const [, major, minor, patch] = match;

  if (major === undefined || minor === undefined || patch === undefined) {
    return undefined;
  }

  return { major, minor, patch };
};

export const compareVersions = (a: StableVersion, b: StableVersion): number => {
  const major = compareDigits(a.major, b.major);

  if (major !== 0) {
    return major;
  }

  const minor = compareDigits(a.minor, b.minor);

  return minor !== 0 ? minor : compareDigits(a.patch, b.patch);
};

/** What `pnpm view pnpm versions time --json` answers. */
export type RegistryMetadata = Readonly<{
  versions: readonly string[];
  time: ReadonlyRecord<string, unknown>;
}>;

/**
 * Digit strings, as the regex captured them. Semver forbids leading zeros, so
 * a longer run is a larger number and equal-length runs compare lexically.
 */
export type StableVersion = Readonly<{
  major: string;
  minor: string;
  patch: string;
}>;

const compareDigits = (a: string, b: string): number =>
  a.length !== b.length ? a.length - b.length : a < b ? -1 : a > b ? 1 : 0;

/** `minimumReleaseAge` is minutes; anything unparsable counts as no hold. */
const minutesToMilliseconds = (minutes: string): number => {
  try {
    return Temporal.Duration.from(`PT${minutes}M`).total('milliseconds');
  } catch {
    return 0;
  }
};

const readPnpmRegistryMetadata = (): RegistryMetadata => {
  const raw: unknown = JSON.parse(
    pnpmStdout(['view', 'pnpm', 'versions', 'time', '--json']),
  );

  const metadata = parseRegistryMetadata(raw);

  if (metadata === undefined) {
    throw new Error(
      '`pnpm view pnpm versions time --json` did not return { versions: string[], time: object }.',
    );
  }

  return metadata;
};

const parseRegistryMetadata = (raw: unknown): RegistryMetadata | undefined => {
  if (!isRecord(raw)) {
    return undefined;
  }

  const { versions, time } = raw;

  // eslint-disable-next-line ts-data-forge/prefer-arr-is-array -- ts-data-forge is not installed when this runs (see the header).
  if (!Array.isArray(versions) || !versions.every(isString)) {
    return undefined;
  }

  if (!isRecord(time)) {
    return undefined;
  }

  return { versions, time };
};

const isRecord = (value: unknown): value is ReadonlyRecord<string, unknown> =>
  // eslint-disable-next-line ts-data-forge/prefer-is-non-null-object -- ts-data-forge is not installed when this runs (see the header).
  typeof value === 'object' && value !== null;

const isString = (value: unknown): value is string => typeof value === 'string';

const toEpochMilliseconds = (value: unknown): number | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  try {
    return Temporal.Instant.from(value).epochMilliseconds;
  } catch {
    return undefined;
  }
};

/** Stdout only; stderr goes through, so a pnpm warning is seen and not parsed. */
const pnpmStdout = (args: readonly string[]): string =>
  execFileSync('pnpm', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  }).trim();

/**
 * `isDirectlyExecuted` from `ts-repo-utils`, inlined: that package is not
 * installed when this runs (see the header).
 */
const isDirectlyExecuted = (fileUrl: string): boolean =>
  process.argv[1] !== undefined &&
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.realpathSync(fileURLToPath(fileUrl)) === fs.realpathSync(process.argv[1]);

if (isDirectlyExecuted(import.meta.url)) {
  selfUpdatePnpm();
}
