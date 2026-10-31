import { parseChangesetBumps } from '../check-next-major.mjs';

/**
 * The released packages whose `src/` the diff changed and that no changeset in
 * the diff names.
 *
 * A warning, not a failure: a refactor or a comment needs no release, and only
 * the author knows whether the change is user-visible. What it catches is the
 * changeset forgotten for one that is — for a Chrome extension that means the
 * next store upload is refused as not newer (see "Releases" in CLAUDE.md).
 *
 * The front matter is read by `parseChangesetBumps`, the parser the
 * `check:prose:next-major` and `check:prose:dependent-releases` guards use.
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
  changesets: readonly Readonly<{ file: string; content: string }>[];
}>): readonly string[] => {
  const named = new Set(
    changesets.flatMap(({ content }) =>
      Array.from(parseChangesetBumps(content).keys()),
    ),
  );

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

/** Whether a changed path is a changeset (not the directory's README). */
export const isChangesetFile = (file: string): boolean =>
  CHANGESET_FILE.test(file) && file !== '.changeset/README.md';

/** A colocated test, which ships nothing. */
const TEST_FILE = /\.test\.[cm]?[jt]sx?$/u;

const CHANGESET_FILE = /^\.changeset\/[^/]+\.md$/u;
