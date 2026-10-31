import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
// A top-level `import type`, not the inline `import { type … }` the lint
// prefers: Node erases the former and keeps the latter as a bare
// `import {} from 'ts-type-forge'`, which fails to resolve before
// `pnpm install`. The test's runtime-import check guards this.
import type { MutableRecord, ReadonlyRecord, StrictOmit } from 'ts-type-forge';
// Erased the same way: the module itself imports packages this cannot load.
import type { ReleaseBinaryPin } from '../lib/release-binaries.mjs';

/**
 * The three updates `pnpm-update.yml` makes that pnpm's own `minimumReleaseAge`
 * does not reach, held to the same age it applies to npm dependencies.
 *
 * ```sh
 * node ./tools/scripts/cmd/mature-updates.mts pnpm              # pnpm itself
 * node ./tools/scripts/cmd/mature-updates.mts actions           # the action pins
 * node ./tools/scripts/cmd/mature-updates.mts release-binaries  # tools/configs/release-binaries.json
 * node ./tools/scripts/cmd/mature-updates.mts release-binaries --to actionlint@2.0.0  # by hand
 * ```
 *
 * **`pnpm`** pins the newest pnpm that is already older than the hold.
 * `pnpm self-update` ignores `minimumReleaseAge` by design and pins whatever
 * `latest` is into `packageManager`. It only rewrites the pin: the very next
 * pnpm command fetches that version through the registry like any other
 * package, and _that_ fetch honours the hold. So a pnpm release younger than
 * the hold made the job succeed at `self-update` and die one step later with
 * `ERR_PNPM_NO_MATURE_MATCHING_VERSION`, every day until the release matured
 * (2026-09-11, pnpm 12.4.1 one day old). Excluding `pnpm` from the hold would
 * exempt the one package that runs every install script in the tree; this picks
 * a version the hold already accepts instead and hands it to
 * `pnpm self-update <version>`, which is idempotent when the pin already says
 * so. The standalone pnpm binary does not reproduce the failure — it switches
 * versions by another route — which is why a local `pnpm self-update` passes;
 * CI runs the JS build that `pnpm/action-setup` installs with npm, and that one
 * adds the `pnpm` npm package to switch, `@pnpm/exe.*` optional dependencies
 * and all.
 *
 * **`actions`** moves every `uses: owner/repo@<sha> # vX.Y.Z` pin in the
 * workflows (`.github/workflows/*.yml`) and in the composite actions they call
 * (an `action.yml` at any depth under `.github/actions/`) to the newest release
 * of the same major that is older than the hold. A pin anywhere else is not
 * read, and nothing says so: it simply stops moving.
 * `pnpm update --include-github-actions` cannot apply the hold: it resolves
 * action versions from `git ls-remote` refs, which carry a tag name and a SHA
 * but no publication date. GitHub's Releases API carries `published_at`, so
 * that is what this reads, and the tag is resolved to its commit through the
 * Commits API — the same SHA pin pnpm writes. A major still waits for a human,
 * as before; it is reported, not taken. Set `GH_TOKEN` (the workflow passes
 * `GITHUB_TOKEN`) or the unauthenticated rate limit, shared across a runner's
 * whole IP range, will be hit.
 *
 * **`release-binaries`** moves each tool in
 * `tools/configs/release-binaries.json` (actionlint and shellcheck, which
 * `check:root:actionlint` downloads) to the newest release older than the hold,
 * within its line: the range a caret draws, so the major, or for a `0.x`
 * version the minor (a `0.0.x` one never moves on its own). So actionlint 1.x
 * moves on its own and 2.0 waits for a human; shellcheck 0.11.x moves on its
 * own and 0.12 waits. The tag is `v<version>`, and each platform's new SHA-256
 * is the `digest` the Releases
 * API reports for that asset. The hold applies to each asset's upload too,
 * since a file can be replaced long after its release was published. A release
 * that cannot be taken — an asset missing or without a digest (a warning), or
 * uploaded too recently — gives way to the next one down the line, never to an
 * unverified pin. A new tool goes in the file with the same shape and needs
 * nothing here.
 *
 * **`release-binaries --to <tool>@<x.y.z>`** is the move that waits for a
 * human: it pins that one tool to that version, in any line (actionlint 2.0,
 * shellcheck 0.12, or back down), with every platform's digest read from the
 * Releases API as above, and leaves every other tool as it is. The hold still
 * applies — the release and each asset must be older than the cutoff, and a
 * prerelease is refused — and anything it refuses fails the run with the file
 * untouched, since a person asked for exactly that version. The same version
 * again changes nothing, and refuses a digest that differs from the
 * API's: a replaced upload is exactly what a pin is there to notice, and is
 * reported rather than re-pinned. A release that renamed its assets needs the
 * `name` templates in the file edited first; the refusal names the asset it
 * looked for. A pin moved down is moved up again by the next scheduled run, to
 * the newest mature release of the line it is now on: the file records no hold.
 *
 * **Run with `node`, not `tsx`.** The workflow calls this before
 * `pnpm install`, so nothing from `node_modules` exists yet — no `tsx`, no
 * `ts-repo-utils`, no `ts-data-forge`. Node runs `.mts` directly by stripping
 * the types, which is why this file imports only `node:*` modules at runtime
 * and uses only erasable syntax (no `enum`, no parameter properties, no
 * namespaces). The same constraint is why version segments stay digit strings
 * compared by length and then lexically (the `ts-data-forge` rules object to
 * `Number()` and `parseInt`, and the helper they want is not there to import),
 * and why the `eslint-disable` lines below exist. `Temporal` is what Node 26
 * has, so the script needs the Node the workflow runs on (`volta.node`), not
 * the floor of the compatibility matrix. The test runs the file under `node`
 * against a fake `pnpm` and a fake GitHub API to keep all of this true.
 *
 * `pnpm config get` reads `minimumReleaseAge` from `pnpm-workspace.yaml`, so
 * the cutoff cannot disagree with the one the next install applies.
 */
