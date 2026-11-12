import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';
import { emulatorTests } from './emulator-tests.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  coverage: {
    include: ['src/**/*.mts'],
  },
  node: {
    includeSource: ['src/**/*.mts'],
    include: ['src/**/*.test.mts', 'test/**/*.test.mts'],
    // `exclude` replaces `defineViteConfig`'s default rather than adding to it,
    // and it has no option that adds, so the default's three entries are
    // restated here and do not follow a change to it.
    exclude: [
      '**/*.d.mts',
      '**/index.mts',
      'src/entry-point.mts',
      // Need the emulator, and are run by `vitest.rules.config.mts` alone.
      ...emulatorTests,
    ],
  },
});
