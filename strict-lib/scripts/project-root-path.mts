import * as path from 'node:path';

export const projectRootPath = path.resolve(import.meta.dirname, '..');

/**
 * The pnpm workspace root, one level above `strict-lib/`.
 *
 * The stage runners need it rather than {@link projectRootPath}: they read the
 * root manifest to discover the workspace globs, and `strict-lib/` is a
 * directory inside the workspace, not a workspace of its own. Packages that do
 * not define the script being run are skipped, so pointing at the real root
 * costs nothing.
 */
export const workspaceRootPath = path.resolve(import.meta.dirname, '../..');