export const main = async (argv: readonly string[]): Promise<void> => {
  const command = argv[2];

  switch (command) {
    case 'pnpm': {
      selfUpdatePnpm();

      break;
    }

    case 'actions': {
      await updateActionPins();

      break;
    }

    case 'release-binaries': {
      // eslint-disable-next-line ts-data-forge/prefer-canonical-array-slicing -- ts-data-forge is not installed when this runs (see the header).
      const to = parseToOption(argv.slice(3));

      if (to === 'invalid') {
        console.error(releaseBinariesUsage);

        process.exit(2);
      }

      const refused = await updateReleaseBinaryPins(
        to === undefined ? {} : { to },
      );

      if (refused !== undefined) {
        console.error(`❌ ${refused}`);

        process.exit(1);
      }

      break;
    }

    case undefined:
    default: {
      console.error(
        'Usage: node mature-updates.mts <pnpm | actions | release-binaries [--to <tool>@<x.y.z>]>',
      );

      process.exit(2);
    }
  }
};

// ---------------------------------------------------------------------------
// `pnpm`
// ---------------------------------------------------------------------------

export const selfUpdatePnpm = (
  now: number = Temporal.Now.instant().epochMilliseconds,
): void => {
  const hold = readMinimumReleaseAge();

  const cutoff = now - hold.milliseconds;

  const metadata = readPnpmRegistryMetadata();

  const selection = selectMaturePnpmVersion(metadata, cutoff);

  if (selection === undefined) {
    console.error(
      `No stable pnpm release is older than minimumReleaseAge (${hold.minutes} min).`,
    );

    process.exit(1);
  }

  const { target, heldBack } = selection;

  console.log(describeHold(hold, cutoff));

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

/** What `pnpm view pnpm versions time --json` answers. */
export type RegistryMetadata = Readonly<{
  versions: readonly string[];
  time: ReadonlyRecord<string, unknown>;
}>;

/**
 * Among `releases`, the newest on the same line as `currentTag` that is newer
 * than it and was published at or before `cutoff`; the same-line releases the
 * hold keeps back (newer than the chosen one, or than the current pin when
 * nothing is chosen); and the newer lines that wait for a human. Drafts and
 * prereleases are not candidates. A line is the major unless `lineOf` says
 * otherwise.
 */
export const selectMatureRelease = (
  releases: readonly Release[],
  currentTag: string,
  cutoff: number,
  lineOf: (version: StableVersion) => string = ({ major }) => major,
): ReleaseSelection => {
  const current = parseStableVersion(stripTagPrefix(currentTag));

  if (current === undefined) {
    return { target: undefined, heldBack: [], linesWaiting: [] };
  }

  const stable = releases
    .filter(isStableRelease)
    .map((release) => ({
      release,
      parsed: parseStableVersion(stripTagPrefix(release.tag)),
    }))
    .filter(
      (entry): entry is Readonly<{ release: Release; parsed: StableVersion }> =>
        entry.parsed !== undefined,
    )
    .toSorted((a, b) => compareVersions(a.parsed, b.parsed));

  const currentLine = lineOf(current);

  const newer = stable.filter(
    ({ parsed }) => compareVersions(parsed, current) > 0,
  );

  const newerSameLine = newer.filter(
    ({ parsed }) => lineOf(parsed) === currentLine,
  );

  const mature = newerSameLine.filter(({ release }) =>
    isPublishedBy(release, cutoff),
  );

  const target = mature.at(-1);

  const floor = target?.parsed ?? current;

  return {
    target: target?.release.tag,
    heldBack: newerSameLine
      .filter(({ parsed }) => compareVersions(parsed, floor) > 0)
      .map(({ release }) => release.tag),
    // `newer` is in ascending order, and so are the lines taken from it.
    // eslint-disable-next-line ts-data-forge/prefer-arr-uniq -- ts-data-forge is not installed when this runs (see the header).
    linesWaiting: Array.from(
      new Set(
        newer
          .map(({ parsed }) => lineOf(parsed))
          .filter((line) => line !== currentLine),
      ),
    ),
  };
};

/**
 * The line a release-binary pin moves within: the range a caret puts around it.
 * Its major; for a `0.x` version, `0.<minor>`; for a `0.0.x` one, the version
 * itself, which then never moves on its own.
 *
 * `pnpm-update.yml`'s `commit` job repeats this rule inline in jq to check the
 * pins it is handed, together with the `v<version>` tag and what
 * {@link readAssetDigests} accepts; change that jq with any of them.
 */
export const releaseLine = ({ major, minor, patch }: StableVersion): string =>
  major !== '0'
    ? major
    : minor !== '0'
      ? (`0.${minor}` as const)
      : (`0.0.${patch}` as const);

/**
 * `uses: owner/repo[/path]@<40-hex sha> # vX.Y.Z` — the shape
 * `pnpm update --include-github-actions` writes and the only one this moves.
 * A local workflow (`./…`), a bare tag, or a pin without the version comment is
 * left alone.
 */
export const parseActionPinLine = (
  line: string,
): StrictOmit<ActionPin, 'file' | 'line'> | undefined => {
  const match =
    /^(\s*-?\s*uses:\s+)(\S+)@([0-9a-f]{40})\s+#\s*(v?\d+\.\d+\.\d+)\s*$/u.exec(
      line,
    );

  if (match === null) {
    return undefined;
  }

  const [, prefix, reference, sha, tag] = match;

  if (
    prefix === undefined ||
    reference === undefined ||
    sha === undefined ||
    tag === undefined
  ) {
    return undefined;
  }

  const [owner, name, ...rest] = reference.split('/');

  if (
    owner === undefined ||
    name === undefined ||
    !isRepositorySegment(owner) ||
    !isRepositorySegment(name)
  ) {
    return undefined;
  }

  return {
    prefix,
    repo: `${owner}/${name}`,
    subpath: rest.map((segment) => `/${segment}`).join(''),
    sha,
    tag,
  };
};

