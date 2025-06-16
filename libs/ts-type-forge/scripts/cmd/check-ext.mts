import { assertExt } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

await assertExt({
  directories: [
    {
      path: path.resolve(projectRootPath, './src'),
      extension: '.d.mts',
      ignorePatterns: ['tsconfig.json', 'globals.d.mts'],
    },
    {
      path: path.resolve(projectRootPath, './test'),
      extension: '.mts',
      ignorePatterns: ['tsconfig.json'],
    },
    {
      path: path.resolve(projectRootPath, './scripts'),
      extension: '.mts',
      ignorePatterns: ['tsconfig.json'],
    },
  ],
});
