import { build as esbuild, version as esbuildVersion } from 'esbuild';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as zlib from 'node:zlib';
import { Arr, Num, isRecord, isString } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import ts from 'typescript';
import {
  build as vite,
  version as viteVersion,
  type Plugin as VitePlugin,
} from 'vite';
import { comparisonLibraries } from './benchmark/environment.mjs';
import { scenarioDir } from './benchmark/paths.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Measures how much each library of the benchmark adds to an application: for
 * every scenario, the library's exports that the scenario's implementation
 * imports, bundled with everything they depend on.
 *
 * An entry is generated per scenario and library from the implementation's
 * `import` declarations, keeping each imported binding alive, so that a bundle
 * is the library code that implementation needs and nothing else. The
 * implementations' own code is left out, because it is benchmark harness (loops
 * over ts-data-forge's `range` and `Arr`) that would otherwise count against
 * every library but SynState, which depends on ts-data-forge already.
 *
 * Every bundle is built twice, by Vite (Rolldown) and by esbuild, for the
 * browser, minified, with each library's production build and every runtime
 * dependency included: the number is what an application ships, not the size of
 * one package. The two bundlers are both measured because they do not shake the
 * same code off, and the difference is not the same for every library.
 */
export const measureBundleSizeComparison =
  async (): Promise<BundleSizeComparison> => {
    const sources = await findSources();

    const measureWith = async (bundler: Bundler): Promise<BundlerResult> => {
      const mut_breakdown: (readonly [string, number])[] = [];

      const rows = await mapInSequence(scenarios, async (scenario) => ({
        scenario: scenario.name.en,
        cells: await mapInSequence(libraries, async (library) => {
          const source = sources.get(sourceKey(scenario, library));

          if (source === undefined) {
            return null;
          }

          const { sizes, bytesByPackage } = await sizeOfBundle(
            bundler,
            await entryFromImports(source),
          );

          if (scenario === singleStateScenario && library === synstateLibrary) {
            mut_breakdown.push(...bytesByPackage);
          }

          return sizes;
        }),
      }));

      const everything = await mapInSequence(libraries, async (library) => {
        const { sizes } = await sizeOfBundle(
          bundler,
          keepAlive(
            library.entryPoints.map((entryPoint) => ({
              specifier: entryPoint,
              names: ['*'],
            })),
          ),
        );

        return sizes;
      });

      return {
        rows,
        everything,
        breakdown: mut_breakdown.map(([packageName, bytes]) => ({
          packageName,
          bytes,
        })),
      };
    };

    const viteResult = await measureWith(viteBundler);

    const esbuildResult = await measureWith(esbuildBundler);

    const versions = await Promise.all(
      versionedPackages.map(async (packageName) => ({
        packageName,
        version: await versionOf(packageName),
      })),
    );

    return {
      libraries: libraries.map(({ name }) => name),
      bundlers: { vite: viteVersion, esbuild: esbuildVersion },
      versions,
      vite: viteResult,
      esbuild: esbuildResult,
    };
  };

export const renderBundleSizeTable = (
  comparison: BundleSizeComparison,
  bundler: 'vite' | 'esbuild',
  key: 'gzip' | 'brotli',
  language: 'en' | 'ja',
): string => {
  const { rows, everything } = checkedResult(comparison, bundler);

  return [
    `| ${language === 'en' ? 'Scenario' : 'シナリオ'} (kB) | ${libraries.map(({ name }) => (name === synstateLibrary.name ? `**${name}**` : name)).join(' | ')} |`,
    `| :-- | ${libraries.map(() => '--:').join(' | ')} |`,
    `| ${language === 'en' ? everythingRowName : 'すべてのエクスポート'} | ${everything.map((sizes) => formatKb(sizes[key])).join(' | ')} |`,
    ...scenarios.map((scenario, i) => {
      const cells = rows[i]?.cells ?? [];

      return `| [${scenario.name[language]}](${benchmarkPagePath(language)}#${scenario.anchor[language]}) | ${cells.map((sizes) => (sizes === null ? '—' : formatKb(sizes[key]))).join(' | ')} |`;
    }),
  ].join('\n');
};

/**
 * SynState's single-state bundle split by the package its code is from, as a
 * share of the bundle, one column per bundler. esbuild reports the minified
 * bytes of each module; Rolldown reports each module's length before the chunk
 * is minified, so Vite's shares are of the code before minification.
 */