export const renderActionPin = (
  pin: StrictOmit<ActionPin, 'file' | 'line'>,
): string =>
  `${pin.prefix}${pin.repo}${pin.subpath}@${pin.sha} # ${pin.tag}` as const;

export const compareVersions = (a: StableVersion, b: StableVersion): number => {
  const major = compareDigits(a.major, b.major);

  if (major !== 0) {
    return major;
  }

  const minor = compareDigits(a.minor, b.minor);

  return minor !== 0 ? minor : compareDigits(a.patch, b.patch);
};

// ---------------------------------------------------------------------------
// `actions`
// ---------------------------------------------------------------------------

export const updateActionPins = async (
  options: Readonly<{
    githubDir?: string;
    api?: GitHubApi;
    now?: number;
  }> = {},
): Promise<void> => {
  const githubDir = options.githubDir ?? path.join(process.cwd(), '.github');

  const api = options.api ?? createGitHubApi();

  const now = options.now ?? Temporal.Now.instant().epochMilliseconds;

  const hold = readMinimumReleaseAge();

  const cutoff = now - hold.milliseconds;

  console.log(describeHold(hold, cutoff));

  const pins = readActionPins(githubDir);

  const groups = Object.groupBy(pins, (pin) => `${pin.repo}@${pin.tag}`);

  const mut_updates: ActionPinUpdate[] = [];

  for (const group of Object.values(groups)) {
    const first = group?.[0];

    if (group === undefined || first === undefined) {
      continue;
    }

    const releases = await api.releases(first.repo, first.tag);

    const selection = selectMatureRelease(releases, first.tag, cutoff);

    console.log(describeSelection(first, selection));

    if (selection.target === undefined) {
      continue;
    }

    const sha = await api.commitSha(first.repo, selection.target);

    mut_updates.push(
      ...group.map((pin) => ({ pin, tag: selection.target ?? '', sha })),
    );
  }

  for (const [file, fileUpdates] of Object.entries(
    Object.groupBy(mut_updates, ({ pin }) => pin.file),
  )) {
    if (fileUpdates === undefined) {
      continue;
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- files found by `listPinnedFiles`.
    const lines = fs.readFileSync(file, 'utf8').split('\n');

    const rewritten = fileUpdates.reduce(
      (acc, { pin, tag, sha }) =>
        acc.with(pin.line, renderActionPin({ ...pin, tag, sha })),
      lines,
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- files found by `listPinnedFiles`.
    fs.writeFileSync(file, rewritten.join('\n'));
  }

  console.log(`Moved ${mut_updates.length} action pin(s).`);
};

export type ActionPin = Readonly<{
  /** Absolute path of the workflow or `action.yml`. */
  file: string;
  /** Zero-based line index within `file`. */
  line: number;
  /** Everything before the action reference, e.g. `      - uses: `. */
  prefix: string;
  /** `owner/repo`. */
  repo: string;
  /** `/path` inside the repository, or `''`. */
  subpath: string;
  sha: string;
  /** The version comment, as written (`v7.0.1`). */
  tag: string;
}>;

export type Release = Readonly<{
  tag: string;
  publishedAt: string | undefined;
  draft: boolean;
  prerelease: boolean;
  assets: readonly ReleaseAsset[];
}>;

export type ReleaseAsset = Readonly<{
  name: string;
  /** `sha256:<hex>`, as the Releases API reports it; absent on old uploads. */
  digest: string | undefined;
  /** When the file was last uploaded, which can be long after `publishedAt`. */
  updatedAt: string | undefined;
}>;

export type ReleaseSelection = Readonly<{
  target: string | undefined;
  heldBack: readonly string[];
  linesWaiting: readonly string[];
}>;

export type GitHubApi = Readonly<{
  /**
   * The repository's releases, newest first, fetched at least as far back as
   * `currentTag` so that everything newer than it is in hand.
   */
  releases: (repo: string, currentTag: string) => Promise<readonly Release[]>;
  /** The commit a tag points at — peeled, so an annotated tag is fine. */
  commitSha: (repo: string, tag: string) => Promise<string>;
  /** The release `tag` names, or `undefined` when there is none. */
  releaseByTag: (repo: string, tag: string) => Promise<Release | undefined>;
}>;

type ActionPinUpdate = Readonly<{ pin: ActionPin; tag: string; sha: string }>;

/** `release-binaries --to <tool>@<x.y.z>`. */
export type ReleaseBinaryTarget = Readonly<{ name: string; version: string }>;

const releaseBinariesUsage =
  'Usage: node mature-updates.mts release-binaries [--to <tool>@<x.y.z>]';

// ---------------------------------------------------------------------------
// `release-binaries`
// ---------------------------------------------------------------------------

export const updateReleaseBinaryPins = async (
  options: Readonly<{
    configPath?: string;
    api?: GitHubApi;
    now?: number;
    /** The one tool to pin, and the version, chosen by hand. */
    to?: ReleaseBinaryTarget;
  }> = {},
): Promise<string | undefined> => {
  const configPath =
    options.configPath ??
    path.join(process.cwd(), 'tools', 'configs', 'release-binaries.json');

  const api = options.api ?? createGitHubApi();

  const now = options.now ?? Temporal.Now.instant().epochMilliseconds;

  const hold = readMinimumReleaseAge();

  const cutoff = now - hold.milliseconds;

  console.log(describeHold(hold, cutoff));

  const tools = parseReleaseBinaryPins(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the pin file.
    JSON.parse(fs.readFileSync(configPath, 'utf8')),
  );

  if (options.to !== undefined) {
    return pinByHand(configPath, tools, options.to, api, cutoff);
  }

  const mut_next: MutableRecord<string, unknown> = {};

  const mut_moved: string[] = [];

  for (const { name, pin, raw } of tools) {
    const currentTag = `v${pin.version}` as const;

    // Only `v<version>` tags: that is the tag the download URL is built from
    // (`tools/scripts/lib/release-binaries.mts`).
    const fetched = await api.releases(pin.repository, currentTag);

    const releases = fetched.filter(({ tag }) => tag.startsWith('v'));

    const move = findMove(name, pin, releases, cutoff);

    // The move actually made, and everything newer on the line as held back —
    // what the hold kept and what `findMove` could not take, the lines it
    // printed saying why. With no cutoff, nothing newer is taken.
    console.log(
      describeMove(`${name} (${pin.repository})`, currentTag, {
        ...selectMatureRelease(
          releases,
          move?.release.tag ?? currentTag,
          Number.NEGATIVE_INFINITY,
          releaseLine,
        ),
        target: move?.release.tag,
      }),
    );

    mut_next[name] =
      move === undefined ? raw : movePin(raw, move.release.tag, move.digests);

    if (move !== undefined) {
      mut_moved.push(name);
    }
  }

  // eslint-disable-next-line ts-data-forge/prefer-canonical-length-guard -- ts-data-forge is not installed when this runs (see the header).
  if (mut_moved.length > 0) {
    writePins(configPath, mut_next);
  }

  console.log(`Moved ${mut_moved.length} release-binary pin(s).`);

  return undefined;
};

// ---------------------------------------------------------------------------
// shared
// ---------------------------------------------------------------------------

/** `x.y.z` and nothing else — a prerelease or a tag is not a candidate. */
export const parseStableVersion = (
  version: string,
): StableVersion | undefined => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/u.exec(version);

  if (match === null) {
    return undefined;
  }

  const [, major, minor, patch] = match;

  return major === undefined || minor === undefined || patch === undefined
    ? undefined
    : { major, minor, patch };
};

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

/** Neither a draft nor a prerelease: what a pin may move to. */
const isStableRelease = (release: Release): boolean =>
  !release.draft && !release.prerelease;

/** Published at or before `cutoff`, which a release with no date is not. */
const isPublishedBy = (release: Release, cutoff: number): boolean => {
  const publishedAt = toEpochMilliseconds(release.publishedAt);

  return publishedAt !== undefined && publishedAt <= cutoff;
};

/**
 * Digit strings, as the regex captured them. Semver forbids leading zeros, so a
 * longer run is a larger number and equal-length runs compare lexically.
 */
export type StableVersion = Readonly<{
  major: string;
  minor: string;
  patch: string;
}>;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const isRecord = (value: unknown): value is ReadonlyRecord<string, unknown> =>
  // eslint-disable-next-line ts-data-forge/prefer-is-non-null-object -- ts-data-forge is not installed when this runs (see the header).
  typeof value === 'object' && value !== null;

const isListOfStrings = (value: unknown): value is readonly string[] =>
  // eslint-disable-next-line ts-data-forge/prefer-arr-is-array -- ts-data-forge is not installed when this runs (see the header).
  Array.isArray(value) && value.every((v) => typeof v === 'string');

const parseRegistryMetadata = (raw: unknown): RegistryMetadata | undefined => {
  if (!isRecord(raw)) {
    return undefined;
  }

  const { versions, time } = raw;

  return !isListOfStrings(versions) || !isRecord(time)
    ? undefined
    : { versions, time };
};

/** Stdout only; stderr goes through, so a pnpm warning is seen and not parsed. */
const pnpmStdout = (args: readonly string[]): string =>
  execFileSync('pnpm', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  }).trim();

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

