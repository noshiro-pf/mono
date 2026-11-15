import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { projectRootPath } from '../scripts/project-root-path.mjs';
/* eslint-disable import-x/no-relative-packages */
import {
  defaultExclude,
  defineViteConfig,
} from '../../../tools/configs/vite-config.mjs';
/* eslint-enable import-x/no-relative-packages */

export default defineViteConfig({
  packageRoot: projectRootPath,
  alias: {
    'ts-codemod-lib': path.resolve(projectRootPath, './src/entry-point.mts'),
  },
  /*
   * Every transformer here is driven by the type checker, and
   * `enableNoUncheckedIndexedAccess` checks the file twice — once with the
   * option on and once with it off — so a single case costs a second or so.
   * V8 coverage instrumentation, the provider then, multiplied that by roughly
   * five, which took the default 5 s timeout out from under `check:test:cov` on
   * CI while `check:test` and `check:test:browser` stayed green.
   */
  node: {
    testTimeout: 30_000,
    includeSource: ['src/functions/**/*.mts', 'samples/**/*.mts'],
    include: ['src/functions/**/*.test.mts', 'samples/**/*.mts'],
    exclude: [
      ...defaultExclude,
      'samples/readme/apply-transformers-to-src-directory.mts',
      'samples/readme/apply-transformers-in-project.mts',
    ],
  },
  browser: {
    testTimeout: 30_000,
    provider: playwright(),
    // This package fetches its test files in parallel rather than one at a
    // time, as the other browser projects do: with `optimizeDepsInclude`
    // complete there is no reload to race against, and its 8 files are slow
    // enough that serializing them is worth avoiding.
    fileParallelism: true,
    includeSource: ['src/functions/**/*.mts', 'samples/**/*.mts'],
    include: ['src/functions/**/*.test.mts', 'samples/**/*.mts'],
    exclude: [
      ...defaultExclude,
      'samples/readme/apply-transformers-to-src-directory.mts',
      'samples/readme/apply-transformers-in-project.mts',
      'samples/**/*',
      // Node-only: it writes a project to a temporary directory through
      // `node:fs` and runs ESLint's `Linter` with typescript-eslint, neither of
      // which a browser can load. The node project runs it.
      'src/functions/ast-transformers/enable-explicit-function-return-type.test.mts',
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
