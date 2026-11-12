import * as path from 'node:path';
import { assertExt } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

await assertExt({
  directories: [
    {
      path: path.resolve(projectRootPath, './src'),
      extension: '.mts',
      // The schema of `.github/unblock-prs.json`, which `gen:config-schema`
      // writes beside the type it is generated from.
      ignorePatterns: ['**/*.schema.json'],
    },
    {
      path: path.resolve(projectRootPath, './scripts'),
      extension: '.mts',
    },
  ],
});
