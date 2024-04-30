import { toThisDir } from '@noshiro/mono-scripts';
import * as nodePath from 'node:path';
import { defineConfig } from 'vitest/config';

const thisDir: string = toThisDir(import.meta.url);

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
