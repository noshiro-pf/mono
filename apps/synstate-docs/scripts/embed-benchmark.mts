import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { pathExists } from 'ts-repo-utils';
import {
  cascadedDiamond,
  conditionalFanOut,
  deepChain,
  derivedChain,
  diamond,
  libraryColorOf,
  singleState,
} from '../src/data/index.mjs';
import { benchmarkNumbers } from './benchmark-numbers.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

const benchmarkResultsDir = path.resolve(workspaceRootPath, 'src/data');

/** The pages carrying the result tables, and the numbers quoted around them. */
const tablePages: readonly string[] = [
  path.resolve(
    workspaceRootPath,
    'src/content/docs/guides/library-comparison/benchmark.mdx',
  ),
  path.resolve(
    workspaceRootPath,
    'src/content/docs/ja/guides/library-comparison/benchmark.mdx',
  ),
] as const;

/**
 * Pages that quote a benchmark figure without showing a table.
 *
 * The introduction and the landing page each open with "up to N× faster than
 * Jotai", which is the first number a reader sees and the last one anyone
 * thinks to update: both said 30× and 16× against a run that gave 20× and
 * 13×. They carry the same markers as the benchmark page, in the spelling
 * their format allows — see `inlineMarkers`.
 */
const quotingPages: readonly string[] = [
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
] as const;

type EmbedTarget = Readonly<{
  resultsFile: string;
  startMarker: string;
  endMarker: string;
}>;

const targets: readonly EmbedTarget[] = [
  {
    resultsFile: 'results-single-state.md',
    startMarker: '{/* benchmark-result-single-state */}',
    endMarker: '{/* /benchmark-result-single-state */}',
  },
  {
    resultsFile: 'results.md',
    startMarker: '{/* benchmark-result */}',
    endMarker: '{/* /benchmark-result */}',
  },
  {
    resultsFile: 'results-diamond.md',
    startMarker: '{/* benchmark-result-diamond */}',
    endMarker: '{/* /benchmark-result-diamond */}',
  },
  {
    resultsFile: 'results-deep-chain.md',
    startMarker: '{/* benchmark-result-deep-chain */}',
    endMarker: '{/* /benchmark-result-deep-chain */}',
  },
  {
    resultsFile: 'results-cascaded-diamond.md',
    startMarker: '{/* benchmark-result-cascaded-diamond */}',
    endMarker: '{/* /benchmark-result-cascaded-diamond */}',
  },
  {
    resultsFile: 'results-conditional-fan-out.md',
    startMarker: '{/* benchmark-result-conditional-fan-out */}',
    endMarker: '{/* /benchmark-result-conditional-fan-out */}',
  },
] as const;

/**
 * Embeds one benchmark result into `markdown` and returns the updated markdown,
 * or the input unchanged when the results file does not exist yet. Extracted
 * from the enclosing loops so that the early exit is a plain `return` rather
 * than a `continue` in a nested loop.
 */
