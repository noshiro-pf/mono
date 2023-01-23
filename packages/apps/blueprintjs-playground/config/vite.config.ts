/* eslint-disable import/no-internal-modules */

import { providePluginReactUtilsDef } from '@noshiro/global-react-utils/cjs/provide-plugin-def';
import { providePluginReactDef } from '@noshiro/global-react/cjs/provide-plugin-def';
import { providePluginStyledComponentsDef } from '@noshiro/global-styled-components/cjs/provide-plugin-def';
import { providePluginSyncflowReactHooksDef } from '@noshiro/global-syncflow-react-hooks/cjs/provide-plugin-def';
import { providePluginSyncflowDef } from '@noshiro/global-syncflow/cjs/provide-plugin-def';
import { providePluginTinyRouterReactHooksDef } from '@noshiro/global-tiny-router-react-hooks/cjs/provide-plugin-def';
import { providePluginTsUtilsDef } from '@noshiro/global-ts-utils/cjs/provide-plugin-def';

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { castWritable, tp } from '@noshiro/ts-utils';
import inject from '@rollup/plugin-inject';
import react from '@vitejs/plugin-react-swc';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const thisDir = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [
    react(),
    inject({
      modules: castWritable({
        ...providePluginReactDef,
        ...providePluginReactUtilsDef,
        ...providePluginStyledComponentsDef,
        ...providePluginSyncflowDef,
        ...providePluginSyncflowReactHooksDef,
        ...providePluginTsUtilsDef,
        ...providePluginTinyRouterReactHooksDef,
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
