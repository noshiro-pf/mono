import * as rollupPluginReplace from '@rollup/plugin-replace';
import * as pluginTypescript from '@rollup/plugin-typescript';
import * as glob from 'glob';
import path from 'node:path';
import { RollupOptions } from 'rollup';

export const defineRollupConfig = ({
  configDir,
  outDirRelative,
  variablesToDrop,
}: Readonly<{
  configDir: string;
  outDirRelative: string;
  variablesToDrop?: readonly string[];
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
      rollupPluginReplace.default({
        'import.meta.vitest': 'undefined',
        ...Object.fromEntries(
          variablesToDrop?.map((v) => [v, 'undefined']) ?? [],
        ),
        preventAssignment: true,
      }),

      pluginTypescript.default({
        tsconfig: path.resolve(configDir, './tsconfig.build.json'),
      }),

      rollupPluginReplace.default({
        "import 'vitest'": 'undefined',
        preventAssignment: true,
      }),
    ],
  }) as const satisfies RollupOptions;
