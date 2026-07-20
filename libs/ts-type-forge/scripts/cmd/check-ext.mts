import * as path from 'node:path';
import { assertExt } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

await assertExt({
  directories: [
    {
      path: path.resolve(projectRootPath, './src'),
      extension: '.mts',
    },
    {
      path: path.resolve(projectRootPath, './test'),
      extension: '.mts',
      // node_modules: build.mts links the built package into
      // test/dist_/node_modules for the dist smoke tests.
      ignorePatterns: ['**/tsconfig*.json', '**/node_modules/**'],
    },
    {
      path: path.resolve(projectRootPath, './scripts'),
      extension: '.mts',
    },
  ],
});
