import * as rollupPluginReplace from '@rollup/plugin-replace';
import * as rollupPluginStrip from '@rollup/plugin-strip';
import * as pluginTypescript from '@rollup/plugin-typescript';
import * as glob from 'glob';
import path from 'node:path';
export const defineRollupConfig = ({
  configDir,
  outDirRelative,
  variablesToDrop,
}) => ({
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
      preventAssignment: true,
    }),
    pluginTypescript.default({
      tsconfig: path.resolve(configDir, './tsconfig.build.json'),
    }),
    rollupPluginReplace.default({
      "import 'vitest'": 'undefined',
      preventAssignment: true,
    }),
    rollupPluginStrip.default({
      functions: variablesToDrop,
      include: '**/*.(mts|ts|mjs|js)',
    }),
  ],
});
