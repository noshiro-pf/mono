/* eslint-disable import/no-default-export */
/* eslint-disable import/no-internal-modules */

import { toThisDir } from '@noshiro/mono-utils';
import * as rollupPluginReplace from '@rollup/plugin-replace';
import * as pluginTypescript from '@rollup/plugin-typescript';
import path from 'node:path';
import { defineConfig } from 'rollup';
import { defineRollupConfig } from '../../../../configs/define-rollup-config.mjs';
import tsconfig from './tsconfig.build.json' with { type: 'json' };

const configDir = toThisDir(import.meta.url);

const defaultConfig = defineRollupConfig({
  configDir,
  outDirRelative: tsconfig.compilerOptions.outDir,
});

export default defineConfig({
  ...defaultConfig,
  plugins: [
    // @ts-expect-error ???
    rollupPluginReplace.default({
      'import.meta.vitest': 'undefined',
      'console.debug': 'undefined',
      preventAssignment: true,
    }),

    // @ts-expect-error ???
    pluginTypescript.default({
      tsconfig: path.resolve(configDir, './tsconfig.build.json'),
    }),

    // @ts-expect-error ???
    rollupPluginReplace.default({
      "import 'vitest'": 'undefined',
      preventAssignment: true,
    }),
  ],
});
