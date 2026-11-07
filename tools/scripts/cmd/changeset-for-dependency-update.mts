import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, hasKey, isRecord, isString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { parseAllDocuments } from 'yaml';
import { isChromeExtension } from '../lib/chrome-extensions.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Writes the changeset that `pnpm-update.yml` needs, when the update moved
 * something a consumer can observe.
 *
 * A dependency bump publishes nothing on its own — changesets decide releases
 * here (see CLAUDE.md, "Releases") — so a run that moved a published package's
 * *runtime* dependencies has to say so, or the fix ships to nobody. What counts
 * as runtime is `dependencies`, `peerDependencies` and `optionalDependencies`:
 * those three are what a consumer installs.
 * `devDependencies` moving is invisible to them.
 *
 * ## Chrome extensions
 *
 * An extension is private and installed by nobody, but it is versioned all the
 * same (`privatePackages.version` in `.changeset/config.json`), and the store
 * refuses an upload whose version is not newer (CLAUDE.md, "Releases").
 * What reaches its users is the bundle, built from the *resolved* versions of
 * everything its runtime dependencies reach — through workspace links into the
 * libraries and from there into the registry. A `workspace:*` or `catalog:`
 * range never changes in a manifest, so for these the comparison is the
 * lockfile's resolution instead (`bundledPackages`). An app is treated as an
 * extension when it has `public/manifest.json`.
 *
 * ## Why this is a step of its own, before the token
 *
 * It used to be a `node <<'NODE'` heredoc inside the workflow's last step,
 * which is the step that holds the GitHub App token. Length was not the problem
 * — the problem is that everything in that step runs with the token in its
 * environment, so the less that happens there the better, and none of this
 * needs the token. Reading `package.json` files and writing a changeset is
 * exactly the work that belongs before it.
 *
 * That it can be a file at all follows from the same ordering: a script in the
 * working tree is read at the moment it is invoked, after `pnpm install` has
 * run the dependency tree's lifecycle scripts, so a dependency could rewrite
 * it. Before the token is minted that buys an attacker nothing they do not
 * already have — they are already executing code in this job. After it, it
 * would buy them the token. See "What a job that holds a key may do" in
 * pnpm-update.yml.
 *
 * ## The baseline
 *
 * `HEAD` is still the pre-update commit when this runs: the workflow does not
 * commit until afterwards. So the comparison is each manifest against
 * `git show HEAD:<file>` — not against a stored copy, which would be one more
 * thing to keep in step.
 */
export const main = async (): Promise<void> => {
  const changed = await packagesToRelease();

  if (!Arr.isNonEmpty(changed)) {
    console.log(
      'No runtime-dependency or extension-bundle changes; no changeset added.',
    );

    return;
  }

  const file = path.resolve(
    projectRootPath,
    '.changeset',
    `pnpm-update-${todayUtc()}.md`,
  );

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path built from the date.
  await fs.writeFile(file, renderChangeset(changed));

  console.log(`Added patch changeset for: ${changed.join(', ')}`);
};

/**
 * The body of `.changeset/pnpm-update-<date>.md`.
 *
 * The front matter names every package, and the text below it is copied into
 * each of their changelogs — see CLAUDE.md, "Spell checking", for why what it
 * says has to pass cspell under each named package's own config.
 */
export const renderChangeset = (packageNames: readonly string[]): string =>
  [
    '---',
    ...packageNames.map((name) => `'${name}': patch`),
    '---',
    '',
    'Update dependencies',
    '',
  ].join('\n');

/**
 * Whether a consumer of this package would see the update.
 *
 * Compared as JSON rather than key by key: a range that changed, a dependency
 * added and one dropped are all the same answer, and the caller only needs the
 * answer.
 */
export const runtimeDependenciesChanged = (
  current: ReadonlyRecord<string, unknown>,
  baseline: ReadonlyRecord<string, unknown>,
): boolean =>
  runtimeFields.some(
    (field) =>
      JSON.stringify(current[field] ?? {}) !==
      JSON.stringify(baseline[field] ?? {}),
  );

