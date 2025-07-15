import { assertExt } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

await assertExt({
  directories: [
    {
      path: path.resolve(projectRootPath, './src'),
      extension: '.mts',
      ignorePatterns: [],
    },
    {
      path: path.resolve(projectRootPath, './samples'),
      extension: '.mts',
      ignorePatterns: [
        'mutability-utilities.tsx',
        'vitest.config.ts',
        'tsconfig.json',
      ],
    },
    {
      path: path.resolve(projectRootPath, './scripts'),
      extension: '.mts',
      ignorePatterns: [],
    },
  ],
});
