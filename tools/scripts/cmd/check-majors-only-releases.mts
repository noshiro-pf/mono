import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import {
  listChangesetBumps,
  readChangesets,
  type ChangesetFile,
} from '../lib/changesets.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Holds a changeset that gives a package released only as a major alone
 * (`1.0.0`, `2.0.0`) a `minor` or a `patch`.
 *
 * Nothing else fails on such a changeset where it is written. ts-std-forge's
 * encoding test reads ts-std-forge-keys' version, which the changeset changes
 * only when `changeset version` runs, so the failure first appears on the
 * version pull request, and holds the release of every other package with it.
 * A `none` names a package without releasing it, and passes.
 *
 * It is a `check:prose` guard because a changeset is Markdown, and
 * `code-check.yml` skips a diff of Markdown alone.
 */
export const checkMajorsOnlyReleases = ({
  changesets,
  majorsOnly,
}: Readonly<{
  changesets: readonly ChangesetFile[];
  majorsOnly: ReadonlyMap<string, string>;
}>): Result<number, string> => {
  // The bumps changesets names, not the release plan: a package here has no
  // runtime dependency, so `updateInternalDependencies` never releases one.
  // Declaring a dependency changes what it publishes, which is a major anyway.
  const violations = listChangesetBumps(changesets).filter(
    ({ name, bump }) =>
      majorsOnly.has(name) && (bump === 'minor' || bump === 'patch'),
  );

  return Arr.isNonEmpty(violations)
    ? Result.err(
        [
          `❌ ${violations.length} changeset release(s) of a package released only as a major alone:`,
          '',
          ...violations.map(
            ({ file, name, bump }) =>
              `  - ${file} gives ${name} "${bump}" (${majorsOnly.get(name) ?? ''})`,
          ),
          '',
          'Give it "major" with the change that is its reason, or leave it out.',
          `The packages and why: ${path.relative(projectRootPath, SELF)}.`,
        ].join('\n'),
      )
    : Result.ok(majorsOnly.size);
};

/**
 * The packages whose every version is a major alone, by name, with where that
 * rule is written.
 */
const MAJORS_ONLY: ReadonlyMap<string, string> = new Map<string, string>([
  // Its version is the version of Optional's encoding: any other version would
  // change the type of every Optional with no change of encoding.
  ['ts-std-forge-keys', 'libs/ts-std-forge-keys/README.md, "Versioning"'],
]);

const SELF = path.resolve(
  projectRootPath,
  'tools/scripts/cmd/check-majors-only-releases.mts',
);

if (isDirectlyExecuted(import.meta.url)) {
  const result = await readChangesets()
    .then((changesets) =>
      checkMajorsOnlyReleases({ changesets, majorsOnly: MAJORS_ONLY }),
    )
    .catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} package(s) released only as a major alone; no changeset gives one a minor or a patch.`,
  );
}
