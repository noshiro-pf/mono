import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, hasKey, isRecord, Result, unknownToString } from 'ts-data-forge';
import { glob, isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a workspace member's `package.json` declares `packageManager`.
 *
 * The root's is the only one anything reads: pnpm takes the workspace root's
 * pin wherever it is run from, and corepack walks up past a manifest without
 * the field until it finds one. A member's copy is therefore dead, and
 * `pnpm-update.yml` — whose `pnpm self-update` rewrites the root's alone —
 * leaves it to rot, so eleven packages, most of them published, went on
 * naming `pnpm@11.20.0` long after the repository moved to 12. Packages
 * imported from standalone repositories are how one arrives; delete it there
 * rather than teaching the update to keep it in step.
 */
export const checkPackageManager = async (): Promise<
  Result<number, string>
> => {
  const result = await glob(Array.from(memberManifestGlobs), {
    cwd: projectRootPath,
    ignore: ['**/node_modules/**'],
    absolute: true,
  });

  if (Result.isErr(result)) {
    return Result.err(
      `❌ Failed to list package.json files: ${unknownToString(result.value)}`,
    );
  }

  const manifests = await Promise.all(
    result.value.toSorted().map(async (absolutePath) => ({
      relativePath: path.relative(projectRootPath, absolutePath),
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      content: await fs.readFile(absolutePath, 'utf8'),
    })),
  );

  const offenders = findPackageManagerDeclarations(manifests);

  if (Arr.isNonEmpty(offenders)) {
    return Result.err(
      [
        `❌ ${offenders.length} workspace member(s) declare \`packageManager\`:`,
        '',
        ...offenders.map((file) => `  ${file}`),
        '',
        'Only the root `package.json` pins pnpm, and only its pin is read or',
        'updated. Delete the field from these manifests.',
      ].join('\n'),
    );
  }

  return Result.ok(manifests.length);
};

/** The relative paths of the manifests that declare `packageManager`. */
export const findPackageManagerDeclarations = (
  manifests: readonly Readonly<{ relativePath: string; content: string }>[],
): readonly string[] =>
  manifests
    .filter(({ content }) => {
      const parsed: unknown = JSON.parse(content);

      return isRecord(parsed) && hasKey(parsed, 'packageManager');
    })
    .map(({ relativePath }) => relativePath);

/** The `packages` globs of `pnpm-workspace.yaml`, as manifest paths. */
const memberManifestGlobs = [
  'libs/*/package.json',
  'apps/*/package.json',
  'tools/*/package.json',
  'languages/*/*/package.json',
  'strict-lib/scripts-common/package.json',
  'strict-lib/v*/package.json',
  'strict-lib/v*/output/lib/package.json',
] as const;

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkPackageManager().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} workspace member manifest(s) checked; none declares \`packageManager\`.`,
  );
}
