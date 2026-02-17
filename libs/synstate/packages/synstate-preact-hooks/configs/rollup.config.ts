import * as rollupPluginReplace from '@rollup/plugin-replace';
import * as rollupPluginStrip from '@rollup/plugin-strip';
import * as rollupPluginTypescript from '@rollup/plugin-typescript';
import { castMutable, unknownToString } from 'ts-data-forge';
import 'ts-repo-utils';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
import tsconfig from './tsconfig.build.json' with { type: 'json' };

const outDirRelative = tsconfig.compilerOptions.outDir;

const configDir = path.resolve(workspaceRootPath, './configs');

const srcDir = path.resolve(workspaceRootPath, './src');

const globResult = await glob(path.resolve(srcDir, './**/*.mts'), {
  ignore: ['**/*.test.mts', './**/*.d.mts'],
});

if (Result.isErr(globResult)) {
  throw new Error(
    `Failed to glob source files: ${unknownToString(globResult.value)}`,
  );
}

export default {
  input: castMutable(globResult.value),
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
    rollupPluginTypescript.default({
      tsconfig: path.resolve(configDir, './tsconfig.build.json'),
      compilerOptions: {
        // Override module settings for bundling
        module: 'ESNext',
        moduleResolution: 'bundler',
      },
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