const isRepositorySegment = (segment: string): boolean =>
  /^[\w.-]+$/u.test(segment);

/**
 * Where a pin can be: the workflows, which GitHub reads from
 * `.github/workflows/` alone, and the composite actions, which can live
 * anywhere in the tree and are kept under `.github/actions/` so that this finds
 * them. `pnpm-update.yml` allows the same two sets of paths in the patch its
 * `commit` job applies; a third place has to be added to both.
 */
const listPinnedFiles = (githubDir: string): readonly string[] => {
  const workflowsDir = path.join(githubDir, 'workflows');

  const actionsDir = path.join(githubDir, 'actions');

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- the workflows directory.
  const workflows = fs
    .readdirSync(workflowsDir)
    .filter((name) => /\.ya?ml$/u.test(name))
    .map((name) => path.join(workflowsDir, name));

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- the actions directory.
  const hasActions = fs.existsSync(actionsDir);

  const actions = hasActions
    ? // eslint-disable-next-line security/detect-non-literal-fs-filename -- the actions directory.
      fs
        .readdirSync(actionsDir, { encoding: 'utf8', recursive: true })
        .filter((name) => /^action\.ya?ml$/u.test(path.basename(name)))
        .map((name) => path.join(actionsDir, name))
    : ([] as const);

  return [...workflows, ...actions].toSorted();
};

