import preact from '@preact/preset-vite';
import inject from '@rollup/plugin-inject';
import { defineConfig } from 'vite';

import { providePluginGooberDef } from '@noshiro/global-goober/cjs/provide-plugin-def';
import { providePluginPreactUtilsDef } from '@noshiro/global-preact-utils/cjs/provide-plugin-def';
import { providePluginPreactDef } from '@noshiro/global-preact/cjs/provide-plugin-def';
import { providePluginSyncflowPreactHooksDef } from '@noshiro/global-syncflow-preact-hooks/cjs/provide-plugin-def';
import { providePluginSyncflowDef } from '@noshiro/global-syncflow/cjs/provide-plugin-def';
import { providePluginTinyRouterPreactHooksDef } from '@noshiro/global-tiny-router-preact-hooks/cjs/provide-plugin-def';
import { providePluginTsUtilsDef } from '@noshiro/global-ts-utils/cjs/provide-plugin-def';

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [
    preact(),
    inject({
      ...providePluginPreactDef,
      ...providePluginPreactUtilsDef,
      ...providePluginSyncflowDef,
      ...providePluginSyncflowPreactHooksDef,
      ...providePluginTsUtilsDef,
      ...providePluginTinyRouterPreactHooksDef,
      ...providePluginGooberDef,
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    }),
  ],
});
