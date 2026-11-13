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
  listChangesetBumps,
  readChangesets,
  readChangesetsConfigFile,
  readReleaseConfig,
  type ChangesetBump,
  type ReleasePackage,
} from '../lib/changesets.mjs';
import { projectRootPath, toPosixPath } from '../project-root-path.mjs';

/**
 * A line for each changeset that names part of a `fixed` group of
 * `.changeset/config.json`, or a strict-lib bundle.
 *
 * The members of a `fixed` group always release together, at one version, but a
 * changeset's text reaches only the changelogs of the packages it names: one
 * naming some members releases them all and leaves the rest with an entry that
 * says nothing. So a changeset names every member of a group it names one of,
 * `none` included (it is named, and `changeset version` writes no entry for it
 * either way). Each changeset is judged on its own, since the text of each
 * reaches only the packages it names.
 *
 * The strict-lib bundles (`strict-ts-lib-vX.Y`, under
 * `strict-lib/v*\/output/lib`) are generated from their `-source` harnesses,
 * and `strict-lib:gen:packages` stamps each harness's version back onto its
 * bundle. A bump given to a bundle is undone by that, so the release silently
 * does not happen; the harnesses, the `fixed` group, are what a changeset names.
 *
 * It is a `check:prose` guard because a changeset is Markdown, and
 * `code-check.yml` skips a diff of Markdown alone.
 */
export const findFixedReleaseProblems = ({
  bumps,
  fixed,
  bundles,
}: Readonly<{
  bumps: readonly ChangesetBump[];
  /** The `fixed` groups of `.changeset/config.json`, globs expanded. */
  fixed: readonly (readonly string[])[];
  /** The published packages a harness generates, which no changeset may name. */
  bundles: ReadonlySet<string>;
}>): readonly string[] =>
  Arr.uniq(bumps.map(({ file }) => file)).flatMap((file) => {
    const named: ReadonlySet<string> = new Set<string>(
      bumps.filter((bump) => bump.file === file).map(({ name }) => name),
    );

    const namedBundles = Array.from(named).filter((name) => bundles.has(name));

    return [
      ...(Arr.isNonEmpty(namedBundles)
        ? [
            `${file} names ${namedBundles.join(', ')}, whose version strict-lib:gen:packages stamps back from its -source harness, so the release would not happen. Name the -source harnesses instead.`,
          ]
        : []),
      ...Arr.generate(function* () {
        for (const group of fixed) {
          const missing = group.filter((name) => !named.has(name));

          if (Arr.isNonEmpty(missing) && missing.length !== group.length) {
            yield `${file} names ${group.length - missing.length} of the ${group.length} packages of a fixed group, which are released together; its text would not reach the changelog of ${missing.join(', ')}. Name every member.`;
          }
        }
      }),
    ];
  });

/**
 * The bundles: published workspace packages under `strict-lib/` that are in no
 * `fixed` group (the harnesses are the group).
 */
export const strictLibBundles = (
  packages: readonly Readonly<{
    name: string;
    dir: string;
    isPrivate: boolean;
  }>[],
  fixed: readonly (readonly string[])[],
): ReadonlySet<string> => {
  const grouped: ReadonlySet<string> = new Set<string>(fixed.flat());

  return new Set<string>(
    packages
      .filter(
        ({ name, dir, isPrivate }) =>
          !isPrivate &&
          !grouped.has(name) &&
          toPosixPath(dir).startsWith('strict-lib/'),
      )
      .map(({ name }) => name),
  );
};

type WorkspacePackage = Readonly<{
  name: string;
  /** Relative to the repository root. */
  dir: string;
  isPrivate: boolean;
  version: string | undefined;
}>;

const readPackages = async (): Promise<readonly WorkspacePackage[]> => {
  const packages = await getWorkspacePackages(projectRootPath);

  return packages.map((pkg) => {
    const manifest = isRecord(pkg.packageJson)
      ? pkg.packageJson
      : ({} as const);

    return {
      name: pkg.name,
      dir: path.relative(projectRootPath, pkg.path),
      isPrivate: hasKey(manifest, 'private') && manifest.private === true,
      version:
        hasKey(manifest, 'version') && isString(manifest.version)
          ? manifest.version
          : undefined,
    } as const;
  });
};

const check = async (): Promise<Result<number, string>> => {
  const [changesets, config, packages] = await Promise.all([
    readChangesets(),
    readChangesetsConfigFile(),
    readPackages(),
  ]);

  const releasePackages: readonly ReleasePackage[] = Arr.generate(function* () {
    for (const { name, version } of packages) {
      if (version !== undefined) {
        yield { name, version };
      }
    }
  });

  return Result.flatMap(
    readReleaseConfig(config, releasePackages),
    ({ fixed }): Result<number, string> => {
      const bumps = listChangesetBumps(changesets);

      const problems = findFixedReleaseProblems({
        bumps,
        fixed,
        bundles: strictLibBundles(packages, fixed),
      });

      return Arr.isNonEmpty(problems)
        ? Result.err(
            [
              `❌ ${problems.length} changeset problem(s) with the fixed groups of ${CHANGESETS_CONFIG_FILE} or the strict-lib bundles:`,
              '',
              ...problems.map((problem) => `  - ${problem}`),
            ].join('\n'),
          )
        : Result.ok(Arr.uniq(bumps.map(({ file }) => file)).length);
    },
  );
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await check().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} changeset(s); none names part of a fixed group or a strict-lib bundle.`,
  );
}
