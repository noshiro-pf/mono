import * as rollupPluginReplaceNs from '@rollup/plugin-replace';
import * as rollupPluginStripNs from '@rollup/plugin-strip';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { defineConfig, type Plugin as RollupPlugin } from 'rollup';
import * as rollupPluginEsbuildNs from 'rollup-plugin-esbuild';
import { castMutable, unknownToString } from 'ts-data-forge';
import { glob, Result } from 'ts-repo-utils';
import { projectRootPath } from '../scripts/project-root-path.mjs';
import tsconfig from './tsconfig.build.json' with { type: 'json' };

/**
 * Resolves the actual default export of a module in a way that satisfies both
 * the type checker and the runtime.
 *
 * The `@rollup/plugin-*` packages and `rollup-plugin-esbuild` ship
 * CommonJS-flavored type declarations (no ESM-specific `.d.mts`), so under
 * `"moduleResolution": "nodenext"`
 * TypeScript types the namespace as the CJS `module.exports` wrapper
 * (`ns.default` = the whole module, `ns.default.default` = the factory),
 * while at runtime this config is executed as ESM (the `import` condition
 * resolves to the plugins' ES builds), where `ns.default` is already the
 * factory itself. TypeScript <= 5.9 could align the two views with
 * `"allowSyntheticDefaultImports": false`, but disabling that option is
 * deprecated in TypeScript 6.0 (TS5107) and stops functioning in 7.0, so
 * neither `ns.default(...)` nor `ns.default.default(...)` alone can pass both
 * checks anymore. This helper unwraps `.default` chains until it reaches the
 * factory, which is correct for both views.
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
 * Source files import sibling modules with the `.mjs` extension that they
 * will have after the build (Node16/NodeNext-style ESM imports), but the
 * files on disk are `.mts`. `@rollup/plugin-typescript` used to perform this
 * mapping via the TypeScript module resolver; `rollup-plugin-esbuild` does
 * not, so resolve it here.
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

const configDir = path.resolve(projectRootPath, './configs');

const srcDir = path.resolve(projectRootPath, './src');

const globResult = await glob(path.resolve(srcDir, './**/*.mts'), {
  ignore: ['**/*.test.mts', './**/*.d.mts'],
});

if (Result.isErr(globResult)) {
  throw new Error(
    `Failed to glob source files: ${unknownToString(globResult.value)}`,
  );
}

export default defineConfig({
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
    rollupPluginResolveMtsFromMjs,
    rollupPluginReplace({
      'import.meta.vitest': 'undefined',
      preventAssignment: true,
    }),
    // Transpile TypeScript with esbuild. TypeScript 7 (native) no longer
    // provides the JS compiler API that `@rollup/plugin-typescript` requires,
    // so transpilation is done with esbuild here, and type checking &
    // declaration emit are done with the native `tsc` in
    // `scripts/cmd/build.mts`.
    rollupPluginEsbuild({
      target: 'esnext',
      sourceMap: true,
      loaders: {
        '.mts': 'ts',
      },
      tsconfig: path.resolve(configDir, './tsconfig.build.json'),
    }),
    rollupPluginReplace({
      "import 'vitest'": 'undefined',
      preventAssignment: true,
    }),
    rollupPluginStrip({
      functions: ['expectType'],
      include: '**/*.(mts|ts|mjs|js)',
    }),
  ],
});
