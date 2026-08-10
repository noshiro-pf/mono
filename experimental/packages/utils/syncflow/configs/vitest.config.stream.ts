import * as nodePath from 'node:path';
import { defineConfig } from 'vitest/config';

const thisDir: string = import.meta.dirname;

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  test: {
    globals: true,
    typecheck: {
      tsconfig: nodePath.resolve(thisDir, 'tsconfig.test.json'),
    },
    include: ['test/**/*.test.stream.mts'],
    testTimeout: 30_000,
    silent: true,
  },
});
