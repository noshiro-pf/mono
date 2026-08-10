import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { pathExists } from 'ts-repo-utils';
import { workspaceRootPath } from './workspace-root-path.mjs';

const benchmarkSamplesDir = path.resolve(
  workspaceRootPath,
  '../synstate/samples/docs-site/benchmark',
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

const embedBenchmark = async (): Promise<void> => {
  for (const targetMarkdownFile of targetMarkdownFiles) {
    const fileExists = await pathExists(targetMarkdownFile);

    if (!fileExists) {
      console.info(`⚠ ${targetMarkdownFile} not found. Skipping.`);

      continue;
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    let mut_markdown = await fs.readFile(targetMarkdownFile, 'utf8');

    for (const target of targets) {
      mut_markdown = await embedOneTarget(
        mut_markdown,
        targetMarkdownFile,
        target,
      );
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(targetMarkdownFile, mut_markdown, 'utf8');
  }
};

const result = await embedBenchmark().catch((error: unknown) => error);

if (result !== undefined) {
  console.error(result);

  process.exit(1);
}
