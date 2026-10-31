import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as zlib from 'node:zlib';
import { Arr, isRecord, isString, unknownToString } from 'ts-data-forge';
import { build, version as viteVersion, type Plugin as VitePlugin } from 'vite';
import { mapInSequence } from './map-in-sequence.mjs';
import { createProductionConfig } from './production-config.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Bundles each library's implementations under `src/` as an application would
 * ship them, and writes their sizes to BUNDLE-SIZE.md.
 *
 * ```sh
 * pnpm run bundle-size
 * ```
 *
 * Every bundle is built by the same Vite, with the configuration the timed run
 * uses (`scripts/production-config.mts`), so that the code measured here is the
 * code timed there and each library is tree-shaken alike. A bundle is minified
 * and then compressed with gzip and with Brotli at their highest levels, as a
 * server would precompress it.
 *
 * Unlike the timings, the sizes depend on nothing but the sources and the
 * installed versions, so one run is enough. Needs `pnpm run ws:build` first,
 * like `pnpm run benchmark`.
 */
const main = async (): Promise<void> => {
  const sizes = await mapInSequence(applications, async (application) =>
    mapInSequence(libraries, async (library) => {
      const measured = sizesOf(await bundle(entryOf(application, library)));

      console.info(
        `${application.name} / ${library.name}: ${formatKb(measured.gzip)} kB gzipped`,
      );

      return measured;
    }),
  );

  const versions = await Promise.all(
    libraries.flatMap(({ packages }) => packages).map(versionOf),
  );

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    path.resolve(workspaceRootPath, 'BUNDLE-SIZE.md'),
    render(sizes, versions),
    'utf8',
  );

  console.info('✓ Wrote BUNDLE-SIZE.md');
};

type Library = Readonly<{
  name: string;
  /** The packages whose versions BUNDLE-SIZE.md names. */
  packages: readonly string[];
  /** The entry points the "everything exported" row imports whole. */
  entryPoints: readonly string[];
  /** The export of each application's file under `src/`. */
  exportName: Readonly<{
    counter: string;
    table: string;
    loan: string;
    schedule: string;
    zoom: string;
  }>;
  /** The base name of the library's file in each directory under `src/`. */
  fileName: string;
}>;

type ApplicationKey = keyof Library['exportName'];

type Application = Readonly<{
  name: string;
  /**
   * The application's directory under `src/` and the key of its export, or
   * `undefined` for the row that imports every entry point whole.
   */
  source: Readonly<{ directory: string; key: ApplicationKey }> | undefined;
}>;

type Sizes = Readonly<{ minified: number; gzip: number; brotli: number }>;

const libraries: readonly Library[] = [
  {
    name: 'synstate-dom',
    packages: ['synstate-dom', 'synstate'],
    entryPoints: ['synstate-dom', 'synstate'],
    fileName: 'synstate-dom.tsx',
    exportName: {
      counter: 'synstateDomCounter',
      table: 'synstateDom',
      loan: 'synstateDomLoan',
      schedule: 'synstateDomSchedule',
      zoom: 'synstateDomZoom',
    },
  },
  {
    name: 'Solid',
    packages: ['solid-js'],
    entryPoints: ['solid-js', 'solid-js/web'],
    fileName: 'solid.tsx',
    exportName: {
      counter: 'solidCounter',
      table: 'solid',
      loan: 'solidLoan',
      schedule: 'solidSchedule',
      zoom: 'solidZoom',
    },
  },
  {
    name: 'Preact + Signals',
    packages: ['preact', '@preact/signals'],
    entryPoints: ['preact', 'preact/hooks', '@preact/signals'],
    fileName: 'preact-signals.tsx',
    exportName: {
      counter: 'preactSignalsCounter',
      table: 'preactSignals',
      loan: 'preactSignalsLoan',
      schedule: 'preactSignalsSchedule',
      zoom: 'preactSignalsZoom',
    },
  },
  {
    name: 'Preact',
    packages: [],
    entryPoints: ['preact', 'preact/hooks'],
    fileName: 'preact.tsx',
    exportName: {
      counter: 'preactCounter',
      table: 'preact',
      loan: 'preactLoan',
      schedule: 'preactSchedule',
      zoom: 'preactZoom',
    },
  },
  {
    name: 'React',
    packages: ['react', 'react-dom'],
    entryPoints: ['react', 'react-dom', 'react-dom/client'],
    fileName: 'react.tsx',
    exportName: {
      counter: 'reactCounter',
      table: 'react',
      loan: 'reactLoan',
      schedule: 'reactSchedule',
      zoom: 'reactZoom',
    },
  },
  {
    name: 'VanJS',
    packages: ['vanjs-core'],
    entryPoints: ['vanjs-core'],
    fileName: 'vanjs.mts',
    exportName: {
      counter: 'vanjsCounter',
      table: 'vanjs',
      loan: 'vanjsLoan',
      schedule: 'vanjsSchedule',
      zoom: 'vanjsZoom',
    },
  },
] as const;

