import 'ts-repo-utils';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    typecheck: {
      tsconfig: path.resolve(import.meta.dirname, 'tsconfig.test.json'),
    },
    include: ['test/**/*.test.stream.mts'],
    testTimeout: 30_000,
    silent: true,
  },
});
