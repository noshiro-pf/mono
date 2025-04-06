import * as rollupPluginReplace from '@rollup/plugin-replace';
import * as pluginTypescript from '@rollup/plugin-typescript';
import * as glob from 'glob';
import path from 'node:path';
import { RollupOptions } from 'rollup';

export const defineRollupConfig = ({
  configDir,
  outDirRelative,
}: Readonly<{
  configDir: string;
  outDirRelative: string;
}>) =>
  ({
    input: glob.globSync(path.resolve(configDir, '../src/**/*.mts'), {
      ignore: '**/*.test.mts',
    }),
    output: {
      format: 'es',
      dir: path.resolve(configDir, outDirRelative),
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap: true,
      entryFileNames: '[name].mjs',
    },
    plugins: [
      // @ts-expect-error ???
      rollupPluginReplace.default({
        'import.meta.vitest': 'undefined',
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
  }) as const satisfies RollupOptions;
