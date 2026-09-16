import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { pathExists } from 'ts-repo-utils';
import { benchmarkNumbers } from './benchmark-numbers.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

const benchmarkSamplesDir = path.resolve(
  workspaceRootPath,
  '../../libs/synstate/samples/docs-site/benchmark',
);

const targetMarkdownFiles: readonly string[] = [
  path.resolve(
    workspaceRootPath,
    'src/content/docs/guides/library-comparison/benchmark.mdx',
  ),
  path.resolve(
    workspaceRootPath,
    'src/content/docs/ja/guides/library-comparison/benchmark.mdx',
  ),
] as const;

type EmbedTarget = Readonly<{
  resultsFile: string;
  startMarker: string;
  endMarker: string;
}>;

const targets: readonly EmbedTarget[] = [
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
  const resultsPath = path.resolve(benchmarkSamplesDir, resultsFile);

  const exists = await pathExists(resultsPath);

  if (!exists) {
    console.info(
      `⚠ ${resultsFile} not found. Run \`pnpm --filter synstate run benchmark\` first. Skipping.`,
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

  return markdown.replaceAll(
    inlineMarker,
    (_match, key: string | undefined) => {
      const value = key === undefined ? undefined : numbers[key];

      if (key === undefined || value === undefined) {
        throw new Error(
          `❌ no benchmark number named '${key}' (used in ${path.relative(workspaceRootPath, targetMarkdownFile)})`,
        );
      }

      mut_usedKeys.add(key);

      return `{/* bench:${key} */}${value}{/* /bench */}`;
    },
  );
};

/**
 * `[\s\S]*?` rather than something that excludes `{`: an entry whose value is
 * a whole `$…$` expression carries braces of its own, and KaTeX's thousands
 * separator is written `100{,}000`.
 */
const inlineMarker =
  /\{\/\* bench:(?<key>[^\s*]+) \*\/\}[\s\S]*?\{\/\* \/bench \*\/\}/gu;

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

const embedBenchmark = async (): Promise<void> => {
  const mut_usedKeys = new Set<string>();

  for (const targetMarkdownFile of targetMarkdownFiles) {
    const fileExists = await pathExists(targetMarkdownFile);

    if (!fileExists) {
      console.info(`⚠ ${targetMarkdownFile} not found. Skipping.`);

      continue;
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    let mut_markdown = await fs.readFile(targetMarkdownFile, 'utf8');

    assertNoEscapedEmphasis(mut_markdown, targetMarkdownFile);

    for (const target of targets) {
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
