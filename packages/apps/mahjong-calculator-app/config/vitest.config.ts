// eslint-disable-next-line @typescript-eslint/no-restricted-imports

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

import packageJson from '../package.json' assert { type: 'json' };

const thisDir = dirname(fileURLToPath(import.meta.url));

const globalUtils = Object.keys(packageJson.devDependencies).filter(
  (packageName) => packageName.startsWith('@noshiro/global-')
);

// eslint-disable-next-line import/no-default-export, import/no-unused-modules
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [...globalUtils, resolve(thisDir, 'globals.ts')],
    typecheck: {
      tsconfig: resolve(thisDir, 'tsconfig.test.json'),
    },
  },
});