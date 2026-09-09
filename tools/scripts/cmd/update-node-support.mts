import * as fs from 'node:fs/promises';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Num,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import {
  checkNodeSupport,
  compareVersions,
  nodeSupportConfigPath,
  parseVersion,
  readNodeSupportConfig,
  type NodeSupportConfig,
  type Version,
} from './check-node-support.mjs';

/**
 * Refreshes `tools/configs/node-support.json` from the Node.js release data,
 * then rewrites every `package.json` field derived from it.
 *
 * **`targets.minimum` is not refreshed.** It is the `engines.node` floor of
 * every published package, so moving it is a breaking change for consumers —
 * a decision, taken when a release line is dropped or an API is adopted, not
 * something a weekly job does because a patch shipped. Passing
 * `--allow-minimum-change` opts into it explicitly, and the summary says what
 * the new floor would be so the number can be reviewed before it is taken.
 *
 * That asymmetry is the whole point of running this on a schedule: `lts` and
 * `current` follow their lines automatically, so the top of what is tested
 * never goes stale, while the bottom — the only end with a published promise
 * attached — stays put.
 */
export const updateNodeSupport = async (
  options: Readonly<{ allowMinimumChange: boolean }>,
): Promise<Result<UpdateSummary, string>> => {
  const configResult = await readNodeSupportConfig();

  if (Result.isErr(configResult)) {
    return Result.err(configResult.value);
  }

  const config = configResult.value;

  const releasesResult = await fetchReleaseData();

  if (Result.isErr(releasesResult)) {
    return Result.err(releasesResult.value);
  }

  const releases = releasesResult.value;

  const desiredResult = desiredTargets(config, releases, options);

  if (Result.isErr(desiredResult)) {
    return Result.err(desiredResult.value);
  }

  const desired = desiredResult.value;

  const changes = (['minimum', 'lts', 'current'] as const)
    .map((key) => ({ key, from: config.targets[key], to: desired[key] }))
    .filter(({ from, to }) => from !== to);

  if (Arr.isNonEmpty(changes)) {
    await writeTargets(config, desired);
  }

  // Always run, changes or not: a manifest can drift from the config on its
  // own — a package added with the wrong floor, say — and this is the job
  // that would notice on a week when Node released nothing.
  const propagated = await checkNodeSupport({ fix: true });

  if (Result.isErr(propagated)) {
    return Result.err(propagated.value);
  }

  return Result.ok({
    changes,
    fixedCount: propagated.value.fixedCount,
    eolMinimum: eolLineOf(config.targets.minimum, releases),
  });
};

export type UpdateSummary = Readonly<{
  changes: readonly TargetChange[];
  fixedCount: number;
  /**
   * Set when the release line `targets.minimum` sits on has reached its end of
   * life. Reported rather than acted on: dropping a line is a breaking change,
   * and a line going EOL is not on its own a reason to stop letting consumers
   * install — it is a reason to stop testing it.
   */
  eolMinimum: string | undefined;
}>;

export type TargetChange = Readonly<{
  key: 'current' | 'lts' | 'minimum';
  from: string;
  to: string;
}>;

type ReleaseData = Readonly<{
  /** The newest release of each major line, by major. */
  latestByMajor: ReadonlyMap<number, Version>;
  /** Majors that carry an LTS codename. */
  ltsMajors: ReadonlySet<number>;
  /** Majors whose end-of-life date has passed. */
  eolMajors: ReadonlySet<number>;
}>;

const distIndexUrl = 'https://nodejs.org/dist/index.json';

const scheduleUrl =
  'https://raw.githubusercontent.com/nodejs/Release/main/schedule.json';

/**
 * Which release line each target should point at.
 *
 * - `current` — the newest line that has shipped a release.
 * - `lts` — the newest line below `current` that carries an LTS codename. The
 *   two lines are the same for the six months between a line becoming LTS and
 *   its successor shipping, which is why this looks strictly below `current`
 *   rather than taking the newest LTS line outright.
 * - `minimum` — left where it is, unless asked otherwise.
 */
