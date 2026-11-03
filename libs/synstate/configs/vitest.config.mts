import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  alias: {
    synstate: path.resolve(workspaceRootPath, './src/index.mts'),
    'synstate-react-hooks': path.resolve(
      workspaceRootPath,
      '../synstate-react-hooks/src/index.mts',
    ),
  },
  node: {
    exclude: [
      '**/*.d.mts',
      '**/index.mts',
      'src/entry-point.mts',
      // Helpers the samples import, with no test of their own: matched by the
      // default `samples/**/*.mts`, each would fail as an empty test file.
      'samples/docs-site/**/solid-js-client.mts',
      'samples/docs-site/operators-on-signals/**/00-search-request.mts',
    ],
    testTimeout: 30_000,
  },
  browser: {
    provider: playwright(),
    includeSource: ['src/**/*.mts'],
    include: ['src/**/*.test.mts', 'test/**/*.test.mts'],
    exclude: [
      '**/*.d.mts',
      '**/index.mts',
      'src/entry-point.mts',
      // `vi.resetModules` does not give a page a second copy of a module, so
      // the two copies this file needs exist only in Node.js.
      'test/duplicate-copies.test.mts',
      // The page's bundle has `process.env.NODE_ENV` replaced by a fixed
      // string, which neither `vi.stubEnv` nor `vi.stubGlobal` changes.
      'src/core/utils/is-development-build.test.mts',
      'test/circular-dependency-check-off.test.mts',
      // ESLint runs in Node.js only.
      'test/eslint-config.test.mts',
    ],
    optimizeDepsInclude: ['jotai', 'rxjs'],
    testTimeout: 30_000,
  },
});
