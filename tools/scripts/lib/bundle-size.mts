import * as fs from 'node:fs/promises';
import * as zlib from 'node:zlib';
import { Arr, isRecord, isString } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { build, type UserConfig, type Plugin as VitePlugin } from 'vite';

/**
 * What the bundle-size measurements of `apps/synstate-dom-benchmark`
 * (`scripts/measure-bundle-size.mts`) and `apps/synstate-docs`
 * (`scripts/bundle-size-comparison.mts`) share (#3066): a fix to one is a fix
 * to both.
 */

/**
 * The production build of every library, as an application would ship it:
 * Solid and Preact carry development-only checks behind `NODE_ENV`, and some
 * packages export a production build under the `production` condition.
 */
export const productionBuildConfig = (): UserConfig =>
  ({
    mode: 'production',
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    resolve: {
      conditions: ['module', 'browser', 'production'],
    },
  }) as const;

/** One chunk of a bundle, and the length each module renders to in it. */
export type BundleChunk = Readonly<{
  code: string;
  modules: readonly (readonly [string, number])[];
}>;

/**
 * Builds `source` as the only entry with Vite, minified and not written, and
 * returns its chunks. What `createConfig` returns is spread under the settings
 * this sets, so it gives `root`, `logLevel` and whatever compiles the
 * libraries; a function, because a plugin such as Solid's keeps state per
 * build.
 */
export const bundleWithVite = async (
  source: string,
  createConfig: () => UserConfig,
): Promise<readonly BundleChunk[]> => {
  const entryPlugin: VitePlugin = {
    name: 'bundle-size-entry',
    resolveId: (id) => (id === entryId ? entryId : undefined),
    load: (id) => (id === entryId ? source : undefined),
  } as const;

  // Read as `unknown`: typescript-eslint does not resolve Rolldown's output
  // types.
  const output: unknown = await build({
    ...createConfig(),
    configFile: false,
    build: {
      write: false,
      minify: true,
      modulePreload: { polyfill: false },
      reportCompressedSize: false,
      rolldownOptions: { input: entryId, plugins: [entryPlugin] },
    },
  });

  const mut_chunks: BundleChunk[] = [];

  for (const result of Arr.isArray(output) ? output : [output]) {
    const files = isRecord(result) ? result['output'] : undefined;

    if (!Arr.isArray(files)) {
      throw new TypeError('the build returned no output');
    }

    for (const file of files) {
      if (
        !isRecord(file) ||
        file['type'] !== 'chunk' ||
        !isString(file['code'])
      ) {
        continue;
      }

      mut_chunks.push({ code: file['code'], modules: modulesOf(file) });
    }
  }

  return mut_chunks;
};

const entryId = '\0bundle-size-entry.js';

/** The sizes of `code` minified, gzipped at level 9, and Brotli at quality 11. */
export const compressedSizesOf = (code: string): CompressedSizes => {
  const buffer = Buffer.from(code, 'utf8');

  return {
    minified: buffer.byteLength,
    gzip: zlib.gzipSync(buffer, { level: zlib.constants.Z_BEST_COMPRESSION })
      .byteLength,
    brotli: zlib.brotliCompressSync(buffer, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]:
          zlib.constants.BROTLI_MAX_QUALITY,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buffer.byteLength,
      },
    }).byteLength,
  } as const;
};

/**
 * `bytes` in tenths of a kB, rounded half up: what {@link formatKb} prints.
 * (`toFixed` alone would round a binary fraction such as 11.95 down.)
 */
export const tenthsOfKb = (bytes: number): number => Math.round(bytes / 100);

/** `bytes` in kB to one decimal; one kB is 1,000 bytes. */
export const formatKb = (bytes: number): string =>
  (tenthsOfKb(bytes) / 10).toFixed(1);

/**
 * `Array#map` with an async callback, one element at a time: a bundler already
 * uses every core for each build.
 */
export const mapInSequence = async <A, B>(
  values: readonly A[],
  fn: (value: A) => Promise<B>,
): Promise<readonly B[]> => {
  const mut_results: B[] = [];

  for (const value of values) {
    mut_results.push(await fn(value));
  }

  return mut_results;
};

/**
 * The version in the first of `manifestPaths` that exists and is
 * `packageName`'s manifest.
 */
export const installedVersionOf = async (
  packageName: string,
  manifestPaths: readonly string[],
): Promise<string> => {
  for (const manifestPath of manifestPaths) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const text = await fs.readFile(manifestPath, 'utf8').catch(() => undefined);

    const manifest: unknown = text === undefined ? undefined : JSON.parse(text);

    if (
      isRecord(manifest) &&
      manifest['name'] === packageName &&
      isString(manifest['version'])
    ) {
      return manifest['version'];
    }
  }

  throw new Error(`cannot find the version of ${packageName}`);
};

const modulesOf = (
  chunk: ReadonlyRecord<string, unknown>,
): readonly (readonly [string, number])[] => {
  const modules = chunk['modules'];

  if (!isRecord(modules)) {
    throw new TypeError('a chunk has no module list');
  }

  return Object.entries(modules).map(([id, info]) => {
    const length = isRecord(info) ? info['renderedLength'] : undefined;

    if (typeof length !== 'number') {
      throw new TypeError(`${id} has no rendered length`);
    }

    return [id, length] as const;
  });
};

/** A bundle's size minified, and compressed as a server would precompress it. */
export type CompressedSizes = Readonly<{
  minified: number;
  gzip: number;
  brotli: number;
}>;