export const renderBundleSizeBreakdown = (
  comparison: BundleSizeComparison,
  language: 'en' | 'ja',
): string => {
  const columns = (['vite', 'esbuild'] as const).map((bundler) => {
    const { rows, breakdown } = checkedResult(comparison, bundler);

    const gzip =
      rows[scenarios.indexOf(singleStateScenario)]?.cells[
        libraries.indexOf(synstateLibrary)
      ]?.gzip;

    if (gzip === undefined) {
      throw new Error('the single-state scenario has no SynState row');
    }

    return {
      gzip,
      bytesByPackage: new Map(
        breakdown.map(({ packageName, bytes }) => [packageName, bytes]),
      ),
    };
  });

  const totals = columns.map(({ bytesByPackage }) =>
    Arr.sum(Array.from(bytesByPackage.values())),
  );

  const share = (column: number, packageName: string): number => {
    const total = totals[column] ?? 0;

    return Num.isNonZero(total)
      ? Num.div(columns[column]?.bytesByPackage.get(packageName) ?? 0, total) *
          100
      : 0;
  };

  const packages = Arr.uniq(
    columns.flatMap(({ bytesByPackage }) => Array.from(bytesByPackage.keys())),
  ).toSorted((a, b) => {
    const byEsbuild = share(1, b) - share(1, a);

    return byEsbuild === 0 ? share(0, b) - share(0, a) : byEsbuild;
  });

  return [
    language === 'en'
      ? '| Package | Vite | esbuild |'
      : '| パッケージ | Vite | esbuild |',
    '| :-- | --: | --: |',
    ...packages.map(
      (packageName) =>
        `| \`${packageName}\` | ${Math.round(share(0, packageName)).toString()}% | ${Math.round(share(1, packageName)).toString()}% |`,
    ),
    `| ${language === 'en' ? 'Bundle, minified and gzipped (kB)' : 'バンドル全体、minify ＋ gzip (kB)'} | ${columns.map(({ gzip }) => formatKb(gzip)).join(' | ')} |`,
  ].join('\n');
};

export const renderBundleSizeEnvironment = (
  comparison: BundleSizeComparison,
  language: 'en' | 'ja',
): string => {
  const versionsOf = (fromThisRepository: boolean): string =>
    comparison.versions
      .filter(
        ({ packageName }) =>
          builtFromThisRepository.has(packageName) === fromThisRepository,
      )
      .map(({ packageName, version }) => `\`${packageName} ${version}\``)
      .join(', ');

  const [lastBuiltHere, ...restBuiltHere] = Array.from(
    builtFromThisRepository,
    (name) => `\`${name}\``,
  ).toReversed();

  // Joined by hand rather than with `Intl.ListFormat`, whose output depends on
  // the locale data of the Node that runs `gen`.
  const builtHere =
    language === 'en'
      ? (`${restBuiltHere.toReversed().join(', ')} and ${lastBuiltHere ?? ''}` as const)
      : Arr.toPushed(restBuiltHere.toReversed(), lastBuiltHere).join('、');

  const { vite: viteAt, esbuild: esbuildAt } = comparison.bundlers;

  // The workspace packages are bundled from their `dist/`, which can hold
  // changes no release has published yet, so their version is the last one the
  // manifest names, not necessarily what was measured.
  return language === 'en'
    ? `Bundled by Vite ${viteAt} and esbuild ${esbuildAt}. ${builtHere} are built from this repository's sources, which can be ahead of the versions their manifests name (${versionsOf(true)}). Versions of the others: ${versionsOf(false)}.`
    : `Vite ${viteAt} と esbuild ${esbuildAt} でバンドル。${builtHere} はこのリポジトリのソースからビルドしており、マニフェストのバージョン（${versionsOf(true)}）にまだ含まれない変更を含むことがあります。その他のバージョン: ${versionsOf(false)}。`;
};

/**
 * The share of SynState's single-state bundle that `packageName` takes under
 * `bundler`, in percent, for the checks of the prose beside the tables.
 */