const desiredTargets = (
  config: NodeSupportConfig,
  releases: ReleaseData,
  options: Readonly<{ allowMinimumChange: boolean }>,
): Result<NodeSupportConfig['targets'], string> => {
  const majors = Array.from(releases.latestByMajor.keys())
    .filter((major) => !releases.eolMajors.has(major))
    .toSorted((a, b) => b - a);

  const currentMajor = majors.at(0);

  if (currentMajor === undefined) {
    return Result.err('❌ The release data named no supported release line.');
  }

  const ltsMajor = majors.find(
    (major) => major < currentMajor && releases.ltsMajors.has(major),
  );

  if (ltsMajor === undefined) {
    return Result.err(
      `❌ No LTS line below Node ${String(currentMajor)} is still supported.`,
    );
  }

  const current = releases.latestByMajor.get(currentMajor);

  const lts = releases.latestByMajor.get(ltsMajor);

  if (current === undefined || lts === undefined) {
    return Result.err('❌ The release data is missing a line it just named.');
  }

  const minimum = options.allowMinimumChange
    ? lowestSupportedLts(releases, config)
    : config.targets.minimum;

  return Result.ok({
    minimum,
    lts: formatVersion(lts),
    current: formatVersion(current),
  });
};

/**
 * The oldest release line still supported, at its oldest known patch — the
 * floor a repository can honestly claim once it stops carrying the line below.
 *
 * The oldest patch, not the newest: the floor says "this is where support
 * starts", and pointing it at whatever patch shipped last week would claim
 * every earlier patch of the same line is unsupported.
 */
const lowestSupportedLts = (
  releases: ReleaseData,
  config: NodeSupportConfig,
): string => {
  const supportedLtsMajors = Array.from(releases.ltsMajors).filter(
    (major) => !releases.eolMajors.has(major),
  );

  if (!Arr.isNonEmpty(supportedLtsMajors)) return config.targets.minimum;

  const oldestSupportedLtsMajor = Math.min(...supportedLtsMajors);

  const currentMinimum = parseVersion(config.targets.minimum);

  // Never lower the floor by accident: widening what is supported is a real
  // change too, and it is not this job's to make.
  if (
    currentMinimum !== undefined &&
    currentMinimum.major >= oldestSupportedLtsMajor
  ) {
    return config.targets.minimum;
  }

  return `${String(oldestSupportedLtsMajor)}.0.0`;
};

const fetchReleaseData = async (): Promise<Result<ReleaseData, string>> => {
  const [distResult, scheduleResult] = await Promise.all([
    fetchJson(distIndexUrl),
    fetchJson(scheduleUrl),
  ]);

  if (Result.isErr(distResult)) return Result.err(distResult.value);

  if (Result.isErr(scheduleResult)) return Result.err(scheduleResult.value);

  const dist: unknown = distResult.value;

  if (!Arr.isArray(dist)) {
    return Result.err(`❌ ${distIndexUrl} did not return an array.`);
  }

  const mut_latestByMajor = new Map<number, Version>();

  const mut_ltsMajors = new Set<number>();

  const mut_newestReleaseDate = { current: '' };

  for (const entry of dist) {
    if (!isRecord(entry) || !hasKey(entry, 'version')) continue;

    const date: unknown = hasKey(entry, 'date') ? entry.date : undefined;

    if (isString(date) && date > mut_newestReleaseDate.current) {
      mut_newestReleaseDate.current = date;
    }

    const raw: unknown = entry.version;

    if (!isString(raw)) continue;

    const version = parseVersion(raw.replace(/^v/u, ''));

    if (version === undefined) continue;

    const known = mut_latestByMajor.get(version.major);

    if (known === undefined || compareVersions(known, version) < 0) {
      mut_latestByMajor.set(version.major, version);
    }

    // `lts` is the codename for an LTS release and `false` otherwise, so any
    // string marks the line as one that reached LTS.
    if (hasKey(entry, 'lts') && isString(entry.lts)) {
      mut_ltsMajors.add(version.major);
    }
  }

  return Result.ok({
    latestByMajor: mut_latestByMajor,
    ltsMajors: mut_ltsMajors,
    eolMajors: eolMajorsFrom(
      scheduleResult.value,
      mut_newestReleaseDate.current,
    ),
  });
};

