import { Arr } from 'ts-data-forge';
import {
  listChangesetBumps,
  type ChangesetFile,
} from '../../lib/changesets.mjs';

/**
 * The released packages whose `src/` the diff changed, or the `src/` of a
 * private package they bundle, and that no changeset in the diff names: each by
 * its name, with ` (through <private package>, …)` when only what it bundles
 * changed.
 *
 * A warning, not a failure: a refactor or a comment needs no release, and only
 * the author knows whether the change is user-visible. What it catches is the
 * changeset forgotten for one that is — for a Chrome extension that means the
 * next store upload is refused as not newer (see "Releases" in CLAUDE.md). A
 * private package is released by nobody, so a change to one that a released
 * package bundles (`split-view-link` in `split-view-extension`) is that
 * package's to release.
 *
 * The front matter is read by `tools/scripts/lib/changesets.mts`, the parser
 * every command reading a changeset uses.
 */
export const findMissingChangesets = ({
  changedFiles,
  released,
  changesets,
}: Readonly<{
  changedFiles: readonly string[];
  /**
   * Packages a changeset releases: `libs/*` and the Chrome extensions, each
   * with the private packages it bundles ({@link bundledPrivatePackages}).
   */
  released: readonly ReleasedPackage[];
  /** The changeset files the diff adds or changes, with their content. */
  changesets: readonly ChangesetFile[];
}>): readonly string[] => {
  const named = new Set(listChangesetBumps(changesets).map(({ name }) => name));

  const srcChanged = (dir: string): boolean =>
    changedFiles.some(
      (file) => file.startsWith(`${dir}/src/`) && !TEST_FILE.test(file),
    );

  return released
    .filter(({ name }) => !named.has(name))
    .flatMap(({ name, dir, bundles = [] }) => {
      if (srcChanged(dir)) {
        return [name];
      }

      const through = bundles
        .filter((bundled) => srcChanged(bundled.dir))
        .map((bundled) => bundled.name);

      return Arr.isNonEmpty(through)
        ? [`${name} (through ${through.join(', ')})`]
        : [];
    })
    .toSorted();
};

/**
 * The private workspace packages each package reaches through `dependencies`
 * and `peerDependencies`, passing only through private ones: what it bundles,
 * since a private package is published by nobody. A released package on the way
 * is not passed through, as it ships what it reaches itself.
 *
 * A private package named as a peer counts too, whatever its range. No consumer
 * can install a private package, so a released package that names one reaches
 * its users only with that code inside it; whether its build puts it there (a
 * `libs/` package built with `tsc` bundles nothing) is the package's to get
 * right, and counting it errs towards asking for a changeset. No released
 * package names a private one as a peer today.
 */
export const bundledPrivatePackages = (
  packages: readonly WorkspacePackage[],
): ReadonlyMap<string, readonly Readonly<{ name: string; dir: string }>[]> => {
  const byName = new Map(packages.map((pkg) => [pkg.name, pkg] as const));

  return new Map(
    packages.map((pkg) => {
      const mut_seen = new Set<string>();

      const mut_queue = Array.from(pkg.buildDependencies);

      while (Arr.isNonEmpty(mut_queue)) {
        const next = byName.get(mut_queue.shift() ?? '');

        if (next === undefined || !next.isPrivate || mut_seen.has(next.name)) {
          continue;
        }

        mut_seen.add(next.name);

        mut_queue.push(...next.buildDependencies);
      }

      return [
        pkg.name,
        Array.from(mut_seen, (name) => ({
          name,
          dir: byName.get(name)?.dir ?? '',
        })),
      ] as const;
    }),
  );
};

export type ReleasedPackage = Readonly<{
  name: string;
  dir: string;
  bundles?: readonly Readonly<{ name: string; dir: string }>[];
}>;

export type WorkspacePackage = Readonly<{
  name: string;
  dir: string;
  isPrivate: boolean;
  /** The workspace members in `dependencies` and `peerDependencies`, by any range. */
  buildDependencies: ReadonlySet<string>;
}>;

/** A colocated test, which ships nothing. */
const TEST_FILE = /\.test\.[cm]?[jt]sx?$/u;
