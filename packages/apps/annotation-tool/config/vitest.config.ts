// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { Obj } from '@noshiro/ts-utils';

// eslint-disable-next-line @typescript-eslint/no-restricted-imports

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

import packageJson from '../package.json';

const thisDir = dirname(fileURLToPath(import.meta.url));

const globalUtils = Obj.keys(packageJson.devDependencies).filter(
  (packageName) => packageName.startsWith('@noshiro/global-')
);

// eslint-disable-next-line import/no-default-export
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