export const breakdownShare = (
  comparison: BundleSizeComparison,
  bundler: 'vite' | 'esbuild',
  packageName: string,
): number => {
  const { breakdown } = checkedResult(comparison, bundler);

  const total = Arr.sum(breakdown.map((entry) => entry.bytes));

  const bytes =
    breakdown.find((entry) => entry.packageName === packageName)?.bytes ?? 0;

  return Num.isNonZero(total) ? Num.div(bytes, total) * 100 : 0;
};

/**
 * The figure of `libraryName` in the scenario named `scenarioName`
 * (`'Everything exported'` for that row), minified and compressed with
 * `compression`, in tenths of a kB as its table prints it, or `undefined` where
 * the scenario does not measure the library.
 */
export const shownSizeOf = (
  comparison: BundleSizeComparison,
  bundler: 'vite' | 'esbuild',
  compression: 'gzip' | 'brotli',
  libraryName: string,
  scenarioName: string,
): number | undefined => {
  const { rows, everything } = checkedResult(comparison, bundler);

  const column = libraries.findIndex(({ name }) => name === libraryName);

  const row = scenarios.findIndex(({ name }) => name.en === scenarioName);

  if (column === -1 || (row === -1 && scenarioName !== everythingRowName)) {
    throw new Error(`no ${libraryName} column or ${scenarioName} row`);
  }

  const sizes = row === -1 ? everything[column] : rows[row]?.cells[column];

  return sizes === undefined || sizes === null
    ? undefined
    : tenthsOfKb(sizes[compression]);
};

/**
 * Fails when the benchmark's implementations no longer match what
 * `src/data/bundle-size-comparison.json` measured: a scenario, library or
 * implementation added or removed since. Reads the two directories and bundles
 * nothing, so `gen` runs it.
 */
export const checkMeasuredSources = async (
  comparison: BundleSizeComparison,
): Promise<void> => {
  const sources = await findSources();

  for (const bundler of ['vite', 'esbuild'] as const) {
    const { rows } = checkedResult(comparison, bundler);

    for (const [i, scenario] of scenarios.entries()) {
      for (const [j, library] of libraries.entries()) {
        const measured = (rows[i]?.cells[j] ?? null) !== null;

        if (measured !== sources.has(sourceKey(scenario, library))) {
          throw new Error(
            `${scenario.name.en} with ${library.name} ${measured ? 'was measured and has no implementation now' : 'has an implementation that was not measured'}; run \`pnpm run bundle-size\` in apps/synstate-docs`,
          );
        }
      }
    }
  }
};

/**
 * The bundler's result, after checking that it was measured with the libraries
 * and scenarios this module lists, in the same order: the JSON is only
 * rewritten when someone measures again.
 */
const checkedResult = (
  comparison: BundleSizeComparison,
  bundler: 'vite' | 'esbuild',
): BundlerResult => {
  const result = comparison[bundler];

  const measured = [
    ...comparison.libraries,
    ...result.rows.map(({ scenario }) => scenario),
  ].join('\n');

  const expected = [
    ...libraries.map(({ name }) => name),
    ...scenarios.map(({ name }) => name.en),
  ].join('\n');

  if (measured !== expected) {
    throw new Error(
      'src/data/bundle-size-comparison.json was measured with other libraries or scenarios than bundle-size-comparison.mts lists; run `pnpm run bundle-size` in apps/synstate-docs',
    );
  }

  return result;
};

/** The first row of each table: every export of the library's entry points. */
export const everythingRowName = 'Everything exported';

/**
 * What `pnpm run bundle-size` measured, as `src/data/bundle-size-comparison.json`
 * records it. The measurement is not part of `gen`: its result depends on the
 * installed bundlers and on every measured library and its dependencies, so a
 * pull request that touched none of this package could otherwise leave the
 * generated pages stale.
 */
export type BundleSizeComparison = Readonly<{
  /** The library names, in the order of each row's cells. */
  libraries: readonly string[];
  bundlers: Readonly<{ vite: string; esbuild: string }>;
  versions: readonly Readonly<{ packageName: string; version: string }>[];
  vite: BundlerResult;
  esbuild: BundlerResult;
}>;

type BundlerResult = Readonly<{
  rows: readonly Readonly<{
    /** The scenario's English name. */
    scenario: string;
    /** One per library, `null` where the scenario does not measure it. */
    cells: readonly (Sizes | null)[];
  }>[];
  /** One per library: every export of its entry points. */
  everything: readonly Sizes[];
  /**
   * SynState's single-state bundle split by package, as the bundler reports it:
   * esbuild the minified bytes of each module, Rolldown each module's length
   * before the chunk is minified.
   */
  breakdown: readonly Readonly<{ packageName: string; bytes: number }>[];
}>;

