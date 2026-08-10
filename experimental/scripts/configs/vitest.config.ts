import * as path from 'node:path';
import { defineConfig } from 'vitest/config';

const thisDir: string = import.meta.dirname;

export default defineConfig({
  test: {
    globals: true,
    typecheck: {
      tsconfig: path.resolve(thisDir, 'tsconfig.test.json'),
    },
  },
});
