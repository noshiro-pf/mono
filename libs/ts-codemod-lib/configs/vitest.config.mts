import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { projectRootPath } from '../scripts/project-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: projectRootPath,
  alias: {
    'ts-codemod-lib': path.resolve(projectRootPath, './src/entry-point.mts'),
  },
  node: {
    includeSource: ['src/functions/**/*.mts', 'samples/**/*.mts'],
    include: ['src/functions/**/*.test.mts', 'samples/**/*.mts'],
    exclude: [
      '**/*.d.mts',
      '**/index.mts',
      'samples/readme/apply-transformers-to-src-directory.mts',
    ],
  },
  browser: {
    provider: playwright(),
    // This package fetches its test files in parallel rather than one at a
    // time, as the other browser projects do: with `optimizeDepsInclude`
    // complete there is no reload to race against, and its 8 files are slow
    // enough that serializing them is worth avoiding.
    fileParallelism: true,
    includeSource: ['src/functions/**/*.mts', 'samples/**/*.mts'],
    include: ['src/functions/**/*.test.mts', 'samples/**/*.mts'],
    exclude: [
      '**/*.d.mts',
      '**/index.mts',
      'samples/readme/apply-transformers-to-src-directory.mts',
      'samples/**/*',
    ],
    optimizeDepsInclude: [
      'dedent',
      'typescript',
      'ts-morph',
      'ts-data-forge',
      'prettier/parser-typescript',
      'prettier/plugins/typescript',
      'prettier/plugins/babel',
      'prettier/plugins/estree',
      'prettier/standalone',
    ],
  },
});