type BundleOutput = Readonly<{
  code: string;
  /** Bytes of each package in the bundle, as the bundler reports them. */
  bytesByPackage: ReadonlyMap<string, number>;
}>;

type Bundler = Readonly<{
  build: (source: string) => Promise<BundleOutput>;
}>;

type Sizes = Readonly<{ minified: number; gzip: number; brotli: number }>;

type Library = Readonly<{
  name: string;
  /**
   * The middle part of a scenario file's name, `<scenario>.<variant>.mts`, for
   * each implementation of this library.
   */
  variants: readonly string[];
  /** The library's file in the deep-chain adapters, if it is measured there. */
  adapter: string | undefined;
  /**
   * The import specifiers by which implementations reach this library, and what
   * an application would import instead. The Solid implementations import a
   * local shim, because under Node the root export of `solid-js` is its server
   * build; for the browser, `solid-js` is the build the shim names.
   */
  specifiers: ReadonlyRecord<string, string>;
  /** The entry points the "everything exported" row imports whole. */
  entryPoints: readonly string[];
}>;

type Scenario = Readonly<{
  /** The file-name prefix of the scenario's implementations, or `undefined` for the deep chain, which the adapters implement. */
  prefix: string | undefined;
  name: Readonly<{ en: string; ja: string }>;
  /** The scenario's heading on the benchmark page. */
  anchor: Readonly<{ en: string; ja: string }>;
}>;

type ImportedNames = Readonly<{
  specifier: string;
  /** Imported names, `*` for a namespace import. */
  names: readonly string[];
}>;

const synstateLibrary: Library = {
  name: 'SynState',
  variants: ['synstate', 'synstate-switch-map'],
  adapter: 'synstate-adapter.mts',
  specifiers: { synstate: 'synstate' },
  entryPoints: ['synstate'],
} as const;

/** In the order of the benchmark's tables. */
const libraries: readonly Library[] = [
  synstateLibrary,
  {
    name: 'RxJS',
    variants: ['rxjs', 'rxjs-switch-map', 'rxjs-naive'],
    adapter: 'rxjs-adapter.mts',
    specifiers: { rxjs: 'rxjs' },
    entryPoints: ['rxjs'],
  },
  {
    name: 'MobX',
    variants: ['mobx'],
    adapter: 'mobx-adapter.mts',
    specifiers: { mobx: 'mobx' },
    entryPoints: ['mobx'],
  },
  {
    name: 'Jotai',
    variants: ['jotai'],
    adapter: 'jotai-adapter.mts',
    specifiers: {
      // The vanilla entry points hold the same exports without the React
      // bindings, so that a scenario row stays within "Everything exported".
      jotai: 'jotai/vanilla',
      'jotai/vanilla': 'jotai/vanilla',
      'jotai/utils': 'jotai/vanilla/utils',
    },
    entryPoints: ['jotai/vanilla', 'jotai/vanilla/utils'],
  },
  {
    name: 'Redux',
    variants: ['redux'],
    adapter: 'redux-adapter.mts',
    specifiers: { '@reduxjs/toolkit': '@reduxjs/toolkit' },
    entryPoints: ['@reduxjs/toolkit'],
  },
  {
    name: 'Solid',
    variants: ['solid'],
    adapter: 'solid-adapter.mts',
    specifiers: { './solid-js-client.mjs': 'solid-js' },
    entryPoints: ['solid-js'],
  },
  {
    name: 'Preact Signals',
    variants: ['preact-signals'],
    adapter: 'preact-signals-adapter.mts',
    specifiers: { '@preact/signals-core': '@preact/signals-core' },
    entryPoints: ['@preact/signals-core'],
  },
  {
    name: 'Zustand',
    variants: ['zustand'],
    adapter: undefined,
    specifiers: { 'zustand/vanilla': 'zustand/vanilla' },
    entryPoints: ['zustand/vanilla'],
  },
  {
    name: 'Valtio',
    variants: ['valtio'],
    adapter: undefined,
    specifiers: { 'valtio/vanilla': 'valtio/vanilla' },
    entryPoints: ['valtio/vanilla'],
  },
] as const;

