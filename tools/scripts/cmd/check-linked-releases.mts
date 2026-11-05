import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import {
  CHANGESETS_CONFIG_FILE,
  isBreaking,
  listChangesetBumps,
  readChangesets,
  readChangesetsConfigFile,
  readReleaseConfig,
  type ChangesetFile,
  type ReleasePackage,
} from '../lib/changesets.mjs';
import { projectRootPath } from '../project-root-path.mjs';

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
 * - `.changeset/config.json` is not one `changeset version` accepts — a group
 *   naming what is not a workspace package, say — which it would reject only
 *   when it next runs, at release time.
 *
 * The groups are read as `changeset version` reads them, globs expanded
 * (`readReleaseConfig`), as `check:prose:dependent-releases` reads them.
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
  const bumps = listChangesetBumps(changesets);

  const violations = linked.flatMap((group): readonly string[] => {
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
        'and these members of it are given no breaking bump:',
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
          `❌ ${violations.length} problem(s) with the linked groups in ${CHANGESETS_CONFIG_FILE}:`,
          '',
          ...violations.flatMap((violation) => [violation, '']),
          `Why a linked group releases its majors together: ${path.relative(projectRootPath, SELF)}.`,
        ].join('\n'),
      )
    : Result.ok(linked.length);
};

const SELF = path.resolve(
  projectRootPath,
  'tools/scripts/cmd/check-linked-releases.mts',
);

/** Every workspace package with a version, as a release config reads it. */
const readPackages = async (): Promise<readonly ReleasePackage[]> => {
  const packages = await getWorkspacePackages(projectRootPath);

  return Arr.generate(function* () {
    for (const pkg of packages) {
      if (
        isRecord(pkg.packageJson) &&
        hasKey(pkg.packageJson, 'version') &&
        isString(pkg.packageJson.version)
      ) {
        yield { name: pkg.name, version: pkg.packageJson.version } as const;
      }
    }
  });
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await Promise.all([
    readChangesets(),
    readChangesetsConfigFile(),
    readPackages(),
  ])
    .then(([changesets, config, packages]) =>
      Result.flatMap(readReleaseConfig(config, packages), ({ linked }) =>
        checkLinkedReleases({
          changesets,
          linked,
          versions: new Map(
            packages.map(({ name, version }) => [name, version] as const),
          ),
        }),
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