/** What a consumer installs. `devDependencies` is deliberately not here. */
export const runtimeFields = [
  'dependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

/**
 * Whether the manifest describes something that gets published to npm, whose
 * consumers install its runtime dependencies by range.
 *
 * `private: true` is what the `apps/*` packages carry. Changesets would version
 * one (`privatePackages.version` is on), but nothing installs it, so its
 * manifest's ranges matter to nobody: the ones that ship anything, the Chrome
 * extensions, are judged by `bundledPackages` instead.
 */
export const isPublishable = (
  manifest: ReadonlyRecord<string, unknown>,
): boolean => isString(manifest['name']) && manifest['private'] !== true;

/**
 * Every registry package the bundle of the workspace package at `importer` (a
 * path relative to the root, as `pnpm-lock.yaml` keys its importers) can
 * contain, as sorted snapshot keys — `name@version`, with any peer suffix, so a
 * peer resolving differently counts as a move too.
 *
 * Follows `dependencies` and `optionalDependencies` — the importer's own, those
 * of every workspace package it links, and those of every snapshot it reaches.
 * `devDependencies` are left out at every level: the toolchain moves on almost
 * every run, and an extension that bundled a devDependency would have the same
 * problem with its manifest. A workspace link itself is not listed — its source
 * changing is not a dependency update.
 *
 * A linked package's peers are left out too, named by `peersOf(importerPath)`:
 * pnpm installs a peer into the importer's `dependencies` (`autoInstallPeers`),
 * so the lockfile cannot tell one apart, and a peer is the consumer's to
 * provide — `ts-data-forge`'s `typescript` peer would otherwise bump every
 * extension whenever the compiler moves. The extension's own peers are kept.
 *
 * An importer the lockfile does not have (a package this update added, or a
 * baseline with no lockfile) reaches nothing.
 */
export const bundledPackages = (
  lockfile: unknown,
  importer: string,
  peersOf: (importerPath: string) => ReadonlySet<string> = () => NO_PEERS,
): readonly string[] => {
  if (!isRecord(lockfile)) {
    return [];
  }

  const importers = recordOrEmpty(lockfile['importers']);

  const snapshots = recordOrEmpty(lockfile['snapshots']);

  const mut_visitedImporters = new Set<string>();

  const mut_reached = new Set<string>();

  const visitSnapshot = (key: string): void => {
    if (mut_reached.has(key)) {
      return;
    }

    mut_reached.add(key);

    const snapshot = recordOrEmpty(snapshots[key]);

    for (const field of BUNDLED_FIELDS) {
      for (const [name, version] of Object.entries(
        recordOrEmpty(snapshot[field]),
      )) {
        if (isString(version)) {
          visitSnapshot(snapshotKey(snapshots, name, version));
        }
      }
    }
  };

  const visitImporter = (importerPath: string): void => {
    if (mut_visitedImporters.has(importerPath)) {
      return;
    }

    mut_visitedImporters.add(importerPath);

    const entry = recordOrEmpty(importers[importerPath]);

    const peers = importerPath === importer ? NO_PEERS : peersOf(importerPath);

    for (const field of BUNDLED_FIELDS) {
      for (const [name, resolved] of Object.entries(
        recordOrEmpty(entry[field]),
      )) {
        if (peers.has(name)) {
          continue;
        }

        const version = isRecord(resolved) ? resolved['version'] : undefined;

        if (!isString(version)) {
          continue;
        }

        if (version.startsWith(LINK_PREFIX)) {
          visitImporter(
            path.posix.join(importerPath, version.slice(LINK_PREFIX.length)),
          );
        } else {
          visitSnapshot(snapshotKey(snapshots, name, version));
        }
      }
    }
  };

  visitImporter(importer);

  return Array.from(mut_reached).toSorted((a, b) => a.localeCompare(b));
};

/**
 * The workspace's document of `pnpm-lock.yaml`.
 *
 * The file holds two YAML documents — the package manager's own lockfile first,
 * then the workspace's (as `check-lockfile-integrity.mts` reads it). Both have
 * `importers`; the package manager's is the one whose `.` carries
 * `packageManagerDependencies`. Throws when no other document has `importers`
 * rather than reaching nothing for every extension, which would silently stop
 * versioning them again.
 */
export const parseLockfile = (
  text: string,
): ReadonlyRecord<string, unknown> => {
  const workspace = parseAllDocuments(text)
    .map((document) => {
      const value: unknown = document.toJS();

      return value;
    })
    .findLast(isWorkspaceDocument);

  if (workspace === undefined) {
    throw new Error(
      `${LOCKFILE} has no workspace document (one with \`importers\` that is not the package manager's own); its layout has probably changed — teach changeset-for-dependency-update.mts.`,
    );
  }

  return workspace;
};

/** The fields `bundledPackages` follows. */
const BUNDLED_FIELDS = ['dependencies', 'optionalDependencies'] as const;

const LINK_PREFIX = 'link:';

const LOCKFILE = 'pnpm-lock.yaml';

const NO_PEERS: ReadonlySet<string> = new Set<string>();

/** What only the package manager's own lockfile document has under `.`. */
const PACKAGE_MANAGER_FIELDS = [
  'packageManagerDependencies',
  'configDependencies',
] as const;

type WorkspaceManifest = Readonly<{
  relativePath: string;
  manifest: ReadonlyRecord<string, unknown>;
}>;

/**
 * Whether a lockfile document is the workspace's: it has `importers`, and is
 * not the package manager's own, whose `.` importer carries
 * `packageManagerDependencies` and `configDependencies`.
 */
const isWorkspaceDocument = (
  document: unknown,
): document is ReadonlyRecord<string, unknown> => {
  if (!isRecord(document) || !isRecord(document['importers'])) {
    return false;
  }

  const root = document['importers']['.'];

  return !(
    isRecord(root) &&
    PACKAGE_MANAGER_FIELDS.some((field) => hasKey(root, field))
  );
};

/**
 * The snapshot a resolved `version` names: `name@version` as a rule, but an
 * alias (`npm:react@19.1.0`) is recorded with the target's name in `version`
 * and keyed by it alone.
 */
const snapshotKey = (
  snapshots: ReadonlyRecord<string, unknown>,
  name: string,
  version: string,
): string => {
  const key = `${name}@${version}` as const;

  return hasKey(snapshots, key) || !hasKey(snapshots, version) ? key : version;
};

const recordOrEmpty = (value: unknown): ReadonlyRecord<string, unknown> =>
  isRecord(value) ? value : ({} as const);

const readJsonIfPresent = async (
  file: string,
): Promise<ReadonlyRecord<string, unknown> | undefined> => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a package.json under a workspace glob.
    const text = await fs.readFile(file, 'utf8');

    const parsed: unknown = JSON.parse(text);

    return isRecord(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

/**
 * `libs/*` and `apps/*` only.
 *
 * Not every workspace glob: the generated bundles under `strict-lib` are
 * written by `strict-lib:gen:packages` and excluded from `update-packages` for
 * that reason (CLAUDE.md, "Dependencies"), and `tools` publishes nothing.
 */
const workspaceManifests = async (): Promise<readonly WorkspaceManifest[]> => {
  const mut_found: WorkspaceManifest[] = [];

  for (const group of ['libs', 'apps']) {
    const groupPath = path.resolve(projectRootPath, group);

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a literal group name.
    const entries = await fs.readdir(groupPath, { withFileTypes: true });

    const directories = entries.filter((d) => d.isDirectory());

    for (const entry of directories) {
      const relativePath = path.posix.join(group, entry.name, 'package.json');

      const parsed = await readJsonIfPresent(
        path.resolve(projectRootPath, relativePath),
      );

      if (parsed !== undefined) {
        mut_found.push({ relativePath, manifest: parsed });
      }
    }
  }

  return mut_found;
};

const baselineText = (relativePath: string): string =>
  execFileSync('git', ['show', `HEAD:${relativePath}`], {
    cwd: projectRootPath,
    encoding: 'utf8',
    // The lockfile is several megabytes; the default 1 MiB would cut it off.
    maxBuffer: 256 * 1024 * 1024,
  });

/**
 * The manifest as `HEAD` has it, or `{}` for a package this update added.
 *
 * `execFileSync` rather than a shell, so a path is an argument and never part
 * of a command line.
 */
const baselineManifest = (
  relativePath: string,
): ReadonlyRecord<string, unknown> => {
  try {
    const parsed: unknown = JSON.parse(baselineText(relativePath));

    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

/**
 * The `peerDependencies` names of each importer, read from its `package.json`
 * in the working tree, or as `HEAD` has it for an importer the update removed —
 * an update moves ranges, not which packages are peers. Keyed by the lockfiles'
 * own importer paths, which are what `bundledPackages` resolves a link to, so
 * that both sides are walked by the same rule.
 */
const peersOfImporters = async (
  importerPaths: readonly string[],
): Promise<(importerPath: string) => ReadonlySet<string>> => {
  const peers = new Map<string, ReadonlySet<string>>(
    await Promise.all(
      importerPaths.map(async (importerPath) => {
        const manifest =
          (await readJsonIfPresent(
            path.resolve(projectRootPath, importerPath, 'package.json'),
          )) ?? baselineManifest(path.posix.join(importerPath, 'package.json'));

        return [
          importerPath,
          new Set<string>(
            Object.keys(recordOrEmpty(manifest['peerDependencies'])),
          ),
        ] as const;
      }),
    ),
  );

  return (importerPath) => peers.get(importerPath) ?? NO_PEERS;
};

/**
 * `pnpm-lock.yaml` as the update left it and as `HEAD` has it, and the peers of
 * every workspace package the current one names.
 */
const lockfiles = async (): Promise<Lockfiles> => {
  const current = parseLockfile(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the lockfile at the root.
    await fs.readFile(path.resolve(projectRootPath, LOCKFILE), 'utf8'),
  );

  const baselineSource = (() => {
    try {
      return baselineText(LOCKFILE);
    } catch {
      return undefined;
    }
  })();

  return {
    current,
    baseline:
      baselineSource === undefined ? undefined : parseLockfile(baselineSource),
  };
};

type Lockfiles = Readonly<{
  current: ReadonlyRecord<string, unknown>;
  baseline: ReadonlyRecord<string, unknown> | undefined;
}>;

const bundleChanged = (
  current: readonly string[],
  baseline: readonly string[],
): boolean => JSON.stringify(current) !== JSON.stringify(baseline);

/**
 * The packages the update needs released: a published package whose runtime
 * dependencies moved, and a Chrome extension whose bundle can contain other
 * registry packages than before.
 */
const packagesToRelease = async (): Promise<readonly string[]> => {
  const manifests = await workspaceManifests();

  const mut_changed: string[] = [];

  // Parsed once, and only if an extension needs it.
  let mut_lockfiles: Lockfiles | undefined = undefined;

  let mut_peersOf: ((importerPath: string) => ReadonlySet<string>) | undefined =
    undefined;

  for (const { relativePath, manifest } of manifests) {
    const name = manifest['name'];

    if (!isString(name)) {
      continue;
    }

    if (isPublishable(manifest)) {
      if (
        runtimeDependenciesChanged(manifest, baselineManifest(relativePath))
      ) {
        mut_changed.push(name);
      }

      continue;
    }

    const packageDir = path.posix.dirname(relativePath);

    if (!(await isChromeExtension(packageDir))) {
      continue;
    }

    mut_lockfiles ??= await lockfiles();

    mut_peersOf ??= await peersOfImporters(
      Array.from(
        new Set<string>([
          ...Object.keys(recordOrEmpty(mut_lockfiles.current['importers'])),
          ...Object.keys(recordOrEmpty(mut_lockfiles.baseline?.['importers'])),
        ]),
      ),
    );

    if (
      bundleChanged(
        bundledPackages(mut_lockfiles.current, packageDir, mut_peersOf),
        bundledPackages(mut_lockfiles.baseline, packageDir, mut_peersOf),
      )
    ) {
      mut_changed.push(name);
    }
  }

  return mut_changed.toSorted((a, b) => a.localeCompare(b));
};

/**
 * `YYYYMMDD` in UTC, for the changeset's file name.
 *
 * UTC rather than the runner's clock so that the name a scheduled run picks
 * does not depend on where it ran — the job fires at 21:07 UTC, which is the
 * next day in JST.
 */
const todayUtc = (): string =>
  Temporal.Now.plainDateISO('UTC').toString().replaceAll('-', '');

if (isDirectlyExecuted(import.meta.url)) {
  await main();
}
