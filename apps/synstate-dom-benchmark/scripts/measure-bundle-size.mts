import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as util from 'node:util';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { version as viteVersion } from 'vite';
// eslint-disable-next-line import-x/no-relative-packages -- shared with synstate-docs' measurement (#3066)
import * as bundleSize from '../../../tools/scripts/lib/bundle-size.mjs';
import { benchmarkSets, type BenchmarkSet } from './benchmark-sets.mjs';
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
 *
 * ```sh
 * pnpm run bundle-size -- --next
 * ```
 *
 * With `--next`, the bundles are those of synstate-dom, synstate-dom-next and
 * Solid, the libraries `pnpm run benchmark:next` times, and the sizes go to
 * BUNDLE-SIZE-NEXT.md, which synstate-dom-next-docs embeds.
 */
const main = async (): Promise<void> => {
  // `pnpm run bundle-size -- --next` passes the `--` on.
  const args = Arr.skip(process.argv, 2);

  const [first, ...rest] = args;

  const { values } = util.parseArgs({
    args: first === '--' ? rest : args,
    options: { next: { type: 'boolean', default: false } },
  });

  const set = sets[values.next ? 'next' : 'all'];

  const { libraries } = set;

  const sizes = await bundleSize.mapInSequence(
    applications,
    async (application) =>
      bundleSize.mapInSequence(libraries, async (library) => {
        const measured = bundleSize.compressedSizesOf(
          await bundle(entryOf(application, library)),
        );

        console.info(
          `${application.name} / ${library.name}: ${bundleSize.formatKb(measured.gzip)} kB gzipped`,
        );

        return measured;
      }),
  );

  const versions = await Promise.all(
    libraries.flatMap(({ packages }) => packages).map(versionOf),
  );

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    path.resolve(workspaceRootPath, set.fileName),
    render(set, sizes, versions),
    'utf8',
  );

  console.info(`✓ Wrote ${set.fileName}`);
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

type Sizes = bundleSize.CompressedSizes;

const synstateDom: Library = {
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
} as const;

const synstateDomNext: Library = {
  name: 'synstate-dom-next',
  packages: ['synstate-dom-next', 'synstate-next'],
  entryPoints: ['synstate-dom-next', 'synstate-next'],
  fileName: 'synstate-dom-next.tsx',
  exportName: {
    counter: 'synstateDomNextCounter',
    table: 'synstateDomNext',
    loan: 'synstateDomNextLoan',
    schedule: 'synstateDomNextSchedule',
    zoom: 'synstateDomNextZoom',
  },
} as const;

const solid: Library = {
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
} as const;

const otherLibraries: readonly Library[] = [
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

type BundleSet = Readonly<{
  libraries: readonly Library[];
  fileName: string;
  command: string;
  /** The script that times these libraries, which BUNDLE-SIZE*.md names. */
  timedBy: string;
}>;

/** One per benchmark set, with that set's libraries. */
const sets = {
  all: {
    libraries: [synstateDom, solid, ...otherLibraries],
    fileName: 'BUNDLE-SIZE.md',
    command: 'pnpm run bundle-size',
    timedBy: `pnpm run ${benchmarkSets.all.script}`,
  },
  next: {
    libraries: [synstateDom, synstateDomNext, solid],
    fileName: 'BUNDLE-SIZE-NEXT.md',
    command: 'pnpm run bundle-size -- --next',
    timedBy: `pnpm run ${benchmarkSets.next.script}`,
  },
} as const satisfies ReadonlyRecord<BenchmarkSet, BundleSet>;

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

/** Builds `source` as the only entry and returns the code of every chunk. */
const bundle = async (source: string): Promise<string> => {
  const chunks = await bundleSize.bundleWithVite(source, () => ({
    ...createProductionConfig(),
    root: workspaceRootPath,
    logLevel: 'warn',
  }));

  return chunks.map(({ code }) => code).join('');
};

const versionOf = async (packageName: string): Promise<string> =>
  `${packageName} ${await bundleSize.installedVersionOf(packageName, [
    path.resolve(
      workspaceRootPath,
      'node_modules',
      packageName,
      'package.json',
    ),
  ])}` as const;

const sections = [
  ['Minified and gzipped', 'gzip'],
  ['Minified and Brotli-compressed', 'brotli'],
  ['Minified', 'minified'],
] as const;

const render = (
  { libraries, command, timedBy }: BundleSet,
  sizes: readonly (readonly Sizes[])[],
  versions: readonly string[],
): string =>
  [
    '# Bundle size',
    '',
    `<!-- Written by \`${command}\`; edits here are overwritten. -->`,
    '',
    `Each figure is the size of one application bundled by Vite ${viteVersion} with the production build of every library, as \`${timedBy}\` compiles it, then minified; gzip at level 9, Brotli at quality 11. One kB is 1,000 bytes. Versions: ${versions.map((v) => `\`${v}\``).join(', ')}. See README.md for what each application is.`,
    '',
    ...sections.flatMap(([heading, key]) => [
      `## ${heading}`,
      '',
      `| application (kB) | ${libraries.map(({ name }) => name).join(' | ')} |`,
      `| :-- | ${libraries.map(() => '--:').join(' | ')} |`,
      ...applications.map(
        ({ name }, i) =>
          `| ${name} | ${(sizes[i] ?? []).map((s) => bundleSize.formatKb(s[key])).join(' | ')} |`,
      ),
      '',
    ]),
  ].join('\n');

await main();
