import * as path from 'node:path';
import { Arr, hasKey, isRecord, Result, unknownToString } from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import { RUNTIME_DEPENDENCY_FIELDS } from '../lib/dependency-fields.mjs';
import { pathFromRoot, projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a strict-lib workspace member other than a published bundle — the
 * converter (`scripts-common/`) or a `-source` harness — declares
 * `dependencies`, `optionalDependencies` or `peerDependencies`.
 *
 * changesets bumps a package whose `dependencies` (and the like) name a package
 * it releases, and the harnesses are one `fixed` group, whose version
 * `strict-lib:gen:packages` stamps onto every bundle. So a release of anything
 * one harness depends on through those fields bumps them all and publishes
 * every bundle with no content change, and nothing else fails. The converter is
 * held to the same rule because the harnesses depend on it: through
 * `devDependencies`, which changesets does not follow, and a converter that
 * takes runtime dependencies invites that edge to become one of them. The
 * published bundles (`output/lib/`) are left alone: `ts-type-forge` is a
 * `dependency` there by design.
 */
export const checkStrictLibDevDependencies = async (): Promise<
  Result<number, string>
> => {
  const packages = await getWorkspacePackages(projectRootPath);

  const members = selectStrictLibMembers(
    packages.map((pkg) => ({
      relativePath: pathFromRoot(path.join(pkg.path, 'package.json')),
      manifest: pkg.packageJson,
    })),
  );

  if (!Arr.isNonEmpty(members)) {
    return Result.err(
      '❌ No strict-lib workspace member was found. If strict-lib/ moved, update the selection in check-strict-lib-dev-dependencies.mts.',
    );
  }

  const offenders = findRuntimeDependencyEdges(members);

  if (Arr.isNonEmpty(offenders)) {
    return Result.err(
      [
        `❌ ${offenders.length} strict-lib manifest(s) declare a field changesets bumps dependents through:`,
        '',
        ...offenders.map(
          ({ relativePath, fields }) =>
            `  ${relativePath}: ${fields.join(', ')}`,
        ),
        '',
        'The -source harnesses are one fixed group whose version every bundle',
        'takes, so a release of anything a harness names this way publishes',
        'every bundle with no content change; the converter, which they depend',
        'on, is held to the same rule. Move the entries to `devDependencies`.',
      ].join('\n'),
    );
  }

  return Result.ok(members.length);
};

/**
 * The workspace members under `strict-lib/` that are not published bundles
 * (`output/lib/`).
 */
export const selectStrictLibMembers = <
  M extends Readonly<{ relativePath: string }>,
>(
  members: readonly M[],
): readonly M[] =>
  members.filter(
    ({ relativePath }) =>
      relativePath.startsWith('strict-lib/') &&
      !publishedBundleManifest.test(relativePath),
  );

/** Where a published bundle's manifest is. */
const publishedBundleManifest =
  /^strict-lib\/v[^/]+\/output\/lib\/package\.json$/u;

/**
 * The manifests that declare a non-empty `dependencies`, `optionalDependencies`
 * or `peerDependencies`, with the fields they declare.
 */
export const findRuntimeDependencyEdges = (
  manifests: readonly Readonly<{ relativePath: string; manifest: unknown }>[],
): readonly Readonly<{ relativePath: string; fields: readonly string[] }>[] =>
  manifests.flatMap(({ relativePath, manifest }) => {
    if (!isRecord(manifest)) {
      return [];
    }

    const fields = RUNTIME_DEPENDENCY_FIELDS.filter(
      (field) =>
        hasKey(manifest, field) &&
        isRecord(manifest[field]) &&
        Arr.isNonEmpty(Object.keys(manifest[field])),
    );

    return Arr.isNonEmpty(fields) ? [{ relativePath, fields }] : [];
  });

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkStrictLibDevDependencies().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} strict-lib manifest(s) checked (the converter and the harnesses); none declares a runtime dependency.`,
  );
}
