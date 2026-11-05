import * as path from 'node:path';

export const projectRootPath = path.resolve(import.meta.dirname, '..');

/**
 * The pnpm workspace root, one level above `strict-lib/`.
 *
 * The stage runners need it rather than {@link projectRootPath}: they read the
 * root manifest to discover the workspace globs, and `strict-lib/` is a
 * directory inside the workspace, not a workspace of its own. They keep to the
 * harnesses themselves (`run-in-harnesses.mts`), so pointing at the real root
 * reaches no other member.
 */
export const workspaceRootPath = path.resolve(import.meta.dirname, '../..');
