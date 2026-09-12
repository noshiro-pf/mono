import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
// A top-level `import type`, not the inline `import { type … }` the lint
// prefers: Node erases the former and keeps the latter as a bare
// `import {} from 'ts-type-forge'`, which fails to resolve before
// `pnpm install`. The test's runtime-import check guards this.
// eslint-disable-next-line import-x/consistent-type-specifier-style -- see above.
import type { ReadonlyRecord, StrictOmit } from 'ts-type-forge';

/**
 * The two updates `pnpm-update.yml` makes that pnpm's own `minimumReleaseAge`
 * does not reach, held to the same age it applies to npm dependencies.
 *
 * ```sh
 * node ./tools/scripts/cmd/mature-updates.mts pnpm     # pnpm itself
 * node ./tools/scripts/cmd/mature-updates.mts actions  # the action pins
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
 * exempt the one package that runs every install script in the tree; this
 * picks a version the hold already accepts instead and hands it to
 * `pnpm self-update <version>`, which is idempotent when the pin already says
 * so. The standalone pnpm binary does not reproduce the failure — it switches
 * versions by another route — which is why a local `pnpm self-update` passes;
 * CI runs the JS build that `pnpm/action-setup` installs with npm, and that
 * one adds the `pnpm` npm package to switch, `@pnpm/exe.*` optional
 * dependencies and all.
 *
 * **`actions`** moves every `uses: owner/repo@<sha> # vX.Y.Z` pin under
 * `.github/workflows/` to the newest release of the same major that is older
 * than the hold. `pnpm update --include-github-actions` cannot apply the
 * hold: it resolves action versions from `git ls-remote` refs, which carry a
 * tag name and a SHA but no publication date. GitHub's Releases API carries
 * `published_at`, so that is what this reads, and the tag is resolved to its
 * commit through the Commits API — the same SHA pin pnpm writes. A major
 * still waits for a human, as before; it is reported, not taken. Set
 * `GH_TOKEN` (the workflow passes `GITHUB_TOKEN`) or the unauthenticated
 * rate limit, shared across a runner's whole IP range, will be hit.
 *
 * **Run with `node`, not `tsx`.** The workflow calls this before
 * `pnpm install`, so nothing from `node_modules` exists yet — no `tsx`, no
 * `ts-repo-utils`, no `ts-data-forge`. Node runs `.mts` directly by stripping
 * the types, which is why this file imports only `node:*` modules at runtime
 * and uses only erasable syntax (no `enum`, no parameter properties, no
 * namespaces). The same constraint is why version segments stay digit
 * strings compared by length and then lexically (the `ts-data-forge` rules
 * object to `Number()` and `parseInt`, and the helper they want is not there
 * to import), and why the `eslint-disable` lines below exist. `Temporal` is
 * what Node 26 has, so the script needs the Node the workflow runs on
 * (`volta.node`), not the floor of the compatibility matrix. The test runs the
 * file under `node` against a fake `pnpm` and a fake GitHub API to keep all
 * of this true.
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

    case undefined:
    default: {
      console.error('Usage: node mature-updates.mts <pnpm | actions>');

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

  if (!isListOfStrings(versions) || !isRecord(time)) {
    return undefined;
  }

  return { versions, time };
};

// ---------------------------------------------------------------------------
// `actions`
// ---------------------------------------------------------------------------

export const updateActionPins = async (
  options: Readonly<{
    workflowsDir?: string;
    api?: GitHubApi;
    now?: number;
  }> = {},
): Promise<void> => {
  const workflowsDir =
    options.workflowsDir ?? path.join(process.cwd(), '.github', 'workflows');

  const api = options.api ?? createGitHubApi();

  const now = options.now ?? Temporal.Now.instant().epochMilliseconds;

  const hold = readMinimumReleaseAge();

  const cutoff = now - hold.milliseconds;

  console.log(describeHold(hold, cutoff));

  const pins = readActionPins(workflowsDir);

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

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- workflow files found above.
    const lines = fs.readFileSync(file, 'utf8').split('\n');

    const rewritten = fileUpdates.reduce(
      (acc, { pin, tag, sha }) =>
        acc.with(pin.line, renderActionPin({ ...pin, tag, sha })),
      lines,
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- workflow files found above.
    fs.writeFileSync(file, rewritten.join('\n'));
  }

  console.log(`Moved ${mut_updates.length} action pin(s).`);
};

/**
 * Among `releases`, the newest of the same major as `currentTag` that is newer
 * than it and was published at or before `cutoff`; the same-major releases
 * the hold keeps back (newer than the chosen one, or than the current pin
 * when nothing is chosen); and the majors that wait for a human. Drafts and
 * prereleases are not candidates.
 */
export const selectMatureRelease = (
  releases: readonly Release[],
  currentTag: string,
  cutoff: number,
): ReleaseSelection => {
  const current = parseStableVersion(stripTagPrefix(currentTag));

  if (current === undefined) {
    return { target: undefined, heldBack: [], majorsWaiting: [] };
  }

  const stable = releases
    .filter((release) => !release.draft && !release.prerelease)
    .map((release) => ({
      release,
      parsed: parseStableVersion(stripTagPrefix(release.tag)),
    }))
    .filter(
      (entry): entry is Readonly<{ release: Release; parsed: StableVersion }> =>
        entry.parsed !== undefined,
    )
    .toSorted((a, b) => compareVersions(a.parsed, b.parsed));

  const newerSameMajor = stable.filter(
    ({ parsed }) =>
      parsed.major === current.major && compareVersions(parsed, current) > 0,
  );

  const mature = newerSameMajor.filter(({ release }) => {
    const publishedAt = toEpochMilliseconds(release.publishedAt);

    return publishedAt !== undefined && publishedAt <= cutoff;
  });

  const target = mature.at(-1);

  const floor = target?.parsed ?? current;

  return {
    target: target?.release.tag,
    heldBack: newerSameMajor
      .filter(({ parsed }) => compareVersions(parsed, floor) > 0)
      .map(({ release }) => release.tag),
    majorsWaiting: Array.from(
      new Set(
        stable
          .filter(
            ({ parsed }) => compareDigits(parsed.major, current.major) > 0,
          )
          .map(({ parsed }) => parsed.major),
      ),
    ).toSorted(compareDigits),
  };
};