const readActionPins = (githubDir: string): readonly ActionPin[] =>
  listPinnedFiles(githubDir).flatMap((file) =>
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a workflow or an `action.yml`.
    fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .flatMap((text, line) => {
        const pin = parseActionPinLine(text);

        return pin === undefined ? [] : [{ ...pin, file, line }];
      }),
  );

const describeMove = (
  subject: string,
  currentTag: string,
  selection: ReleaseSelection,
): string => {
  const move =
    selection.target === undefined
      ? (`${currentTag} unchanged` as const)
      : (`${currentTag} -> ${selection.target}` as const);

  const heldBack =
    `held back by minimumReleaseAge: [${selection.heldBack.join(', ')}]` as const;

  const majors =
    `newer lines waiting for a human: [${selection.linesWaiting.join(', ')}]` as const;

  return `${subject}: ${move} (${heldBack}; ${majors})`;
};

const describeSelection = (
  pin: ActionPin,
  selection: ReleaseSelection,
): string => describeMove(pin.repo, pin.tag, selection);

const stripTagPrefix = (tag: string): string => tag.replace(/^v/u, '');

const isListOfRecords = (
  value: unknown,
): value is readonly ReadonlyRecord<string, unknown>[] =>
  // eslint-disable-next-line ts-data-forge/prefer-arr-is-array -- ts-data-forge is not installed when this runs (see the header).
  Array.isArray(value) && value.every(isRecord);

const parseRelease = (raw: ReadonlyRecord<string, unknown>): Release =>
  ({
    tag: typeof raw['tag_name'] === 'string' ? raw['tag_name'] : ('' as const),
    publishedAt:
      typeof raw['published_at'] === 'string' ? raw['published_at'] : undefined,
    draft: raw['draft'] === true,
    prerelease: raw['prerelease'] === true,
    assets: isListOfRecords(raw['assets'])
      ? raw['assets'].map((asset) => ({
          name: typeof asset['name'] === 'string' ? asset['name'] : '',
          digest:
            typeof asset['digest'] === 'string' ? asset['digest'] : undefined,
          updatedAt:
            typeof asset['updated_at'] === 'string'
              ? asset['updated_at']
              : undefined,
        }))
      : ([] as const),
  }) as const;

/**
 * Not `libs/pr-merge-queue/src/lib/github-api.mts`, which every other command calls the
 * API through: it imports `ts-data-forge`, and this runs before `pnpm install`
 * (see `main`). The token is read in the same order.
 */
