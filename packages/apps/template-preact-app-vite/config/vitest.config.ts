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
      '@noshiro/global-ts-utils',
      '@noshiro/global-react-utils',
      '@noshiro/global-syncflow',
      '@noshiro/global-syncflow-react-hooks',
      '@noshiro/global-react',
      '@noshiro/global-styled-components',
      resolve(thisDir, 'globals.ts'),
    ],
    typecheck: {
      tsconfig: resolve(thisDir, 'tsconfig.test.json'),
    },
  },
});
