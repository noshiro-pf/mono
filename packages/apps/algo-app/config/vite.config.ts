// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { castWritable, tp } from '@noshiro/ts-utils';

// eslint-disable-next-line import/no-named-as-default
import preact from '@preact/preset-vite';
import inject from '@rollup/plugin-inject';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import packageJson from '../package.json';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const {
  genGlobalImportDefsFromDevDependencies,
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, import/no-internal-modules, unicorn/prefer-module, import/no-unresolved
} = require('../../../../scripts/get-global-import-def-from-dev-dependencies');

const thisDir = dirname(fileURLToPath(import.meta.url));

const providePluginDefs = (
  genGlobalImportDefsFromDevDependencies as (
    pwd: string,
    devDependencies: Readonly<Record<string, string>>
  ) => Record<string, readonly [string, string]>
)(thisDir, packageJson.devDependencies);

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [
    preact(),
    inject({
      modules: castWritable({
        ...providePluginDefs,
        dict: tp('@/constants/dictionary/dictionary', 'dict'),
      }),
      include: ['src/**/*.ts', 'src/**/*.tsx'] as const,
    }),
  ],
  build: {
    outDir: 'build',
  },
  resolve: {
    alias: [{ find: '@', replacement: resolve(thisDir, '../', 'src') }],
  },
});