const createGitHubApi = (): GitHubApi => {
  const baseUrl = (
    process.env['GITHUB_API_URL'] ?? 'https://api.github.com'
  ).replace(/\/$/u, '');

  const token = process.env['GH_TOKEN'] ?? process.env['GITHUB_TOKEN'];

  /** The answer to `GET route`, or `undefined` for a 404 when `notFound` allows it. */
  const request = async (
    route: string,
    accept: string,
    notFound: 'throw' | 'undefined' = 'throw',
  ): Promise<Readonly<{ text: string; lastPage: boolean }> | undefined> => {
    const response = await fetch(`${baseUrl}${route}`, {
      headers: {
        Accept: accept,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(token === undefined ? {} : { Authorization: `Bearer ${token}` }),
      },
    });

    if (notFound === 'undefined' && response.status === 404) {
      return undefined;
    }

    if (!response.ok) {
      throw new Error(
        `GET ${route} answered ${response.status} ${response.statusText}: ${await response.text()}`,
      );
    }

    const link = response.headers.get('link') ?? '';

    return {
      text: await response.text(),
      lastPage: !link.includes('rel="next"'),
    };
  };

  /** `request`, for the routes where a 404 is an error. */
  const requestFound = async (
    route: string,
    accept: string,
  ): Promise<Readonly<{ text: string; lastPage: boolean }>> => {
    const answer = await request(route, accept);

    // Unreachable: with `'throw'`, a 404 has thrown above. Here for the type.
    if (answer === undefined) {
      throw new Error(`GET ${route} answered 404.`);
    }

    return answer;
  };

  const releasesPage = async (
    repo: string,
    page: number,
  ): Promise<Readonly<{ releases: readonly Release[]; lastPage: boolean }>> => {
    const { text, lastPage } = await requestFound(
      `/repos/${repo}/releases?per_page=100&page=${page}`,
      'application/vnd.github+json',
    );

    const raw: unknown = JSON.parse(text);

    if (!isListOfRecords(raw)) {
      throw new Error(`GET /repos/${repo}/releases did not return a list.`);
    }

    return { releases: raw.map(parseRelease), lastPage };
  };

  return {
    releases: async (repo, currentTag) => {
      const current = parseStableVersion(stripTagPrefix(currentTag));

      const mut_collected: Release[] = [];

      for (let mut_page = 1; mut_page <= maxReleasePages; mut_page += 1) {
        const { releases, lastPage } = await releasesPage(repo, mut_page);

        mut_collected.push(...releases);

        const reachedCurrent = releases.some(({ tag }) => {
          const parsed = parseStableVersion(stripTagPrefix(tag));

          return (
            current !== undefined &&
            parsed !== undefined &&
            compareVersions(parsed, current) <= 0
          );
        });

        if (lastPage || reachedCurrent) {
          break;
        }
      }

      return mut_collected;
    },

    commitSha: async (repo, tag) => {
      const { text } = await requestFound(
        `/repos/${repo}/commits/${tag}`,
        'application/vnd.github.sha',
      );

      const sha = text.trim();

      if (!/^[0-9a-f]{40}$/u.test(sha)) {
        throw new Error(
          `GET /repos/${repo}/commits/${tag} did not answer a commit SHA: ${sha}`,
        );
      }

      return sha;
    },

    releaseByTag: async (repo, tag) => {
      // `tag` is `v<x.y.z>`, which needs no escaping. A draft has no tag route,
      // so it answers 404 like a release that does not exist.
      const route = `/repos/${repo}/releases/tags/${tag}` as const;

      const answer = await request(
        route,
        'application/vnd.github+json',
        'undefined',
      );

      if (answer === undefined) {
        return undefined;
      }

      const raw: unknown = JSON.parse(answer.text);

      if (!isRecord(raw)) {
        throw new Error(`GET ${route} did not return an object.`);
      }

      return parseRelease(raw);
    },
  };
};

/**
 * Releases come newest first, and the ones that matter are the ones newer than
 * the current pin; paging stops once a page reaches it. This cap is for a
 * repository that never does — 1,000 releases is more than any action here has.
 */
const maxReleasePages = 10;

/**
 * The SHA-256 of each of `pin`'s assets in `release`, by platform, or why the
 * move cannot be made: an asset the release does not carry or one with no
 * digest (both a warning, since they need a person), or one uploaded after
 * `cutoff`. A release's files can be uploaded or replaced long after it was
 * published, so the hold applies to each of them as well as to the release.
 * `pnpm-update.yml`'s `commit` job checks the pins against the same rule (see
 * {@link releaseLine}), more strictly: one asset per name, and the hold read
 * only from `pnpm-workspace.yaml`'s
 * top-level key, refusing the pins when it is not there.
 */
const readAssetDigests = (
  name: string,
  pin: ReleaseBinaryPin,
  release: Release,
  cutoff: number,
): ReadonlyRecord<string, string> | string => {
  const version = stripTagPrefix(release.tag);

  const entries = Object.entries(pin.assets).map(
    ([platform, { name: template }]) => {
      const assetName = template.replaceAll('{version}', () => version);

      const asset = release.assets.find(
        (candidate) => candidate.name === assetName,
      );

      const uploadedAt = toEpochMilliseconds(asset?.updatedAt);

      return {
        platform,
        assetName,
        found: asset !== undefined,
        uploadedAt,
        mature: uploadedAt !== undefined && uploadedAt <= cutoff,
        sha256: /^sha256:(?<hex>[0-9a-f]{64})$/u.exec(asset?.digest ?? '')
          ?.groups?.['hex'],
      };
    },
  );

  const missing = entries.find(({ found }) => !found);

  if (missing !== undefined) {
    return `::warning::${name}: ${release.tag} has no asset named ${missing.assetName}; not taken.`;
  }

  const undigested = entries.find(({ sha256 }) => sha256 === undefined);

  if (undigested !== undefined) {
    return `::warning::${name}: ${release.tag} has no SHA-256 digest for ${undigested.assetName}; not taken.`;
  }

  const young = entries.find(({ mature }) => !mature);

  if (young !== undefined) {
    return young.uploadedAt === undefined
      ? `${name}: ${young.assetName} of ${release.tag} has no upload time to hold it to; not taken.`
      : `${name}: ${young.assetName} of ${release.tag} was uploaded after the cutoff; not taken.`;
  }

  return Object.fromEntries(
    entries.map(({ platform, sha256 }) => [platform, sha256 ?? '']),
  );
};

