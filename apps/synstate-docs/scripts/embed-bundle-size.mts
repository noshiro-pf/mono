import { build } from 'esbuild';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { gzipSync } from 'node:zlib';
import { Arr } from 'ts-data-forge';
import bundleSizeComparison from '../src/data/bundle-size-comparison.json' with { type: 'json' };
import {
  type BundleSizeComparison,
  breakdownShare,
  bundleSizeScenarioNames,
  checkMeasuredSources,
  everythingRowName,
  renderBundleSizeBreakdown,
  renderBundleSizeEnvironment,
  renderBundleSizeTable,
  shownSizeOf,
} from './bundle-size-comparison.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

// This package lives in apps/ while the packages it measures live in libs/, so
// they are no longer siblings.
const synstateDistPath = path.resolve(
  workspaceRootPath,
  '../../libs/synstate/dist/index.mjs',
);

const reactHooksDistPath = path.resolve(
  workspaceRootPath,
  '../../libs/synstate-react-hooks/dist/index.mjs',
);

const targetMarkdownFiles: readonly string[] = [
  path.resolve(
    workspaceRootPath,
    'src/content/docs/getting-started/introduction.md',
  ),
  path.resolve(
    workspaceRootPath,
    'src/content/docs/ja/getting-started/introduction.md',
  ),
  path.resolve(workspaceRootPath, 'src/content/docs/index.mdx'),
  path.resolve(workspaceRootPath, 'src/content/docs/ja/index.mdx'),
  path.resolve(workspaceRootPath, '../../libs/synstate/README.md'),
] as const;

/** The pages that compare SynState's bundle size with the benchmark's libraries. */
const comparisonPages = [
  {
    language: 'en',
    path: path.resolve(
      workspaceRootPath,
      'src/content/docs/guides/library-comparison/bundle-size.md',
    ),
  },
  {
    language: 'ja',
    path: path.resolve(
      workspaceRootPath,
      'src/content/docs/ja/guides/library-comparison/bundle-size.md',
    ),
  },
] as const;

const measureBundleSize = async (
  entryPoint: string,
  externals: readonly string[],
): Promise<Readonly<{ minifiedBytes: number; gzippedBytes: number }>> => {
  const res = await build({
    entryPoints: [entryPoint],
    bundle: true,
    minify: true,
    write: false,
    format: 'esm',
    external: Array.from(externals),
  });

  const minified = res.outputFiles[0]?.contents;

  if (minified === undefined) {
    throw new Error(`esbuild produced no output for ${entryPoint}`);
  }

  const gzipped = gzipSync(minified);

  return {
    minifiedBytes: minified.byteLength,
    gzippedBytes: gzipped.byteLength,
  };
};

const formatKB = (bytes: number): string =>
  (bytes / 1024).toFixed(1).replace(/\.0$/u, '');

const replacePlaceholder = (
  content: string,
  name: string,
  replacement: string,
): string => {
  // HTML comment style for .md files: <!-- bundle-size:name -->...<!-- /bundle-size:name -->
  // eslint-disable-next-line security/detect-non-literal-regexp
  const htmlPattern = new RegExp(
    `<!-- bundle-size:${name} -->.*?<!-- /bundle-size:${name} -->`,
    'gsu',
  );

  // JSX comment style for .mdx files: {/* bundle-size:name */}...{/* /bundle-size:name */}
  // eslint-disable-next-line security/detect-non-literal-regexp
  const jsxPattern = new RegExp(
    String.raw`\{/\* bundle-size:${name} \*/\}.*?\{/\* /bundle-size:${name} \*/\}`,
    'gsu',
  );

  // Replacer functions are used so that `$&`, `$1`, ... inside `replacement`
  // are treated as literal text rather than substitution patterns.
  return content
    .replaceAll(
      htmlPattern,
      () =>
        `<!-- bundle-size:${name} -->${replacement}<!-- /bundle-size:${name} -->`,
    )
    .replaceAll(
      jsxPattern,
      () =>
        `{/* bundle-size:${name} */}${replacement}{/* /bundle-size:${name} */}`,
    );
};

