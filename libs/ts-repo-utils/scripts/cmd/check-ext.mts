import { assertExt } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

await assertExt({
  directories: [
    {
      path: path.resolve(projectRootPath, './src'),
      extension: '.mts',
      ignorePatterns: ['globals.d.mts'],
    },
    {
      path: path.resolve(projectRootPath, './scripts'),
      extension: '.mts',
      ignorePatterns: [],
    },
  ],
});
