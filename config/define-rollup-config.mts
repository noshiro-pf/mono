import * as rollupPluginReplace from '@rollup/plugin-replace';
import * as pluginTypescript from '@rollup/plugin-typescript';
import path from 'node:path';
import { RollupOptions, defineConfig } from 'rollup';

export const defineRollupConfig = ({
  thisDir,
  outDirRelative,
}: Readonly<{
  thisDir: string;
  outDirRelative: string;
}>): RollupOptions =>
  defineConfig({
    input: path.resolve(thisDir, './src/index.mts'),
    output: {
      dir: path.resolve(thisDir, outDirRelative),
      preserveModules: true,
      sourcemap: true,
    },
    plugins: [
      // @ts-expect-error ???
      rollupPluginReplace.default({
        'import.meta.vitest': 'undefined',
        preventAssignment: true,
      }),
      // @ts-expect-error ???
      pluginTypescript.default({
        tsconfig: path.resolve(thisDir, './tsconfig.build.json'),
      }),
      // @ts-expect-error ???
      rollupPluginReplace.default({
        "import 'vitest'": 'undefined',
        preventAssignment: true,
      }),
    ],
  });
