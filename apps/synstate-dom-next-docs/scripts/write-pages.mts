import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result } from 'ts-data-forge';
// eslint-disable-next-line import-x/no-relative-packages -- tools/ is not a package; this is how apps reach its shared scripts
import { formatPackage } from '../../../tools/configs/format-package.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Writes pages an embedding script has rendered, and formats them with one
 * Prettier run. The scripts render and check every page before calling this, so
 * that a page that cannot be rendered stops them before anything is written; a
 * failure while writing or formatting can still leave the pages written so far.
 */
export const writePages = async (
  pages: readonly (readonly [pagePath: string, content: string])[],
  source: string,
): Promise<Result<undefined, string>> => {
  // `formatPackage` formats the whole package when given no pattern.
  if (!Arr.isNonEmpty(pages)) {
    return Result.ok(undefined);
  }

  for (const [pagePath, content] of pages) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(pagePath, content, 'utf8');
  }

  const written = pages.map(([pagePath]) =>
    path.relative(workspaceRootPath, pagePath),
  );

  const status = await formatPackage({
    cwd: workspaceRootPath,
    patterns: written,
  });

  if (status !== 0) {
    return Result.err(`❌ Prettier failed on ${written.join(', ')}`);
  }

  console.info(`✓ Embedded ${source} into ${written.join(', ')}`);

  return Result.ok(undefined);
};
