// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { castWritable, tp } from '@noshiro/ts-utils';
import inject from '@rollup/plugin-inject';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react-swc';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { genGlobalImportDefsFromDevDependencies } from '../../../../scripts/get-global-import-def-from-dev-dependencies.mjs';
import packageJson from '../package.json' assert { type: 'json' };

const thisDir = dirname(fileURLToPath(import.meta.url));

const providePluginDefs = genGlobalImportDefsFromDevDependencies(
  thisDir,
  packageJson.devDependencies
);

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export, import/no-unused-modules
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
    inject({
      modules: castWritable({
        ...providePluginDefs,
        dict: tp('@/constants/dictionary/dictionary', 'dict'),
      }),
      include: ['src/**/*.ts', 'src/**/*.tsx'] as const,
    }),
    legacy(),
  ],
  build: {
    outDir: 'build',
  },
  resolve: {
    alias: [{ find: '@', replacement: resolve(thisDir, '../', 'src') }],
  },
});