/** A table has to stand in paragraphs of its own, apart from the markers. */
const block = (text: string): string => `\n\n${text}\n\n` as const;

const embedBundleSize = async (): Promise<void> => {
  const comparisonContents = await renderComparisonPages();

  // Measure synstate
  console.info('Measuring bundle size for synstate...');

  // Every runtime dependency is external: the number is meant to be the size of
  // this package, not of its dependency tree inlined. `ts-std-forge` joined the
  // list when synstate took the panic path from it (Sumi D-48) — leaving it out
  // measured all of ts-std-forge as if it were synstate's own code and reported
  // 8.7 kB against an actual 4.7 kB.
  const synstate = await measureBundleSize(synstateDistPath, [
    'ts-data-forge',
    'ts-std-forge',
  ]);

  console.info(
    `  synstate: ${formatKB(synstate.minifiedBytes)} kB minified, ${formatKB(synstate.gzippedBytes)} kB gzipped`,
  );

  // Measure synstate-react-hooks
  console.info('Measuring bundle size for synstate-react-hooks...');

  const reactHooks = await measureBundleSize(reactHooksDistPath, [
    'ts-data-forge',
    'synstate',
    'react',
  ]);

  console.info(
    `  synstate-react-hooks: ${formatKB(reactHooks.minifiedBytes)} kB minified, ${formatKB(reactHooks.gzippedBytes)} kB gzipped`,
  );

  // Replace placeholders in markdown files
  for (const mdPath of targetMarkdownFiles) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    let mut_content = await fs.readFile(mdPath, 'utf8');

    mut_content = replacePlaceholder(
      mut_content,
      'synstate',
      `~${formatKB(synstate.gzippedBytes)} kB min+gzip`,
    );

    mut_content = replacePlaceholder(
      mut_content,
      'synstate-react-hooks',
      `~${formatKB(reactHooks.gzippedBytes)} kB min+gzip`,
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(mdPath, mut_content, 'utf8');

    console.info(`✓ Updated bundle size in ${path.basename(mdPath)}`);
  }

  for (const { path: pagePath, content } of comparisonContents) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(pagePath, content, 'utf8');

    console.info(`✓ Updated the comparison in ${path.basename(pagePath)}`);
  }
};

/**
 * The sentences of "Where SynState's Bytes Come From" and "Reading the Results"
 * that state something about the figures, quoted word for word in each
 * language, each with whether the committed figures still bear it out.
 */
