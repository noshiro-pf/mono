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
    // This package kept `retry` rather than the serialized fetch that the
    // other browser projects use. Left as it was.
    retry: 2,
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
      'prettier/plugins/babel',
      'prettier/plugins/estree',
      'prettier/standalone',
    ],
  },
});
