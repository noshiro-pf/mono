import { validateConfig } from '@changesets/config';
import { parseChangesetFile } from '@changesets/parse';
import type { Config, Packages } from '@changesets/types';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  isRecord,
  isString,
  Json,
  Num,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { glob } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';
import { RUNTIME_DEPENDENCY_FIELDS } from './dependency-fields.mjs';

/**
 * The packages a changeset's front matter names, with their bump, read by
 * `@changesets/parse` — the parser `changeset version` reads it with, so that
 * no guard reads a release differently from the one that happens. Quoted
 * values, YAML comments and leading blank lines are read as changesets reads
 * them, and `none` names a package without releasing it.
 *
 * Throws on what `changeset version` would refuse — no front matter, invalid
 * YAML, a bump that is not one — rather than naming nothing for it. Pass only a
 * file `isChangesetFileName` accepts; `listChangesetBumps` filters for you.
 */
export const parseChangesetBumps = (
  content: string,
): ReadonlyMap<string, Bump> =>
  new Map(
    parseChangesetFile(content).releases.map(
      ({ name, type }) => [name, type] as const,
    ),
  );

/**
 * Every package each changeset names, with its bump and the file naming it, in
 * the order of `changesets` and of each file's front matter. A file changesets
 * does not read as a changeset — `README.md`, `config.json` — names none; one it
 * would refuse throws, naming the file.
 */
export const listChangesetBumps = (
  changesets: readonly ChangesetFile[],
): readonly ChangesetBump[] =>
  changesets
    .filter(({ file }) => isChangesetFileName(file))
    .flatMap(({ file, content }) =>
      Array.from(parseChangesetBumpsOf(file, content), ([name, bump]) => ({
        file,
        name,
        bump,
      })),
    );

/**
 * Whether changesets reads the file at `file`, relative to the repository root,
 * as a changeset: directly under `.changeset/` or under `.changeset/pre/`, which
 * `@changesets/read` reads too, and with a name `isChangesetFileName` accepts.
 */
export const isChangesetPath = (file: string): boolean =>
  CHANGESET_PATH.test(file.replaceAll('\\', '/')) && isChangesetFileName(file);

/**
 * Whether changesets reads `file` as a changeset: a Markdown file whose name
 * does not start with a dot and is not one of the documents `@changesets/read`
 * skips (`README.md` in any case, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`).
 */
export const isChangesetFileName = (file: string): boolean => {
  const name = path.basename(file);

  return (
    !name.startsWith('.') &&
    name.endsWith('.md') &&
    !/^readme\.md$/iu.test(name) &&
    !NON_CHANGESET_DOCUMENTS.has(name)
  );
};

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
 * Every `.changeset/*.md` and `.changeset/pre/*.md` file — what
 * `@changesets/read` reads — sorted by path. `README.md` is among them;
 * `listChangesetBumps` skips it, as changesets does.
 */