const claimsOfTheResults = (
  comparison: BundleSizeComparison,
): readonly Claim[] => {
  const bundlers = ['vite', 'esbuild'] as const;

  /** The tables of the page: Vite gzip and Brotli, and esbuild gzip. */
  const tables = [
    { bundler: 'vite', compression: 'gzip' },
    { bundler: 'vite', compression: 'brotli' },
    { bundler: 'esbuild', compression: 'gzip' },
  ] as const;

  type Table = (typeof tables)[number];

  const [viteGzip, , esbuildGzip] = tables;

  /**
   * The figure as `table` prints it, in tenths of a kB, so that a claim is
   * judged by what the reader sees; `undefined` where the scenario does not
   * measure the library.
   */
  const shown = (
    table: Table,
    library: string,
    scenario: string,
  ): number | undefined =>
    shownSizeOf(
      comparison,
      table.bundler,
      table.compression,
      library,
      scenario,
    );

  /** The figures, failing the claim on a missing one. */
  const figures = (
    table: Table,
    library: string,
    scenarios: readonly string[],
  ): readonly number[] | undefined => {
    const values = scenarios.map((scenario) => shown(table, library, scenario));

    return values.every((value) => value !== undefined) ? values : undefined;
  };

  /** Whether `holds` is true in every table with every figure present. */
  const forEveryTable = (
    library: string,
    scenarios: readonly string[],
    holds: (values: readonly number[], table: Table) => boolean,
  ): boolean =>
    tables.every((table) => {
      const values = figures(table, library, scenarios);

      return (
        values !== undefined && Arr.isNonEmpty(values) && holds(values, table)
      );
    });

  /**
   * Whether SynState is smaller than `library` in each of `scenarios` in every
   * table.
   */
  const synstateSmallerThan = (
    library: string,
    scenarios: readonly string[],
  ): boolean =>
    forEveryTable('SynState', scenarios, (ours, table) => {
      const theirs = figures(table, library, scenarios);

      return (
        theirs !== undefined &&
        ours.every((value, i) => value < (theirs[i] ?? 0))
      );
    });

  const scenariosBeyondTheDerivedChain: readonly string[] = [
    'Diamond',
    'Deep chain',
    'Cascaded diamond',
    'Conditional fan-out',
    'Equality cut-off',
  ] as const;

  const reduxWithoutImmer: readonly string[] = [
    'Deep chain',
    'Conditional fan-out',
  ] as const;

  const reduxWithImmer = bundleSizeScenarioNames.filter(
    (scenario) => !reduxWithoutImmer.includes(scenario),
  );

  const synstatePackages = [
    'synstate',
    'ts-data-forge',
    'ts-std-forge',
  ] as const;

  return [
    {
      en: 'The largest share is `synstate` itself.',
      ja: '最も大きな割合を占めるのは `synstate` 自身です。',
      holds: bundlers.every((bundler) =>
        synstatePackages.every(
          (packageName) =>
            packageName === 'synstate' ||
            breakdownShare(comparison, bundler, 'synstate') >
              breakdownShare(comparison, bundler, packageName),
        ),
      ),
    },
    {
      en: 'so no other package is in the bundle',
      ja: 'バンドルにほかのパッケージは入りません',
      holds: bundlers.every(
        (bundler) =>
          Arr.sum(
            synstatePackages.map((packageName) =>
              breakdownShare(comparison, bundler, packageName),
            ),
          ) > 99.99,
      ),
    },
    {
      en: '**SynState** is under 5 kB in every scenario row with either bundler.',
      ja: '**SynState** は、どちらのバンドラーでもシナリオの行がすべて 5 kB 未満です。',
      holds: forEveryTable('SynState', bundleSizeScenarioNames, (values) =>
        values.every((value) => value < 50),
      ),
    },
    {
      en: 'In every row it is smaller than MobX',
      ja: 'どの行でも MobX より小さく',
      holds: synstateSmallerThan(
        'MobX',
        Arr.toUnshifted(everythingRowName)(bundleSizeScenarioNames),
      ),
    },
    {
      en: 'it is smaller than RxJS as well',
      ja: 'では RxJS よりも小さくなります',
      holds: synstateSmallerThan('RxJS', scenariosBeyondTheDerivedChain),
    },
    {
      en: 'In every scenario row its esbuild figure is within 1 kB of its Vite figure.',
      ja: 'どのシナリオの行でも、esbuild の値と Vite の値の差は 1 kB 以内です。',
      holds: bundleSizeScenarioNames.every((scenario) => {
        const vite = shown(viteGzip, 'SynState', scenario);

        const esbuild = shown(esbuildGzip, 'SynState', scenario);

        return (
          vite !== undefined &&
          esbuild !== undefined &&
          Math.abs(esbuild - vite) <= 10
        );
      }),
    },
    {
      en: '`BehaviorSubject` alone in the single state, `combineLatest` and `map` as well in the diamond',
      ja: '単一ステートでは `BehaviorSubject` だけ、ダイヤモンドでは `combineLatest` と `map` も加わります',
      holds: forEveryTable(
        'RxJS',
        ['Single state', 'Diamond'],
        ([single, diamond]) => (single ?? 0) < (diamond ?? 0),
      ),
    },
    {
      en: 'so its scenario rows hardly move',
      ja: 'シナリオの行はほとんど変わりません',
      holds: forEveryTable(
        'MobX',
        bundleSizeScenarioNames,
        (values) => Math.max(...values) - Math.min(...values) <= 2,
      ),
    },
    {
      en: 'The deep chain and the conditional fan-out write a plain reducer matched against `createAction`, and their bundles have no Immer.',
      ja: 'ディープチェーンと条件付きファンアウトは `createAction` に照合する素の reducer で書いているので、Immer を含みません。',
      holds: forEveryTable('Redux', reduxWithImmer, (withImmer, table) => {
        const withoutImmer = figures(table, 'Redux', reduxWithoutImmer);

        return (
          withoutImmer !== undefined &&
          Math.max(...withoutImmer) < Math.min(...withImmer)
        );
      }),
    },
    {
      en: "every row of theirs is smaller than SynState's",
      ja: 'どの行も SynState の同じ行より小さくなります',
      holds: ['Jotai', 'Preact Signals', 'Zustand', 'Valtio'].every((library) =>
        tables.every((table) =>
          Arr.toUnshifted(everythingRowName)(bundleSizeScenarioNames).every(
            (scenario) => {
              const theirs = shown(table, library, scenario);

              const ours = shown(table, 'SynState', scenario);

              return (
                theirs === undefined || (ours !== undefined && theirs < ours)
              );
            },
          ),
        ),
      ),
    },
  ] as const;
};