const singleStateScenario: Scenario = {
  prefix: '00-single-state',
  name: { en: 'Single state', ja: '単一ステート' },
  anchor: { en: 'scenario-single-state', ja: 'シナリオ-単一ステート' },
} as const;

/** In the order of the benchmark page. */
const scenarios: readonly Scenario[] = [
  singleStateScenario,
  {
    prefix: '01-derived-chain',
    name: { en: 'Derived chain', ja: '派生チェーン' },
    anchor: { en: 'scenario-derived-chain', ja: 'シナリオ-派生チェーン' },
  },
  {
    prefix: '02-diamond-dependency',
    name: { en: 'Diamond', ja: 'ダイヤモンド依存関係' },
    anchor: {
      en: 'scenario-diamond-dependency',
      ja: 'シナリオ-ダイヤモンド依存関係',
    },
  },
  {
    prefix: undefined,
    name: { en: 'Deep chain', ja: 'ディープチェーン' },
    anchor: {
      en: 'scenario-deep-chain-throughput',
      ja: 'シナリオ-ディープチェーンスループット',
    },
  },
  {
    prefix: '04-cascaded-diamond',
    name: { en: 'Cascaded diamond', ja: 'カスケードダイヤモンド' },
    anchor: {
      en: 'scenario-cascaded-diamond',
      ja: 'シナリオ-カスケードダイヤモンド',
    },
  },
  {
    prefix: '05-conditional-fan-out',
    name: { en: 'Conditional fan-out', ja: '条件付きファンアウト' },
    anchor: {
      en: 'scenario-conditional-fan-out',
      ja: 'シナリオ-条件付きファンアウト',
    },
  },
  {
    prefix: '06-equality-cut-off',
    name: { en: 'Equality cut-off', ja: '等値カットオフ' },
    anchor: {
      en: 'scenario-equality-cut-off',
      ja: 'シナリオ-等値カットオフ',
    },
  },
] as const;

/**
 * Implementations the benchmark labels `(naive …)`: written to show what a
 * library costs without its idiomatic operator, not how it is meant to be used.
 * Each scenario row measures the library's natural form instead.
 */
const naiveSources: ReadonlySet<string> = new Set<string>([
  '05-conditional-fan-out.synstate.mts',
  '05-conditional-fan-out.rxjs.mts',
  '06-equality-cut-off.rxjs-naive.mts',
]);

/** Specifiers the implementations import for the benchmark harness. */
const harnessSpecifiers: ReadonlySet<string> = new Set<string>([
  'ts-data-forge',
  'ts-type-forge',
  './shared.mjs',
  '../../spring-demo/index.mjs',
]);

const repositoryRoot = path.resolve(workspaceRootPath, '../..');

const adapterDir = path.resolve(
  workspaceRootPath,
  'src/components/throughput-demo/adapters',
);

const benchmarkPagePath = (language: 'en' | 'ja'): string =>
  language === 'en'
    ? '/mono/synstate/guides/library-comparison/benchmark/'
    : '/mono/synstate/ja/guides/library-comparison/benchmark/';

/**
 * SynState and the dependencies it is bundled with, which the scenarios resolve
 * to this repository's workspace packages.
 */
const builtFromThisRepository: ReadonlySet<string> = new Set<string>([
  'synstate',
  'ts-data-forge',
  'ts-std-forge',
]);

/**
 * The packages whose versions the page names: SynState with the dependencies it
 * is bundled with, then the libraries the benchmark compares it against.
 */
const versionedPackages: readonly string[] = [
  ...builtFromThisRepository,
  ...comparisonLibraries.filter((name) => name !== 'synstate'),
] as const;

/** Files beside the scenarios that implement none of them. */
const nonImplementationFiles: ReadonlySet<string> = new Set<string>([
  'solid-js-client.mts',
  'solid-js-client-build.d.mts',
]);

const sourceKey = (scenario: Scenario, library: Library): string =>
  `${scenario.name.en}\0${library.name}` as const;

/** The scenario names in English, in the order of the tables' rows. */
export const bundleSizeScenarioNames: readonly string[] = scenarios.map(
  ({ name }) => name.en,
);

/**
 * Finds the one implementation of each scenario and library, and fails on a
 * file it cannot place, so that a library or scenario added to the benchmark is
 * not silently left out of the comparison.
 */
