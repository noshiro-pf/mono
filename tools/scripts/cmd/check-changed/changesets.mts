import {
  listChangesetBumps,
  type ChangesetFile,
} from '../../lib/changesets.mjs';

/**
 * The released packages whose `src/` the diff changed and that no changeset in
 * the diff names.
 *
 * A warning, not a failure: a refactor or a comment needs no release, and only
 * the author knows whether the change is user-visible. What it catches is the
 * changeset forgotten for one that is — for a Chrome extension that means the
 * next store upload is refused as not newer (see "Releases" in CLAUDE.md).
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
  /** Packages a changeset releases: `libs/*` and the Chrome extensions. */
  released: readonly Readonly<{ name: string; dir: string }>[];
  /** The changeset files the diff adds or changes, with their content. */
  changesets: readonly ChangesetFile[];
}>): readonly string[] => {
  const named = new Set(listChangesetBumps(changesets).map(({ name }) => name));

  return released
    .filter(
      ({ name, dir }) =>
        !named.has(name) &&
        changedFiles.some(
          (file) => file.startsWith(`${dir}/src/`) && !TEST_FILE.test(file),
        ),
    )
    .map(({ name }) => name)
    .toSorted();
};

/** A colocated test, which ships nothing. */
const TEST_FILE = /\.test\.[cm]?[jt]sx?$/u;
