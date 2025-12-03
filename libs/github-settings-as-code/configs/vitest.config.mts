import * as path from 'node:path';
import { type ViteUserConfig as ViteUserConfig_ } from 'vitest/config';
import { type CoverageOptions } from 'vitest/node';
import { projectRootPath } from '../scripts/project-root-path.mjs';

type ViteUserConfig = DeepReadonly<ViteUserConfig_>;

// https://github.com/vitest-dev/vitest/blob/v1.5.0/test/import-meta/vite.config.ts
const config = (): ViteUserConfig =>
  ({
    test: {
      globals: true,
      dir: projectRootPath,
      includeSource: ['src/**/*.mts'],
      typecheck: {
        tsconfig: path.resolve(projectRootPath, './configs/tsconfig.test.json'),
      },
      alias: {
        'github-settings-as-code': path.resolve(
          projectRootPath,
          './src/entry-point.mts',
        ),
      },
      passWithNoTests: true,
      restoreMocks: true,
      hideSkippedTests: true,
      coverage: coverageSettings('v8'),
    },
  }) as const;

const coverageSettings = (
  provider: 'v8' | 'istanbul',
): DeepReadonly<CoverageOptions> => ({
  provider,
  reporter: ['html', 'lcov', 'text'],
  include: ['src/**/*.mts'],
  exclude: ['**/index.mts', 'src/entry-point.mts'],
});

export default config();