/**
 * `uses: owner/repo[/path]@<40-hex sha> # vX.Y.Z` — the shape
 * `pnpm update --include-github-actions` writes and the only one this moves.
 * A local workflow (`./…`), a bare tag, or a pin without the version comment
 * is left alone.
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

const isRepositorySegment = (segment: string): boolean =>
  /^[\w.-]+$/u.test(segment);

export const renderActionPin = (
  pin: StrictOmit<ActionPin, 'file' | 'line'>,
): string => `${pin.prefix}${pin.repo}${pin.subpath}@${pin.sha} # ${pin.tag}`;

export type ActionPin = Readonly<{
  /** Absolute path of the workflow file. */
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
}>;

export type ReleaseSelection = Readonly<{
  target: string | undefined;
  heldBack: readonly string[];
  majorsWaiting: readonly string[];
}>;

export type GitHubApi = Readonly<{
  /**
   * The repository's releases, newest first, fetched at least as far back as
   * `currentTag` so that everything newer than it is in hand.
   */
  releases: (repo: string, currentTag: string) => Promise<readonly Release[]>;
  /** The commit a tag points at — peeled, so an annotated tag is fine. */
  commitSha: (repo: string, tag: string) => Promise<string>;
}>;

type ActionPinUpdate = Readonly<{ pin: ActionPin; tag: string; sha: string }>;

const readActionPins = (workflowsDir: string): readonly ActionPin[] =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- the workflows directory.
  fs
    .readdirSync(workflowsDir)
    .filter((name) => /\.ya?ml$/u.test(name))
    .toSorted()
    .flatMap((name) => {
      const file = path.join(workflowsDir, name);

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a workflow file.
      return fs
        .readFileSync(file, 'utf8')
        .split('\n')
        .flatMap((text, line) => {
          const pin = parseActionPinLine(text);

          return pin === undefined ? [] : [{ ...pin, file, line }];
        });
    });

const describeSelection = (
  pin: ActionPin,
  selection: ReleaseSelection,
): string => {
  const move =
    selection.target === undefined
      ? `${pin.tag} unchanged`
      : `${pin.tag} -> ${selection.target}`;

  const heldBack = `held back by minimumReleaseAge: [${selection.heldBack.join(', ')}]`;

  const majors = `majors waiting for a human: [${selection.majorsWaiting.join(', ')}]`;

  return `${pin.repo}: ${move} (${heldBack}; ${majors})`;
};

const stripTagPrefix = (tag: string): string => tag.replace(/^v/u, '');

const createGitHubApi = (): GitHubApi => {
  const baseUrl = (
    process.env['GITHUB_API_URL'] ?? 'https://api.github.com'
  ).replace(/\/$/u, '');

  const token = process.env['GH_TOKEN'] ?? process.env['GITHUB_TOKEN'];

  const request = async (
    route: string,
    accept: string,
  ): Promise<Readonly<{ text: string; lastPage: boolean }>> => {
    const response = await fetch(`${baseUrl}${route}`, {
      headers: {
        Accept: accept,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(token === undefined ? {} : { Authorization: `Bearer ${token}` }),
      },
    });

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

  const releasesPage = async (
    repo: string,
    page: number,
  ): Promise<Readonly<{ releases: readonly Release[]; lastPage: boolean }>> => {
    const { text, lastPage } = await request(
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
      const { text } = await request(
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
  };
};

/**
 * Releases come newest first, and the ones that matter are the ones newer
 * than the current pin; paging stops once a page reaches it. This cap is for
 * a repository that never does — 1,000 releases is more than any action here
 * has.
 */
const maxReleasePages = 10;

const parseRelease = (raw: ReadonlyRecord<string, unknown>): Release => ({
  tag: typeof raw['tag_name'] === 'string' ? raw['tag_name'] : '',
  publishedAt:
    typeof raw['published_at'] === 'string' ? raw['published_at'] : undefined,
  draft: raw['draft'] === true,
  prerelease: raw['prerelease'] === true,
});

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
  `minimumReleaseAge: ${hold.minutes} min (cutoff ${Temporal.Instant.fromEpochMilliseconds(cutoff).toString()})`;

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

const isRecord = (value: unknown): value is ReadonlyRecord<string, unknown> =>
  // eslint-disable-next-line ts-data-forge/prefer-is-non-null-object -- ts-data-forge is not installed when this runs (see the header).
  typeof value === 'object' && value !== null;

const isListOfStrings = (value: unknown): value is readonly string[] =>
  // eslint-disable-next-line ts-data-forge/prefer-arr-is-array -- ts-data-forge is not installed when this runs (see the header).
  Array.isArray(value) && value.every((v) => typeof v === 'string');

const isListOfRecords = (
  value: unknown,
): value is readonly ReadonlyRecord<string, unknown>[] =>
  // eslint-disable-next-line ts-data-forge/prefer-arr-is-array -- ts-data-forge is not installed when this runs (see the header).
  Array.isArray(value) && value.every(isRecord);

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
  await main(process.argv);
}