/**
 * Which release lines have passed their end-of-life date, as of `today`.
 *
 * `today` is the date of the newest Node release rather than a wall clock, so
 * this script has no clock dependency at all: the same two inputs always give
 * the same output, which is what makes a scheduled job that opens pull
 * requests reviewable. The newest release is days old at worst, and the only
 * thing this feeds is a warning about a line going EOL — a boundary that moves
 * once every few years and is reported rather than acted on.
 *
 * Both sides are `YYYY-MM-DD`, so the comparison is a plain string comparison.
 */
const eolMajorsFrom = (
  schedule: unknown,
  today: string,
): ReadonlySet<number> => {
  const mut_eol = new Set<number>();

  if (today === '' || !isRecord(schedule)) return mut_eol;

  for (const [key, value] of Object.entries(schedule)) {
    const major = Result.unwrapOkOr(
      Num.safeParseInt(key.replace(/^v/u, '')),
      Number.NaN,
    );

    if (!Number.isSafeInteger(major) || !isRecord(value)) continue;

    const end: unknown = hasKey(value, 'end') ? value.end : undefined;

    if (isString(end) && end < today) {
      mut_eol.add(major);
    }
  }

  return mut_eol;
};

const eolLineOf = (
  version: string,
  releases: ReleaseData,
): string | undefined => {
  const parsed = parseVersion(version);

  return parsed !== undefined && releases.eolMajors.has(parsed.major)
    ? `${String(parsed.major)}.x`
    : undefined;
};

/**
 * Writes the refreshed targets back.
 *
 * Written back as JSON rather than patched as text: the file is Prettier's, and two
 * spaces with a trailing newline is what Prettier produces for it, so
 * `pnpm run fmt` after this changes nothing.
 */
const writeTargets = async (
  config: NodeSupportConfig,
  desired: NodeSupportConfig['targets'],
): Promise<void> => {
  const updated = { ...config, targets: desired };

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    nodeSupportConfigPath,
    `${JSON.stringify(updated, undefined, 2)}\n`,
  );
};

const fetchJson = async (url: string): Promise<Result<unknown, string>> => {
  const response = await Result.fromPromise(fetch(url));

  if (Result.isErr(response)) {
    return Result.err(
      `❌ Failed to fetch ${url}: ${unknownToString(response.value)}`,
    );
  }

  if (!response.value.ok) {
    return Result.err(
      `❌ Failed to fetch ${url}: HTTP ${String(response.value.status)}.`,
    );
  }

  const parsed = await Result.fromPromise(response.value.json());

  return Result.isErr(parsed)
    ? Result.err(`❌ ${url} did not return JSON.`)
    : Result.ok(parsed.value);
};

const formatVersion = (version: Version): string =>
  `${String(version.major)}.${String(version.minor)}.${String(version.patch)}`;

if (isDirectlyExecuted(import.meta.url)) {
  const allowMinimumChange = process.argv.includes('--allow-minimum-change');

  const result = await updateNodeSupport({ allowMinimumChange }).catch(
    (error: unknown) => Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  const { changes, fixedCount, eolMinimum } = result.value;

  if (eolMinimum !== undefined) {
    console.warn(
      [
        `⚠️  The engines floor sits on Node ${eolMinimum}, which has reached its end of life.`,
        '   Nothing is done about that here: dropping a line raises the floor,',
        '   which is a breaking change for consumers. Stop testing the line',
        '   first, and raise the floor with the next major release',
        '   (`--allow-minimum-change`).',
      ].join('\n'),
    );
  }

  if (fixedCount === 0 && !Arr.isNonEmpty(changes)) {
    console.info('Node support targets are already up to date.');
  } else {
    for (const { key, from, to } of changes) {
      console.info(`${key}: ${from} → ${to}`);
    }

    console.info(
      `${String(fixedCount)} package.json field(s) updated to match.`,
    );
  }
}