const findSources = async (): Promise<ReadonlyMap<string, string>> => {
  const mut_sources = new Map<string, string>();

  const add = (scenario: Scenario, library: Library, file: string): void => {
    const key = sourceKey(scenario, library);

    const existing = mut_sources.get(key);

    if (existing !== undefined) {
      throw new Error(
        `${path.basename(existing)} and ${path.basename(file)} both implement ${scenario.name.en} with ${library.name}; add the naive one to naiveSources in bundle-size-comparison.mts`,
      );
    }

    mut_sources.set(key, file);
  };

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  for (const file of await fs.readdir(scenarioDir)) {
    const match = /^(?<prefix>\d{2}-[a-z-]+)\.(?<variant>[a-z-]+)\.mts$/u.exec(
      file,
    );

    if (nonImplementationFiles.has(file) || naiveSources.has(file)) {
      continue;
    }

    if (match === null) {
      throw new Error(
        `${file} is not named <scenario>.<variant>.mts; add it to nonImplementationFiles in bundle-size-comparison.mts if it implements no scenario`,
      );
    }

    const scenario = scenarios.find(
      ({ prefix }) => prefix === match.groups?.['prefix'],
    );

    const library = libraries.find(({ variants }) =>
      variants.includes(match.groups?.['variant'] ?? ''),
    );

    if (scenario === undefined || library === undefined) {
      throw new Error(
        `${file} is not a known scenario and library; add it to scenarios or libraries in bundle-size-comparison.mts`,
      );
    }

    add(scenario, library, path.resolve(scenarioDir, file));
  }

  const deepChain = scenarios.find(({ prefix }) => prefix === undefined);

  if (deepChain === undefined) {
    throw new Error('the deep-chain scenario is missing');
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  for (const file of await fs.readdir(adapterDir)) {
    if (!file.endsWith('-adapter.mts')) {
      continue;
    }

    const library = libraries.find(({ adapter }) => adapter === file);

    if (library === undefined) {
      throw new Error(
        `${file} is not the adapter of a known library; add it to libraries in bundle-size-comparison.mts`,
      );
    }

    add(deepChain, library, path.resolve(adapterDir, file));
  }

  return mut_sources;
};

/** The names an `import` declaration binds: `default`, `*` or each named one. */
const namesOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a TypeScript AST node, which the compiler API types as mutable.
  declaration: ts.ImportDeclaration,
  file: string,
): readonly string[] => {
  const clause = declaration.importClause;

  if (clause === undefined) {
    throw new Error(`${file}: a side-effect import of a measured library`);
  }

  const { name, namedBindings } = clause;

  const defaultName =
    name === undefined ? ([] as const) : (['default'] as const);

  if (namedBindings === undefined) {
    return defaultName;
  }

  if (ts.isNamespaceImport(namedBindings)) {
    return Arr.toPushed(defaultName, '*');
  }

  return [
    ...defaultName,
    ...namedBindings.elements
      .filter((element) => !element.isTypeOnly)
      .map((element) => (element.propertyName ?? element.name).text),
  ];
};

/**
 * An entry that imports `imports` and keeps each binding on `globalThis`, so
 * that the bundler can drop nothing that was imported. A namespace import keeps
 * every export.
 */
const keepAlive = (imports: readonly ImportedNames[]): string => {
  const bindings = imports.flatMap(({ specifier, names }, i) =>
    names.map((name, j) => ({
      specifier,
      name,
      local: `i${i.toString()}_${j.toString()}`,
    })),
  );

  return Arr.toPushed(
    bindings.map(({ specifier, name, local }) =>
      name === '*'
        ? `import * as ${local} from ${JSON.stringify(specifier)};`
        : `import { ${name} as ${local} } from ${JSON.stringify(specifier)};`,
    ),
    `globalThis.kept = [${bindings.map(({ local }) => local).join(', ')}];`,
  ).join('\n');
};

/**
 * The entry that keeps alive what `file` imports from the measured library,
 * read from its `import` declarations. Type-only imports are skipped, as a
 * compiler erases them.
 */