/**
 * The newest release `pin` can move to and its digests: the one
 * `selectMatureRelease` picks, or, when that one cannot be taken
 * ({@link readAssetDigests}), the next one down the same line.
 */
const findMove = (
  name: string,
  pin: ReleaseBinaryPin,
  releases: readonly Release[],
  cutoff: number,
):
  | Readonly<{ release: Release; digests: ReadonlyRecord<string, string> }>
  | undefined => {
  const currentTag = `v${pin.version}` as const;

  const { target } = selectMatureRelease(
    releases,
    currentTag,
    cutoff,
    releaseLine,
  );

  const release = releases.find(({ tag }) => tag === target);

  if (release === undefined) {
    return undefined;
  }

  const digests = readAssetDigests(name, pin, release, cutoff);

  if (typeof digests === 'string') {
    console.log(digests);

    return findMove(
      name,
      pin,
      releases.filter((candidate) => candidate !== release),
      cutoff,
    );
  }

  return { release, digests };
};

/** The pin file as both moves write it. */
const writePins = (
  configPath: string,
  pins: ReadonlyRecord<string, unknown>,
): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- the pin file.
  fs.writeFileSync(configPath, `${JSON.stringify(pins, undefined, 2)}\n`);
};

/**
 * `raw` with its version and digests replaced and everything else, a key this
 * does not know included, as it was.
 */
const movePin = (
  raw: ReadonlyRecord<string, unknown>,
  tag: string,
  digests: ReadonlyRecord<string, string>,
): unknown => {
  const assets = isRecord(raw['assets']) ? raw['assets'] : ({} as const);

  return {
    ...raw,
    version: stripTagPrefix(tag),
    // eslint-disable-next-line ts-data-forge/prefer-obj-over-entries-round-trip -- ts-data-forge is not installed when this runs (see the header).
    assets: Object.fromEntries(
      Object.entries(assets).map(([platform, asset]) => [
        platform,
        { ...(isRecord(asset) ? asset : {}), sha256: digests[platform] },
      ]),
    ),
  };
};

/**
 * `release-binaries --to`: the one tool named pinned to the release
 * `v<version>`, every other tool left as it is, or why it cannot be, which
 * leaves the file untouched: no tool of that name, no such published release (a
 * draft has none), a prerelease, the release or one of its assets
 * ({@link readAssetDigests}) younger than the hold, or the pinned version whose
 * files were uploaded again.
 */
const pinByHand = async (
  configPath: string,
  tools: ReturnType<typeof parseReleaseBinaryPins>,
  to: ReleaseBinaryTarget,
  api: GitHubApi,
  cutoff: number,
): Promise<string | undefined> => {
  const tool = tools.find((entry) => entry.name === to.name);

  if (tool === undefined) {
    return `tools/configs/release-binaries.json pins no tool named "${to.name}".`;
  }

  const { name, pin, raw } = tool;

  const tag = `v${to.version}` as const;

  const release = await api.releaseByTag(pin.repository, tag);

  if (release === undefined) {
    return `${name}: ${pin.repository} has no published release ${tag}, or cannot be read.`;
  }

  if (!isStableRelease(release)) {
    return `${name}: ${tag} is a draft or a prerelease; not taken.`;
  }

  if (!isPublishedBy(release, cutoff)) {
    return toEpochMilliseconds(release.publishedAt) === undefined
      ? `${name}: ${tag} has no publication time to hold it to; not taken.`
      : `${name}: ${tag} was published after the cutoff; not taken.`;
  }

  const digests = readAssetDigests(name, pin, release, cutoff);

  if (typeof digests === 'string') {
    return digests.replace(/^::warning::/u, '');
  }

  const currentTag = `v${pin.version}` as const;

  // The same version with another digest is an upload replaced since it was
  // pinned, which is worth reporting, not re-pinning
  // (`tools/scripts/lib/release-binaries.mts`).
  const replaced =
    currentTag === tag
      ? Object.entries(digests).find(
          ([platform, sha256]) => pin.assets[platform]?.sha256 !== sha256,
        )
      : undefined;

  if (replaced !== undefined) {
    return `${name}: the ${replaced[0]} asset of ${tag} is ${replaced[1]}, not the pinned digest; not re-pinned. Either the version was edited by hand without its digests (put back the version last pinned, then use --to), or the file was uploaded again, which is worth reporting.`;
  }

  // The same version with the same digests: a replaced one was refused above.
  const changed = currentTag !== tag;

  console.log(
    `${name} (${pin.repository}): ${currentTag} ${changed ? `-> ${tag}` : 'unchanged'} (--to)`,
  );

  if (changed) {
    writePins(
      configPath,
      Object.fromEntries(
        tools.map((entry) => [
          entry.name,
          entry.name === name ? movePin(raw, tag, digests) : entry.raw,
        ]),
      ),
    );
  }

  console.log(`Moved ${changed ? 1 : 0} release-binary pin(s).`);

  return undefined;
};

