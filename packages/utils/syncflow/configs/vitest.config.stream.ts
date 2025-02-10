import { toThisDir } from '@noshiro/mono-utils';
import * as nodePath from 'node:path';
import { defineConfig } from 'vitest/config';

const thisDir: string = toThisDir(import.meta.url);

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