const entryFromImports = async (file: string): Promise<string> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const text = await fs.readFile(file, 'utf8');

  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest);

  const imports = sourceFile.statements
    .filter(ts.isImportDeclaration)
    .filter(
      (declaration) =>
        declaration.importClause?.phaseModifier !== ts.SyntaxKind.TypeKeyword,
    )
    .flatMap((declaration): readonly ImportedNames[] => {
      const { moduleSpecifier } = declaration;

      if (!ts.isStringLiteral(moduleSpecifier)) {
        throw new TypeError(`${file}: a non-literal import specifier`);
      }

      const specifier = moduleSpecifier.text;

      if (harnessSpecifiers.has(specifier)) {
        return [];
      }

      const replacement = libraries
        .map(({ specifiers }) => specifiers[specifier])
        .find(isString);

      if (replacement === undefined) {
        throw new Error(
          `${file} imports ${specifier}, which is neither a measured library nor the benchmark harness; add it to libraries or harnessSpecifiers in bundle-size-comparison.mts`,
        );
      }

      return [
        {
          specifier: replacement,
          names: namesOf(declaration, file),
        },
      ];
    });

  if (!Arr.isNonEmpty(imports.flatMap(({ names }) => names))) {
    throw new Error(`${file} imports nothing from the library it measures`);
  }

  return keepAlive(imports);
};

/**
 * esbuild with the production build of every library: `NODE_ENV` checks, and
 * Valtio's `import.meta.env.MODE`, which Vite defines and esbuild does not.
 */
const esbuildBundler: Bundler = {
  build: async (source) => {
    const result = await esbuild({
      stdin: { contents: source, resolveDir: scenarioDir, loader: 'js' },
      // The implementations' packages map their own sources through `paths`;
      // the bundle has to resolve each package as an application does.
      tsconfigRaw: '{}',
      bundle: true,
      minify: true,
      write: false,
      metafile: true,
      format: 'esm',
      platform: 'browser',
      legalComments: 'none',
      define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
        // Valtio reads `(import.meta.env ? import.meta.env.MODE : void 0)`;
        // an object defined for `import.meta.env` is not folded into that
        // condition, so the development branch would stay.
        'import.meta.env.MODE': JSON.stringify('production'),
        'import.meta.env': 'true',
      },
      logLevel: 'error',
    });

    const code = result.outputFiles[0]?.text;

    const output = Object.values(result.metafile.outputs)[0];

    if (code === undefined || output === undefined) {
      throw new Error(`esbuild produced no output for:\n${source}`);
    }

    return checked(
      code,
      bytesPerPackage(
        Object.entries(output.inputs).map(([input, { bytesInOutput }]) => [
          input,
          bytesInOutput,
        ]),
      ),
      source,
    );
  },
} as const;

/**
 * Vite as `apps/synstate-dom-benchmark` runs it for its bundle sizes: the
 * production mode, the `production` export condition, and the same `NODE_ENV`.
 */
const viteBundler: Bundler = {
  build: async (source) => {
    const entryId = '\0bundle-size-entry.js';

    const entryPlugin: VitePlugin = {
      name: 'bundle-size-entry',
      resolveId: (id) => (id === entryId ? entryId : undefined),
      load: (id) => (id === entryId ? source : undefined),
    } as const;

    // Read as `unknown`: typescript-eslint does not resolve Rolldown's output
    // types.
    const output: unknown = await vite({
      configFile: false,
      // The virtual entry resolves bare imports from here.
      root: scenarioDir,
      logLevel: 'error',
      mode: 'production',
      define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
      resolve: {
        conditions: ['module', 'browser', 'production'],
      },
      build: {
        write: false,
        minify: true,
        modulePreload: { polyfill: false },
        reportCompressedSize: false,
        rolldownOptions: { input: entryId, plugins: [entryPlugin] },
      },
    });

    const mut_code: string[] = [];

    const mut_modules: (readonly [string, number])[] = [];

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

        mut_code.push(file['code']);

        const modules = file['modules'];

        if (!isRecord(modules)) {
          throw new TypeError('a chunk has no module list');
        }

        for (const [id, info] of Object.entries(modules)) {
          const length = isRecord(info) ? info['renderedLength'] : undefined;

          if (typeof length !== 'number') {
            throw new TypeError(`${id} has no rendered length`);
          }

          mut_modules.push([id, length]);
        }
      }
    }

    return checked(mut_code.join(''), bytesPerPackage(mut_modules), source);
  },
} as const;

