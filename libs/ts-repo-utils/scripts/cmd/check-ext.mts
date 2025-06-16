import { assertExt } from '../../src/functions/assert-ext.mjs';
import '../../src/node-global.mjs';

/**
 * Command script to check file extensions for ts-repo-utils project.
 * Validates that all TypeScript files use .mts extension.
 */
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
