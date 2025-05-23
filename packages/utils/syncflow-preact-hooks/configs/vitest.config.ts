import * as path from 'node:path';
import { defineConfig } from 'vitest/config';

const thisDir: string = import.meta.dirname;

// https://github.com/vitest-dev/vitest/blob/v1.5.0/test/import-meta/vite.config.ts
export default defineConfig({
  test: {
    globals: true,
    dir: path.resolve(thisDir, '../src'),
    includeSource: [path.resolve(thisDir, '../src/**/*.mts')],
    typecheck: {
      tsconfig: path.resolve(thisDir, 'tsconfig.test.json'),
    },
    passWithNoTests: true,
  },
});