/**
 * Fails on a claim the page no longer makes word for word, which has to be
 * re-quoted here, or one the figures no longer bear out, which has to be
 * reworded on both pages.
 */
const checkClaims = (
  claims: readonly Claim[],
  content: string,
  language: 'en' | 'ja',
): void => {
  for (const claim of claims) {
    if (!content.includes(claim[language])) {
      throw new Error(
        `the ${language} bundle-size.md no longer says "${claim[language]}"; quote its new wording in claimsOfTheResults in scripts/embed-bundle-size.mts`,
      );
    }

    if (!claim.holds) {
      throw new Error(
        `bundle-size.md says "${claim.en}", which src/data/bundle-size-comparison.json no longer shows; reword it on both the en and ja pages, and in claimsOfTheResults`,
      );
    }
  }
};

type Claim = Readonly<{ en: string; ja: string; holds: boolean }>;

/**
 * The comparison pages with their tables rendered from the committed
 * measurement, the implementations, every marker and every claim of the prose
 * checked first, so that nothing is written when one fails.
 */
const renderComparisonPages = async (): Promise<
  readonly Readonly<{ path: string; content: string }>[]
> => {
  const comparison: BundleSizeComparison = bundleSizeComparison;

  await checkMeasuredSources(comparison);

  const claims = claimsOfTheResults(comparison);

  return Promise.all(
    comparisonPages.map(async (page) => {
      const replacements = [
        [
          'comparison-environment',
          renderBundleSizeEnvironment(comparison, page.language),
        ],
        [
          'comparison-gzip',
          renderBundleSizeTable(comparison, 'vite', 'gzip', page.language),
        ],
        [
          'comparison-brotli',
          renderBundleSizeTable(comparison, 'vite', 'brotli', page.language),
        ],
        [
          'comparison-esbuild-gzip',
          renderBundleSizeTable(comparison, 'esbuild', 'gzip', page.language),
        ],
        [
          'comparison-breakdown',
          renderBundleSizeBreakdown(comparison, page.language),
        ],
      ] as const;

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const content = await fs.readFile(page.path, 'utf8');

      for (const [name] of replacements) {
        for (const marker of [
          `<!-- bundle-size:${name} -->`,
          `<!-- /bundle-size:${name} -->`,
        ]) {
          if (!content.includes(marker)) {
            throw new Error(`${page.path} has no ${marker}`);
          }
        }
      }

      checkClaims(claims, content, page.language);

      return {
        path: page.path,
        content: replacements.reduce(
          (acc, [name, replacement]) =>
            replacePlaceholder(acc, name, block(replacement)),
          content,
        ),
      };
    }),
  );
};

const result = await embedBundleSize().catch((error: unknown) => error);

if (result !== undefined) {
  console.error(result);

  process.exit(1);
}
