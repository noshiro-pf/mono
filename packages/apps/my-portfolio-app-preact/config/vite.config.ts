/* eslint-disable import/no-internal-modules */

import { providePluginGooberDef } from '@noshiro/global-goober/cjs/provide-plugin-def';
import { providePluginPreactUtilsDef } from '@noshiro/global-preact-utils/cjs/provide-plugin-def';
import { providePluginPreactDef } from '@noshiro/global-preact/cjs/provide-plugin-def';
import { providePluginSyncflowPreactHooksDef } from '@noshiro/global-syncflow-preact-hooks/cjs/provide-plugin-def';
import { providePluginSyncflowDef } from '@noshiro/global-syncflow/cjs/provide-plugin-def';
import { providePluginTinyRouterPreactHooksDef } from '@noshiro/global-tiny-router-preact-hooks/cjs/provide-plugin-def';
import { providePluginTsUtilsDef } from '@noshiro/global-ts-utils/cjs/provide-plugin-def';

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { castWritable } from '@noshiro/ts-utils';

// eslint-disable-next-line import/no-named-as-default
import preact from '@preact/preset-vite';
import inject from '@rollup/plugin-inject';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import mdPlugin, { Mode } from 'vite-plugin-markdown';

const thisDir = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [
    preact(),
    mdPlugin({ mode: [Mode.REACT] }),
    inject({
      modules: castWritable({
        ...providePluginPreactDef,
        ...providePluginPreactUtilsDef,
        ...providePluginSyncflowDef,
        ...providePluginSyncflowPreactHooksDef,
        ...providePluginTsUtilsDef,
        ...providePluginTinyRouterPreactHooksDef,
        ...providePluginGooberDef,
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
