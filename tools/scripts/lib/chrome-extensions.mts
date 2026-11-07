import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Whether the workspace package at `packageDir` (relative to the repository
 * root) is a Chrome extension: one with `public/manifest.json`, which its build
 * copies into `dist/`. An extension is private but versioned, and the Chrome
 * Web Store refuses an upload whose version is not newer, so whatever decides
 * which packages need a changeset asks this.
 */
export const isChromeExtension = async (packageDir: string): Promise<boolean> =>
  fs
    .access(
      path.resolve(projectRootPath, packageDir, 'public', 'manifest.json'),
    )
    .then(() => true)
    .catch(() => false);
