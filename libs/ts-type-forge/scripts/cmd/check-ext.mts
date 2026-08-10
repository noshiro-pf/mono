import * as path from 'node:path';
import { assertExt } from 'ts-repo-utils';
import { workspaceRootPath } from '../workspace-root-path.mjs';

await assertExt({
  directories: [
    {
      path: path.resolve(workspaceRootPath, './src'),
      extension: '.mts',
      // Markdown docs (e.g. predefined-numbers/README.md) live alongside source.
      ignorePatterns: ['**/*.md'],
    },
    {
      path: path.resolve(workspaceRootPath, './test'),
      extension: '.mts',
      // node_modules: build.mts links the built package into
      // test/dist_/node_modules for the dist smoke tests.
      ignorePatterns: ['**/tsconfig*.json', '**/node_modules/**'],
    },
    {
      path: path.resolve(workspaceRootPath, './scripts'),
      extension: '.mts',
    },
  ],
});
