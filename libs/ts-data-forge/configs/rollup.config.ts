import * as rollupPluginReplace from '@rollup/plugin-replace';
import * as rollupPluginStrip from '@rollup/plugin-strip';
import * as pluginTypescript from '@rollup/plugin-typescript';
import '../scripts/node-global.mjs';
import tsconfig from './tsconfig.build.json' with { type: 'json' };

const outDirRelative = tsconfig.compilerOptions.outDir;

const configDir = path.resolve(projectRootPath, './configs');

const srcDir = path.resolve(projectRootPath, './src');

const input = await glob(path.resolve(srcDir, './**/*.mts'), {
  ignore: ['**/*.test.mts', './**/*.d.mts'],
});

export default {
  input,
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
      module: 'NodeNext',
    }),
    rollupPluginReplace.default({
      "import 'vitest'": 'undefined',
      preventAssignment: true,
    }),
    rollupPluginStrip.default({
      functions: ['expectType'],
      include: '**/*.(mts|ts|mjs|js)',
    }),
  ],
};
