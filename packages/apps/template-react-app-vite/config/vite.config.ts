import inject from '@rollup/plugin-inject';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

import { providePluginReactUtilsDef } from '@noshiro/global-react-utils/cjs/provide-plugin-def';
import { providePluginReactDef } from '@noshiro/global-react/cjs/provide-plugin-def';
import { providePluginStyledComponentsDef } from '@noshiro/global-styled-components/cjs/provide-plugin-def';
import { providePluginSyncflowReactHooksDef } from '@noshiro/global-syncflow-react-hooks/cjs/provide-plugin-def';
import { providePluginSyncflowDef } from '@noshiro/global-syncflow/cjs/provide-plugin-def';
import { providePluginTinyRouterReactHooksDef } from '@noshiro/global-tiny-router-react-hooks/cjs/provide-plugin-def';
import { providePluginTsUtilsDef } from '@noshiro/global-ts-utils/cjs/provide-plugin-def';

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [
    react(),
    inject({
      ...providePluginReactDef,
      ...providePluginReactUtilsDef,
      ...providePluginStyledComponentsDef,
      ...providePluginSyncflowDef,
      ...providePluginSyncflowReactHooksDef,
      ...providePluginTsUtilsDef,
      ...providePluginTinyRouterReactHooksDef,
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    }),
  ],
});
