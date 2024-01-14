import { toThisDir } from '@noshiro/mono-scripts/node-utils/path-utils.mjs';
import * as nodePath from 'node:path';
import { defineConfig } from 'vitest/config';

const thisDir: string = toThisDir(import.meta.url);

export default defineConfig({
  test: {
    globals: true,
    typecheck: {
      tsconfig: nodePath.resolve(thisDir, 'tsconfig.test.json'),
    },
    passWithNoTests: true,
  },
});