const applications: readonly Application[] = [
  { name: 'everything exported', source: undefined },
  { name: 'counter', source: { directory: 'src/counter', key: 'counter' } },
  {
    name: 'js-framework-benchmark table',
    source: { directory: 'src/frameworks', key: 'table' },
  },
  {
    name: 'loan scenario',
    source: { directory: 'src/scenarios/loan', key: 'loan' },
  },
  {
    name: 'schedule scenario',
    source: { directory: 'src/scenarios/schedule', key: 'schedule' },
  },
  {
    name: 'zoom scenario',
    source: { directory: 'src/scenarios/zoom', key: 'zoom' },
  },
] as const;

/**
 * The source of the bundle's entry. An application is mounted and kept on
 * `globalThis`, so that nothing it returns is shaken off; the "everything
 * exported" row keeps each entry point's namespace object, which keeps every
 * export.
 */
const entryOf = (application: Application, library: Library): string => {
  const { source } = application;

  if (source === undefined) {
    const names = library.entryPoints.map((_, i) => `m${i}`);

    return Arr.toPushed(
      library.entryPoints.map(
        (entryPoint, i) => `import * as m${i} from '${entryPoint}';`,
      ),
      `globalThis.kept = [${names.join(', ')}];`,
    ).join('\n');
  }

  const file = path.resolve(
    workspaceRootPath,
    source.directory,
    library.fileName,
  );

  const exportName = library.exportName[source.key];

  return [
    `import { ${exportName} } from ${JSON.stringify(file)};`,
    `globalThis.kept = ${exportName}.mount(document.body);`,
  ].join('\n');
};

const entryId = '\0bundle-size-entry.js';

/** Builds `source` as the only entry and returns the code of every chunk. */
const bundle = async (source: string): Promise<string> => {
  const entryPlugin: VitePlugin = {
    name: 'bundle-size-entry',
    resolveId: (id) => (id === entryId ? entryId : undefined),
    load: (id) => (id === entryId ? source : undefined),
  } as const;

  // Read as `unknown`: typescript-eslint does not resolve Rolldown's output
  // types.
  const output: unknown = await build({
    ...createProductionConfig(),
    configFile: false,
    root: workspaceRootPath,
    logLevel: 'warn',
    build: {
      write: false,
      minify: true,
      modulePreload: { polyfill: false },
      reportCompressedSize: false,
      rolldownOptions: { input: entryId, plugins: [entryPlugin] },
    },
  });

  const mut_code: string[] = [];

  for (const result of Arr.isArray(output) ? output : [output]) {
    const files = isRecord(result) ? result['output'] : undefined;

    if (!Arr.isArray(files)) {
      throw new TypeError('the build returned no output');
    }

    for (const file of files) {
      if (
        isRecord(file) &&
        file['type'] === 'chunk' &&
        isString(file['code'])
      ) {
        mut_code.push(file['code']);
      }
    }
  }

  return mut_code.join('');
};

const sizesOf = (code: string): Sizes => {
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
  };
};

const versionOf = async (packageName: string): Promise<string> => {
  const manifest: unknown = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.readFile(
      path.resolve(
        workspaceRootPath,
        'node_modules',
        packageName,
        'package.json',
      ),
      'utf8',
    ),
  );

  return `${packageName} ${isRecord(manifest) ? unknownToString(manifest['version']) : '?'}`;
};

const sections = [
  ['Minified and gzipped', 'gzip'],
  ['Minified and Brotli-compressed', 'brotli'],
  ['Minified', 'minified'],
] as const;

const formatKb = (bytes: number): string => (bytes / 1000).toFixed(1);

const render = (
  sizes: readonly (readonly Sizes[])[],
  versions: readonly string[],
): string =>
  [
    '# Bundle size',
    '',
    '<!-- Written by `pnpm run bundle-size`; edits here are overwritten. -->',
    '',
    `Each figure is the size of one application bundled by Vite ${viteVersion} with the production build of every library, as \`pnpm run benchmark\` compiles it, then minified; gzip at level 9, Brotli at quality 11. One kB is 1,000 bytes. Versions: ${versions.map((v) => `\`${v}\``).join(', ')}. See README.md for what each application is.`,
    '',
    ...sections.flatMap(([heading, key]) => [
      `## ${heading}`,
      '',
      `| application (kB) | ${libraries.map(({ name }) => name).join(' | ')} |`,
      `| :-- | ${libraries.map(() => '--:').join(' | ')} |`,
      ...applications.map(
        ({ name }, i) =>
          `| ${name} | ${(sizes[i] ?? []).map((s) => formatKb(s[key])).join(' | ')} |`,
      ),
      '',
    ]),
  ].join('\n');

await main();
