import * as path from 'node:path';
import { assertExt } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

await assertExt({
  directories: [
    {
      path: path.resolve(projectRootPath, './src'),
      extension: '.mts',
      // Each command's README, and the schema of `.github/unblock-prs.json`.
      ignorePatterns: ['**/README.md', '**/*.schema.json'],
    },
    {
      path: path.resolve(projectRootPath, './scripts'),
      extension: '.mts',
    },
  ],
});