/**
 * Fails on a bundle that still reads the environment: a development-only branch
 * the defines did not reach would be measured as shipped code.
 */
const checked = (
  code: string,
  bytesByPackage: ReadonlyMap<string, number>,
  source: string,
): BundleOutput => {
  if (/process\.env|import\.meta/u.test(code)) {
    throw new Error(
      `the bundle still reads process.env or import.meta, so a development-only branch may be in it:\n${source}`,
    );
  }

  return { code, bytesByPackage };
};

/**
 * The package a module path belongs to: a workspace package under `libs/`, or a
 * package under `node_modules/`.
 */
const packageNameOf = (input: string): string => {
  // esbuild names inputs relative to the working directory, Rolldown by
  // absolute path; both are read from the repository root, so that a checkout
  // under a directory named `libs` is not mistaken for a package.
  const fromRoot = path.relative(repositoryRoot, path.resolve(input));

  const inNodeModules =
    /node_modules\/(?<name>@[^/]+\/[^/]+|[^/@][^/]*)\/(?!.*node_modules\/)/u.exec(
      fromRoot,
    );

  if (inNodeModules?.groups?.['name'] !== undefined) {
    return inNodeModules.groups['name'];
  }

  const inLibs = /^libs\/(?<name>[^/]+)\//u.exec(fromRoot);

  if (inLibs?.groups?.['name'] !== undefined) {
    return inLibs.groups['name'];
  }

  throw new Error(`cannot tell which package ${input} is from`);
};

/** The bytes of each module in the output, summed per package. */
const bytesPerPackage = (
  modules: readonly (readonly [string, number])[],
): ReadonlyMap<string, number> => {
  const mut_bytes = new Map<string, number>();

  for (const [id, bytes] of modules) {
    // The entry, which only keeps the imports alive, and esbuild's defines.
    if (bytes === 0 || id.startsWith('<') || id.startsWith('\0')) {
      continue;
    }

    const packageName = packageNameOf(id);

    mut_bytes.set(packageName, (mut_bytes.get(packageName) ?? 0) + bytes);
  }

  return mut_bytes;
};

/**
 * Builds `source`, resolving every library from the scenarios' package, where
 * the scenarios themselves resolve them and where {@link versionOf} reads the
 * versions the page names.
 */
const sizeOfBundle = async (
  bundler: Bundler,
  source: string,
): Promise<
  Readonly<{ sizes: Sizes; bytesByPackage: ReadonlyMap<string, number> }>
> => {
  const { code, bytesByPackage } = await bundler.build(source);

  const bytes = Buffer.byteLength(code, 'utf8');

  const sizes = {
    minified: bytes,
    gzip: zlib.gzipSync(code, { level: zlib.constants.Z_BEST_COMPRESSION })
      .byteLength,
    brotli: zlib.brotliCompressSync(code, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]:
          zlib.constants.BROTLI_MAX_QUALITY,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: bytes,
      },
    }).byteLength,
  } as const;

  return { sizes, bytesByPackage };
};

/**
 * `bytes` in tenths of a kB, rounded half up: what {@link formatKb} prints and
 * what the claims of the page are checked against. (`toFixed` alone would round
 * a binary fraction such as 11.95 down.)
 */
const tenthsOfKb = (bytes: number): number => Math.round(bytes / 100);

/** One kB is 1,000 bytes, as on synstate-dom's bundle-size page. */
const formatKb = (bytes: number): string => (tenthsOfKb(bytes) / 10).toFixed(1);

/**
 * The version of `packageName` as the scenarios resolve it. A workspace package
 * is read from `libs/`, the others from the scenarios' `node_modules`.
 */
const versionOf = async (packageName: string): Promise<string> => {
  const candidates = [
    path.resolve(scenarioDir, '../../../package.json'),
    path.resolve(
      scenarioDir,
      '../../../node_modules',
      packageName,
      'package.json',
    ),
  ] as const;

  for (const candidate of candidates) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const text = await fs.readFile(candidate, 'utf8').catch(() => undefined);

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

/** One bundle at a time: esbuild already uses every core for each. */
const mapInSequence = async <A, B>(
  values: readonly A[],
  fn: (value: A) => Promise<B>,
): Promise<readonly B[]> => {
  const mut_results: B[] = [];

  for (const value of values) {
    mut_results.push(await fn(value));
  }

  return mut_results;
};