const embedOneTarget = async (
  markdown: string,
  targetMarkdownFile: string,
  { resultsFile, startMarker, endMarker }: EmbedTarget,
): Promise<string> => {
  const resultsPath = path.resolve(benchmarkResultsDir, resultsFile);

  const exists = await pathExists(resultsPath);

  if (!exists) {
    console.info(
      `⚠ ${resultsFile} not found. Run \`pnpm --filter @synstate/docs run benchmark\` first. Skipping.`,
    );

    return markdown;
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const results = await fs.readFile(resultsPath, 'utf8');

  const startIndex = markdown.indexOf(startMarker);

  if (startIndex === -1) {
    throw new Error(`❌ ${startMarker} not found in ${targetMarkdownFile}`);
  }

  const endIndex = markdown.indexOf(endMarker, startIndex);

  if (endIndex === -1) {
    throw new Error(`❌ ${endMarker} not found in ${targetMarkdownFile}`);
  }

  const before = markdown.slice(
    0,
    Math.max(0, startIndex + startMarker.length),
  );

  const after = markdown.slice(Math.max(0, endIndex));

  console.info(
    `✓ Embedded ${resultsFile} into ${path.relative(workspaceRootPath, targetMarkdownFile)}`,
  );

  return `${before}\n${results.trim()}\n${after}`;
};

/**
 * Rewrites every `{/* bench:<key> *\/}…{/* /bench *\/}` span from
 * `benchmarkNumbers`.
 *
 * The tables above are embedded whole; the sentences around them quote single
 * numbers out of the same measurements, and those used to be typed in by hand
 * — which is how a paragraph came to describe a run two re-measurements old.
 * The markers are a pair rather than a placeholder so that the number stays
 * readable in the `.mdx` source and shows up in the diff when it moves.
 */
const embedInlineNumbers = (
  markdown: string,
  targetMarkdownFile: string,
  mut_usedKeys: Set<string>,
): string => {
  const numbers = benchmarkNumbers();

  return inlineMarkers.reduce(
    (mut_content, { pattern, render }) =>
      mut_content.replaceAll(pattern, (_match, key: string | undefined) => {
        const entry = key === undefined ? undefined : numbers[key];

        const value =
          entry === undefined || typeof entry === 'string'
            ? entry
            : entry[pageLanguage(targetMarkdownFile)];

        if (key === undefined || value === undefined) {
          throw new Error(
            `❌ no benchmark number named '${key}' (used in ${path.relative(workspaceRootPath, targetMarkdownFile)})`,
          );
        }

        mut_usedKeys.add(key);

        return render(key, value);
      }),
    markdown,
  );
};

/**
 * The language a page is written in, by where it sits: Starlight keeps every
 * translation under a directory named after its locale.
 */
const pageLanguage = (markdownFile: string): 'en' | 'ja' =>
  path
    .relative(path.resolve(workspaceRootPath, 'src/content/docs'), markdownFile)
    .split(path.sep)[0] === 'ja'
    ? 'ja'
    : 'en';

/**
 * The two spellings a marker takes, one per document format.
 *
 * MDX has no HTML comments and Markdown does not evaluate `{…}`, so a marker
 * written the other way round would render on the page — the same split
 * `embed-bundle-size.mts` already lives with. A page is only ever one of the
 * two, so running both passes over it is a no-op for the form it does not use.
 *
 * `[\s\S]*?` rather than something that excludes `{`: an entry whose value is
 * a whole `$…$` expression carries braces of its own, and KaTeX's thousands
 * separator is written `100{,}000`.
 */
const inlineMarkers: readonly Readonly<{
  pattern: RegExp;
  render: (key: string, value: string) => string;
}>[] = [
  {
    pattern:
      /\{\/\* bench:(?<key>[^\s*]+) \*\/\}[\s\S]*?\{\/\* \/bench \*\/\}/gu,
    render: (key, value) => `{/* bench:${key} */}${value}{/* /bench */}`,
  },
  {
    pattern: /<!-- bench:(?<key>\S+) -->[\s\S]*?<!-- \/bench -->/gu,
    render: (key, value) => `<!-- bench:${key} -->${value}<!-- /bench -->`,
  },
] as const;

/**
 * Fails on an emphasis Prettier could not round-trip.
 *
 * Measured on this file: in some paragraphs — not all, and what makes the
 * difference is not apparent — Prettier rewrites `**{marker}32{/marker}×
 * slower**` as `**…× slower\*\*`, so the page renders a literal `**`. MDX
 * itself parses the original correctly, so nothing else notices.
 *
 * The escape is stable once written, which is what makes it worth a check
 * rather than a note: Prettier reproduces it, and the page goes on rendering
 * `**` with every other check green. Running before anything is embedded means
 * the content judged is the one in the commit, escaped by whoever last
 * formatted it. The fix is to leave the number outside the emphasis.
 */
const assertNoEscapedEmphasis = (
  markdown: string,
  targetMarkdownFile: string,
): void => {
  if (markdown.includes(String.raw`\*`)) {
    throw new Error(
      `❌ ${path.relative(workspaceRootPath, targetMarkdownFile)} contains an escaped '*'. Prettier writes one when it cannot re-emit an emphasis that holds a benchmark marker; move the marker out of the '**…**'.`,
    );
  }
};

/**
 * Fails on a library the benchmark charts have no colour for.
 *
 * The charts draw a label `libraryColorOf` has no colour for in the axis grey,
 * which nothing notices: a runner that gained a library used to need it added
 * to a colour map per chart by hand. Checked here rather than in the chart,
 * because a throw there only fires in the reader's browser.
 */
const assertEveryLibraryHasAColour = (): void => {
  const labels = [
    ...[cascadedDiamond, conditionalFanOut, deepChain].flatMap(({ series }) =>
      series.map(({ label }) => label),
    ),
    ...[singleState, derivedChain, diamond].flatMap(({ rows }) =>
      rows.map(({ label }) => label),
    ),
  ] as const;

  const missing = Arr.uniq(
    labels.filter((label) => libraryColorOf(label) === undefined),
  );

  if (Arr.isNonEmpty(missing)) {
    throw new Error(
      `❌ no chart colour for ${missing.join(', ')}; add it to src/data/library-colors.mts, then run \`pnpm run gen:benchmark-doc fix:fmt\` to embed the results`,
    );
  }
};

const embedBenchmark = async (): Promise<void> => {
  assertEveryLibraryHasAColour();

  const mut_usedKeys = new Set<string>();

  for (const targetMarkdownFile of tablePages.concat(quotingPages)) {
    const fileExists = await pathExists(targetMarkdownFile);

    if (!fileExists) {
      console.info(`⚠ ${targetMarkdownFile} not found. Skipping.`);

      continue;
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    let mut_markdown = await fs.readFile(targetMarkdownFile, 'utf8');

    assertNoEscapedEmphasis(mut_markdown, targetMarkdownFile);

    for (const target of tablePages.includes(targetMarkdownFile)
      ? targets
      : []) {
      mut_markdown = await embedOneTarget(
        mut_markdown,
        targetMarkdownFile,
        target,
      );
    }

    mut_markdown = embedInlineNumbers(
      mut_markdown,
      targetMarkdownFile,
      mut_usedKeys,
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(targetMarkdownFile, mut_markdown, 'utf8');
  }

  // A key nothing uses is a number the prose stopped quoting, and the entry
  // that computes it is the only thing still asserting the measurement is
  // there. Report it rather than leaving it to rot beside the ones in use.
  const unused = Object.keys(benchmarkNumbers()).filter(
    (key) => !mut_usedKeys.has(key),
  );

  if (Arr.isNonEmpty(unused)) {
    throw new Error(
      `❌ benchmark numbers named by no marker: ${unused.join(', ')}`,
    );
  }

  console.info(`✓ Embedded ${mut_usedKeys.size.toString()} inline numbers`);
};

const result = await embedBenchmark().catch((error: unknown) => error);

if (result !== undefined) {
  console.error(result);

  process.exit(1);
}
