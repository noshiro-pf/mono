import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isString, Num, Result, unknownToString } from 'ts-data-forge';
import { glob } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * The packages a changeset's front matter names, with their bump. A file
 * without front matter — `README.md`, `config.json` — names none.
 */
export const parseChangesetBumps = (
  content: string,
): ReadonlyMap<string, Bump> => {
  const lines = content.split('\n');

  if (lines[0]?.trim() !== '---') {
    return new Map<string, Bump>();
  }

  const end = lines.findIndex(
    (line, index) => index > 0 && line.trim() === '---',
  );

  if (end === -1) {
    return new Map<string, Bump>();
  }

  return new Map(
    Arr.generate(function* () {
      for (const line of lines.slice(1, end)) {
        const match = FRONT_MATTER_ENTRY.exec(line);

        const name = match?.[1];

        const bump = match?.[2];

        if (isString(name) && isBump(bump)) {
          yield [name, bump] as const;
        }
      }
    }),
  );
};

/**
 * Every package each changeset names, with its bump and the file naming it, in
 * the order of `changesets` and of each file's front matter.
 */
export const listChangesetBumps = (
  changesets: readonly ChangesetFile[],
): readonly ChangesetBump[] =>
  changesets.flatMap(({ file, content }) =>
    Array.from(parseChangesetBumps(content), ([name, bump]) => ({
      file,
      name,
      bump,
    })),
  );

/**
 * Whether `bump` breaks consumers of a package at `version`: under semver a
 * `0.x` package signals a breaking change with its minor, and changesets would
 * take a `major` there to `1.0.0`, which is breaking as well.
 */
export const isBreaking = (bump: Bump, version: string): boolean =>
  bump === 'major' || (bump === 'minor' && version.startsWith('0.'));

/**
 * Whether moving a package from `from` to `to` breaks its consumers, by the
 * rule `isBreaking` applies to a bump. A version that is not `x.y.z` is not
 * judged.
 */
export const isBreakingRelease = (from: string, to: string): boolean => {
  const before = parseVersion(from);

  const after = parseVersion(to);

  if (before === undefined || after === undefined) {
    return false;
  }

  return (
    after.major > before.major ||
    (before.major === 0 && after.major === 0 && after.minor > before.minor)
  );
};

/**
 * Every `.changeset/*.md` file, sorted by path. `README.md` is among them; it
 * has no front matter, so `parseChangesetBumps` names nothing for it.
 */
export const readChangesets = async (): Promise<readonly ChangesetFile[]> => {
  const files = await glob(`${CHANGESET_DIR_NAME}/*.md`, {
    cwd: projectRootPath,
  });

  if (Result.isErr(files)) {
    throw new Error(
      `Failed to list ${CHANGESET_DIR_NAME}/: ${unknownToString(files.value)}`,
    );
  }

  return Promise.all(
    files.value.toSorted().map(async (file) => ({
      file,
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      content: await fs.readFile(path.resolve(projectRootPath, file), 'utf8'),
    })),
  );
};

export type Bump = 'major' | 'minor' | 'patch';

export type ChangesetFile = Readonly<{
  /** Relative to the repository root. */
  file: string;
  content: string;
}>;

export type ChangesetBump = Readonly<{
  /** The changeset naming the package, relative to the repository root. */
  file: string;
  name: string;
  bump: Bump;
}>;

/** The changesets directory, relative to the repository root. */
export const CHANGESET_DIR_NAME = '.changeset';

/** Matches `'pkg': patch`, `"pkg": minor` or `pkg: major`. */
const FRONT_MATTER_ENTRY = /^\s*['"]?(.+?)['"]?\s*:\s*(major|minor|patch)\s*$/u;

/** The start of a semver version, capturing its major and minor. */
const VERSION = /^(\d+)\.(\d+)\.\d/u;

const isBump = (value: string | undefined): value is Bump =>
  value === 'major' || value === 'minor' || value === 'patch';

const parseVersion = (
  version: string,
): Readonly<{ major: number; minor: number }> | undefined => {
  const match = VERSION.exec(version);

  return match?.[1] === undefined || match[2] === undefined
    ? undefined
    : {
        major: Result.unwrapOkOr(Num.safeParseFloat(match[1]), Number.NaN),
        minor: Result.unwrapOkOr(Num.safeParseFloat(match[2]), Number.NaN),
      };
};
