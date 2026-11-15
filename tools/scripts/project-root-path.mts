import * as path from 'node:path';

export const projectRootPath = path.resolve(import.meta.dirname, '../..');

/**
 * `file` relative to `root` (the repository's by default), its segments joined
 * with `/` on every platform: the form the guards print and compare paths in.
 */
export const pathFromRoot = (
  file: string,
  root: string = projectRootPath,
): string => toPosixPath(path.relative(root, file));

/** `p` with its segments joined with `/` rather than the platform's separator. */
export const toPosixPath = (p: string): string => p.split(path.sep).join('/');
