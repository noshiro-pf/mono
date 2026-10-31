import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Json,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';
import {
  isBreaking,
  parseChangesetBumps,
  readChangesets,
  type ChangesetFile,
} from './check-next-major.mjs';

/**
 * Holds a breaking release of one member of a `linked` group in
 * `.changeset/config.json` until every member of the group is given one.
 *
 * `linked` makes the members that release together take the same version, the
 * highest in the group — including the members that are not releasing. So a
 * breaking release of one member moves the whole group onto its new major: the
 * next patch of any other member is released from there. synstate and the four
 * packages wrapping it are linked for the other direction: they depend on
 * synstate's exact version, so a synstate release takes them along, and
 * `linked` raises that dependency patch to synstate's own bump.
 *
 * Neither direction carries a changeset's text. A changeset's body reaches the
 * changelog of the packages it names and no other, so a member made breaking by
 * `linked` alone tells its consumers nothing about why. Naming every member in
 * the breaking changeset is what puts the change in front of each package's
 * consumers, and releasing the group's majors together is what keeps one
 * member's major from becoming everyone's next version unannounced.
 *
 * The check fails when
 *
 * - changesets in `.changeset/` give some members of a linked group a breaking
 *   bump — `major`, or `minor` while the member is still `0.x` — and leave
 *   others out;
 * - a linked group names something that is not a workspace package, which
 *   `changeset` would reject only when it next runs — at release time — and a
 *   glob would silently take in a package added later.
 *
 * It is a `check:prose` guard because a changeset is Markdown, and
 * `code-check.yml` skips a diff of Markdown alone.
 */
export const checkLinkedReleases = ({
  changesets,
  linked,
  versions,
}: Readonly<{
  changesets: readonly ChangesetFile[];
  linked: readonly (readonly string[])[];
  /** The version of every workspace package, by name. */
  versions: ReadonlyMap<string, string>;
}>): Result<number, string> => {
  const bumps = changesets.flatMap(({ file, content }) =>
    Array.from(parseChangesetBumps(content), ([name, bump]) => ({
      file,
      name,
      bump,
    })),
  );

  const violations = linked.flatMap((group): readonly string[] => {
    const unknown = group.filter((name) => !versions.has(name));

    if (Arr.isNonEmpty(unknown)) {
      return [
        [
          `The linked group [${group.join(', ')}] names what is not a workspace`,
          'package. List each member by its package name, without a glob:',
          '',
          ...unknown.map((name) => `  - ${name}`),
        ].join('\n'),
      ];
    }

    const breaking = Arr.generate(function* () {
      for (const name of group) {
        const version = versions.get(name) ?? '';

        const pending = bumps.find(
          (bump) => bump.name === name && isBreaking(bump.bump, version),
        );

        if (pending !== undefined) {
          yield pending;
        }
      }
    });

    const left = group.filter((name) =>
      breaking.every((pending) => pending.name !== name),
    );

    if (!Arr.isNonEmpty(breaking) || !Arr.isNonEmpty(left)) {
      return [];
    }

    return [
      [
        `The linked group [${group.join(', ')}] has a breaking release pending:`,
        '',
        ...breaking.map(
          ({ file, name, bump }) => `  - ${file} gives ${name} "${bump}"`,
        ),
        '',
        'and these members of it are given none:',
        '',
        ...left.map((name) => `  - ${name}`),
        '',
        'Name each of them in a breaking changeset too — the one already',
        'pending, if its text is what their consumers need to read.',
      ].join('\n'),
    ];
  });

  return Arr.isNonEmpty(violations)
    ? Result.err(
        [
          `❌ ${violations.length} problem(s) with the linked groups in ${CONFIG_FILE}:`,
          '',
          ...violations.flatMap((violation) => [violation, '']),
          `Why a linked group releases its majors together: ${path.relative(projectRootPath, SELF)}.`,
        ].join('\n'),
      )
    : Result.ok(linked.length);
};

/**
 * The `fixed` or `linked` groups of a changesets config. A config without the
 * key has none; one whose key is not a list of lists of strings is an error.
 */
export const parseReleaseGroups = (
  config: string,
  key: 'fixed' | 'linked',
): Result<readonly (readonly string[])[], string> => {
  const parsed = Json.parse(config);

  if (Result.isErr(parsed) || !isRecord(parsed.value)) {
    return Result.err(`${CONFIG_FILE} is not a JSON object.`);
  }

  if (!hasKey(parsed.value, key)) {
    return Result.ok([]);
  }

  const groups = parsed.value[key];

  if (
    !Arr.isArray(groups) ||
    !groups.every(
      (group): group is readonly string[] =>
        Arr.isArray(group) && group.every(isString),
    )
  ) {
    return Result.err(
      `${CONFIG_FILE}: "${key}" is not a list of lists of package names.`,
    );
  }

  return Result.ok(groups);
};

const CONFIG_FILE = '.changeset/config.json';

const SELF = path.resolve(
  projectRootPath,
  'tools/scripts/cmd/check-linked-releases.mts',
);

const readVersions = async (): Promise<ReadonlyMap<string, string>> => {
  const packages = await getWorkspacePackages(projectRootPath);

  return new Map(
    Arr.generate(function* () {
      for (const pkg of packages) {
        if (
          isRecord(pkg.packageJson) &&
          hasKey(pkg.packageJson, 'version') &&
          isString(pkg.packageJson.version)
        ) {
          yield [pkg.name, pkg.packageJson.version] as const;
        }
      }
    }),
  );
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await Promise.all([
    readChangesets(),
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.resolve(projectRootPath, CONFIG_FILE), 'utf8'),
    readVersions(),
  ])
    .then(([changesets, config, versions]) =>
      Result.flatMap(parseReleaseGroups(config, 'linked'), (linked) =>
        checkLinkedReleases({ changesets, linked, versions }),
      ),
    )
    .catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} linked group(s); no breaking release leaves a member behind.`,
  );
}