export const readChangesets = async (): Promise<readonly ChangesetFile[]> => {
  const files = await glob(`${CHANGESET_DIR_NAME}/{,pre/}*.md`, {
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

/**
 * `.changeset/config.json` as `changeset version` reads it: through
 * `@changesets/config`, against the workspace, with the globs of `fixed` and
 * `linked` expanded. Every guard that reads a release group reads it here, so
 * that none honors a group another refuses (#3309).
 */
export const readReleaseConfig = (
  config: unknown,
  packages: readonly ReleasePackage[],
): Result<Config, string> => {
  const workspace = toChangesetsWorkspace(packages);

  const validated = validateConfig(config, workspace);

  // `validateConfig` reads a member as a glob, and drops one that matches no
  // package, a name no package has included; `changeset version` refuses it, at
  // release time. Each member is matched on its own here.
  const unmatched = groupMembersOf(config).filter(
    ({ kind, member }) =>
      validateConfig({ [kind]: [[member]] }, workspace).config?.[kind].every(
        Arr.isEmpty,
      ) ?? true,
  );

  const errors = [
    ...(validated.errors ?? []),
    ...unmatched.map(
      ({ kind, member }) =>
        `"${member}" in "${kind}" matches no workspace package.`,
    ),
  ] as const;

  return validated.config === undefined || Arr.isNonEmpty(errors)
    ? Result.err(
        [
          `❌ ${CHANGESETS_CONFIG_FILE} is not a config changesets accepts:`,
          '',
          ...errors.map((error) => `  - ${error}`),
        ].join('\n'),
      )
    : Result.ok(validated.config);
};

/** `.changeset/config.json`, parsed as JSON. Throws when it is not JSON. */
export const readChangesetsConfigFile = async (): Promise<unknown> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const config = await fs.readFile(
    path.resolve(projectRootPath, CHANGESETS_CONFIG_FILE),
    'utf8',
  );

  const parsed = Json.parse(config);

  if (Result.isErr(parsed)) {
    throw new Error(
      `${CHANGESETS_CONFIG_FILE} is not JSON: ${unknownToString(parsed.value)}`,
    );
  }

  return parsed.value;
};

/**
 * The workspace as `@changesets/config` and `@changesets/assemble-release-plan`
 * read it. Only the runtime dependency fields are given: a `devDependencies`
 * edge releases nothing. Nor is `private`: a published package cannot depend on
 * a private one, and a private one is never a checked dependent, so how
 * `privatePackages` treats it changes no edge.
 */
export const toChangesetsWorkspace = (
  packages: readonly ReleasePackage[],
): Packages =>
  ({
    rootDir: PLAN_ROOT,
    rootPackage: {
      dir: PLAN_ROOT,
      packageJson: { name: PLAN_ROOT_NAME, version: '0.0.0' },
    },
    packages: packages.map(({ name, version, dependencies = [] }) => ({
      dir: path.posix.join(PLAN_ROOT, name),
      packageJson: {
        name,
        version,
        ...Object.fromEntries(
          RUNTIME_DEPENDENCY_FIELDS.map((field) => [
            field,
            Object.fromEntries(
              dependencies
                .filter((dependency) => dependency.field === field)
                .map((dependency) => [dependency.name, dependency.range]),
            ),
          ]),
        ),
      },
    })),
    tool: { type: 'pnpm' },
  }) as const;

/** Every string member of the `fixed` and `linked` groups of a raw config. */
const groupMembersOf = (
  config: unknown,
): readonly Readonly<{ kind: 'fixed' | 'linked'; member: string }>[] =>
  (['fixed', 'linked'] as const).flatMap((kind) => {
    const groups = isRecord(config) ? config[kind] : undefined;

    return Arr.isArray(groups)
      ? groups.flatMap((group) =>
          Arr.isArray(group)
            ? group.filter(isString).map((member) => ({ kind, member }))
            : [],
        )
      : [];
  });

/** What a release config and a release plan read of a workspace package. */
export type ReleasePackage = Readonly<{
  name: string;
  version: string;
  dependencies?: readonly Readonly<{
    name: string;
    field: (typeof RUNTIME_DEPENDENCY_FIELDS)[number];
    range: string;
  }>[];
}>;

export const CHANGESETS_CONFIG_FILE = '.changeset/config.json';

/**
 * Where the release plan places the workspace. Only the dependency fields and
 * versions decide a plan, not where a package is.
 */
const PLAN_ROOT = '/workspace';

/** A name no package can have, for the workspace root the plan asks for. */
const PLAN_ROOT_NAME = '(workspace root)';

/** `none` names a package and releases nothing. */
export type Bump = 'major' | 'minor' | 'patch' | 'none';

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

/** The directories `@changesets/read` reads changesets from. */
const CHANGESET_PATH = /^\.changeset\/(?:pre\/)?[^/]+$/u;

/** The Markdown files `@changesets/read` skips, besides `README.md`. */
const NON_CHANGESET_DOCUMENTS: ReadonlySet<string> = new Set<string>([
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
]);

/** The start of a semver version, capturing its major and minor. */
const VERSION = /^(\d+)\.(\d+)\.\d/u;

const parseChangesetBumpsOf = (
  file: string,
  content: string,
): ReadonlyMap<string, Bump> => {
  try {
    return parseChangesetBumps(content);
  } catch (error: unknown) {
    throw new Error(`${file}: ${unknownToString(error)}`, { cause: error });
  }
};

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