/**
 * The `--to` of `release-binaries`, `undefined` for none, or `'invalid'` for
 * anything else after the command.
 */
const parseToOption = (
  argsAsGiven: readonly string[],
): ReleaseBinaryTarget | 'invalid' | undefined => {
  // `pnpm run update-release-binaries -- --to …` forwards the `--` as well.
  // eslint-disable-next-line ts-data-forge/prefer-canonical-array-slicing -- ts-data-forge is not installed when this runs (see the header).
  const args = argsAsGiven[0] === '--' ? argsAsGiven.slice(1) : argsAsGiven;

  // eslint-disable-next-line ts-data-forge/prefer-canonical-length-guard -- ts-data-forge is not installed when this runs (see the header).
  if (args.length === 0) {
    return undefined;
  }

  const target =
    // eslint-disable-next-line ts-data-forge/prefer-canonical-length-guard -- ts-data-forge is not installed when this runs (see the header).
    args.length === 2 && args[0] === '--to' && args[1] !== undefined
      ? /^(?<name>[^@\s]+)@(?<version>\S+)$/u.exec(args[1])?.groups
      : undefined;

  const name = target?.['name'];

  const version = target?.['version'];

  return name === undefined ||
    version === undefined ||
    parseStableVersion(version) === undefined
    ? 'invalid'
    : { name, version };
};

const parseReleaseBinaryPin = (raw: unknown): ReleaseBinaryPin | undefined => {
  if (!isRecord(raw)) {
    return undefined;
  }

  const { repository, version, binary, assets } = raw;

  if (
    typeof repository !== 'string' ||
    typeof version !== 'string' ||
    typeof binary !== 'string' ||
    !isRecord(assets) ||
    // Spliced into URLs; `parseStableVersion` is what a move is made with.
    parseStableVersion(version) === undefined
  ) {
    return undefined;
  }

  const entries = Object.entries(assets).map(([platform, asset]) =>
    isRecord(asset) &&
    typeof asset['name'] === 'string' &&
    typeof asset['sha256'] === 'string'
      ? ([platform, { name: asset['name'], sha256: asset['sha256'] }] as const)
      : undefined,
  );

  return entries.every((entry) => entry !== undefined)
    ? { repository, version, binary, assets: Object.fromEntries(entries) }
    : undefined;
};

/**
 * Each tool's pin, read for what this needs, and its JSON as written, which a
 * move rewrites. Not `parseReleaseBinaryPins` from
 * `../lib/release-binaries.mts`, which `check:root:actionlint` reads the file
 * with: that module imports packages that are not installed when this runs (see
 * the header). Its stricter check of the digests is what fails a malformed
 * file.
 */
const parseReleaseBinaryPins = (
  json: unknown,
): readonly Readonly<{
  name: string;
  pin: ReleaseBinaryPin;
  raw: ReadonlyRecord<string, unknown>;
}>[] => {
  if (!isRecord(json)) {
    throw new Error('tools/configs/release-binaries.json is not an object.');
  }

  return Object.entries(json).map(([name, raw]) => {
    const pin = parseReleaseBinaryPin(raw);

    if (pin === undefined || !isRecord(raw)) {
      throw new Error(
        `tools/configs/release-binaries.json: "${name}" is not { repository, version, binary, assets: { <platform>: { name, sha256 } } }.`,
      );
    }

    return { name, pin, raw };
  });
};

const compareDigits = (a: string, b: string): number =>
  a.length !== b.length ? a.length - b.length : a < b ? -1 : a > b ? 1 : 0;

type Hold = Readonly<{ minutes: string; milliseconds: number }>;

/** `minimumReleaseAge` is minutes; anything unparsable counts as no hold. */
const readMinimumReleaseAge = (): Hold => {
  const minutes = pnpmStdout(['config', 'get', 'minimumReleaseAge']);

  try {
    return {
      minutes,
      milliseconds: Temporal.Duration.from(`PT${minutes}M`).total(
        'milliseconds',
      ),
    };
  } catch {
    return { minutes, milliseconds: 0 };
  }
};

const describeHold = (hold: Hold, cutoff: number): string =>
  `minimumReleaseAge: ${hold.minutes} min (cutoff ${Temporal.Instant.fromEpochMilliseconds(cutoff).toString()})` as const;

/**
 * `isDirectlyExecuted` from `ts-repo-utils`, inlined: that package is not
 * installed when this runs (see the header).
 */
const isDirectlyExecuted = (fileUrl: string): boolean =>
  process.argv[1] !== undefined &&
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.realpathSync(fileURLToPath(fileUrl)) === fs.realpathSync(process.argv[1]);

if (isDirectlyExecuted(import.meta.url)) {
  await main(process.argv);
}
