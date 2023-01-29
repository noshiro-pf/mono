import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const thisDir = dirname(fileURLToPath(import.meta.url));

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [
      '@noshiro/global-goober',
      '@noshiro/global-preact',
      '@noshiro/global-preact-utils',
      '@noshiro/global-syncflow',
      '@noshiro/global-syncflow-preact-hooks',
      '@noshiro/global-tiny-router-observable',
      '@noshiro/global-tiny-router-preact-hooks',
      '@noshiro/global-ts-utils',
      '@noshiro/ts-type-utils',
    ],
    typecheck: {
      tsconfig: resolve(thisDir, 'tsconfig.test.json'),
    },
  },
});
