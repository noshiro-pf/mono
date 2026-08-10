import * as nodePath from 'node:path';
import { defineConfig } from 'vitest/config';

const thisDir: string = import.meta.dirname;

export default defineConfig({
  test: {
    globals: true,
    typecheck: {
      tsconfig: nodePath.resolve(thisDir, 'tsconfig.test.json'),
    },
  },
});
