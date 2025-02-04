import * as path from 'node:path';
import { defineConfig } from 'vitest/config';
import { toThisDir } from '../src/index.mjs';

const thisDir: string = toThisDir(import.meta.url);

export default defineConfig({
  test: {
    globals: true,
    typecheck: {
      tsconfig: path.resolve(thisDir, 'tsconfig.test.json'),
    },
  },
});
