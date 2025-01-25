import { toThisDir } from '@noshiro/mono-utils';
import * as nodePath from 'node:path';
import { defineConfig } from 'vitest/config';

const thisDir: string = toThisDir(import.meta.url);

// https://github.com/vitest-dev/vitest/blob/v1.5.0/test/import-meta/vite.config.ts
export default defineConfig({
  test: {
    globals: true,
    dir: nodePath.resolve(thisDir, '../src'),
    includeSource: [nodePath.resolve(thisDir, '../src/**/*.mts')],
    typecheck: {
      tsconfig: nodePath.resolve(thisDir, 'tsconfig.test.json'),
    },
  },
});
