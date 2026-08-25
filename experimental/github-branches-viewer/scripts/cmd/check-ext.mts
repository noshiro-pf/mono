import { assertExt } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

await assertExt({
  directories: [
    {
      path: path.resolve(projectRootPath, './src'),
      extension: ['.ts', '.tsx', '.d.ts', '.css', '.svg'],
      ignorePatterns: [],
    },
    {
      path: path.resolve(projectRootPath, './scripts'),
      extension: '.mts',
      ignorePatterns: ['tsconfig.json'],
    },
  ],
});
