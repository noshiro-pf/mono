import * as rollupPluginReplaceNs from '@rollup/plugin-replace';
import * as rollupPluginStripNs from '@rollup/plugin-strip';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { defineConfig, type Plugin as RollupPlugin } from 'rollup';
import * as rollupPluginEsbuildNs from 'rollup-plugin-esbuild';
import { glob, Result } from 'ts-repo-utils';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
import tsconfig from './tsconfig.build.json' with { type: 'json' };

/**
 * Resolves the actual default export of a CommonJS-flavored module so it works
 * under both the type checker and at runtime. See the core package's rollup
 * config for the full rationale.
 */
const interopDefault = <T,>(moduleDefaultExport: T): UnwrapDefault<T> => {
  const mut_ref: { current: unknown } = { current: moduleDefaultExport };

  for (;;) {
    const { current } = mut_ref;

    if (
      (typeof current !== 'object' && typeof current !== 'function') ||
      current === null
    ) {
      break;
    }

    const next: unknown = Reflect.get(current, 'default');

    if (next === undefined || next === current) {
      break;
    }

    mut_ref.current = next;
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return mut_ref.current as UnwrapDefault<T>;
};

type UnwrapDefault<T> =
  T extends Readonly<{ default: infer D }> ? UnwrapDefault<D> : T;

const rollupPluginReplace = interopDefault(rollupPluginReplaceNs.default);

const rollupPluginStrip = interopDefault(rollupPluginStripNs.default);

const rollupPluginEsbuild = interopDefault(rollupPluginEsbuildNs.default);

/**
 * Source files import sibling modules with the `.mjs` extension they will have
 * after the build, but on disk they are `.mts`. `rollup-plugin-esbuild` does
 * not perform this mapping, so resolve it here.
 */
const rollupPluginResolveMtsFromMjs: RollupPlugin = {
  name: 'resolve-mts-from-mjs',
  resolveId: (source, importer) => {
    if (
      importer !== undefined &&
      source.startsWith('.') &&
      source.endsWith('.mjs')
    ) {
      const candidate = path.resolve(
        path.dirname(importer),
        `${source.slice(0, -'.mjs'.length)}.mts`,
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  },
};

const outDirRelative = tsconfig.compilerOptions.outDir;

const configDir = path.resolve(workspaceRootPath, './configs');

const srcDir = path.resolve(workspaceRootPath, './src');

const globResult = await glob(path.resolve(srcDir, './**/*.mts'), {
  ignore: ['**/*.test.mts', '**/*.d.mts'],
});

if (Result.isErr(globResult)) {
  throw new Error('Failed to glob source files', { cause: globResult.value });
}

export default defineConfig({
  input: Array.from(globResult.value),
  output: {
    format: 'es',
    dir: path.resolve(configDir, outDirRelative),
    preserveModules: true,
    preserveModulesRoot: 'src',
    sourcemap: true,
    entryFileNames: '[name].mjs',
  },
  plugins: [
    rollupPluginResolveMtsFromMjs,
    rollupPluginReplace({
      'import.meta.vitest': 'undefined',
      preventAssignment: true,
    }),
    rollupPluginEsbuild({
      target: 'esnext',
      sourceMap: true,
      loaders: {
        '.mts': 'ts',
      },
      tsconfig: path.resolve(configDir, './tsconfig.build.json'),
    }),
    rollupPluginStrip({
      functions: ['expectType'],
      include: '**/*.(mts|ts|mjs|js)',
    }),
  ],
});
