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

const embedBenchmark = async (): Promise<void> => {
  for (const targetMarkdownFile of targetMarkdownFiles) {
    const fileExists = await pathExists(targetMarkdownFile);

    if (!fileExists) {
      console.log(`⚠ ${targetMarkdownFile} not found. Skipping.`);

      continue;
    }

    let mut_markdown = await fs.readFile(targetMarkdownFile, 'utf8');

    for (const { resultsFile, startMarker, endMarker } of targets) {
      const resultsPath = path.resolve(benchmarkSamplesDir, resultsFile);

      const exists = await pathExists(resultsPath);

      if (!exists) {
        console.log(
          `⚠ ${resultsFile} not found. Run \`pnpm --filter synstate run benchmark\` first. Skipping.`,
        );

        continue;
      }

      const results = await fs.readFile(resultsPath, 'utf8');

      const startIndex = mut_markdown.indexOf(startMarker);

      if (startIndex === -1) {
        throw new Error(`❌ ${startMarker} not found in ${targetMarkdownFile}`);
      }

      const endIndex = mut_markdown.indexOf(endMarker, startIndex);

      if (endIndex === -1) {
        throw new Error(`❌ ${endMarker} not found in ${targetMarkdownFile}`);
      }

      const before = mut_markdown.slice(
        0,
        Math.max(0, startIndex + startMarker.length),
      );

      const after = mut_markdown.slice(Math.max(0, endIndex));

      mut_markdown = `${before}\n${results.trim()}\n${after}`;

      console.log(
        `✓ Embedded ${resultsFile} into ${path.relative(workspaceRootPath, targetMarkdownFile)}`,
      );
    }

    await fs.writeFile(targetMarkdownFile, mut_markdown, 'utf8');
  }
};

const result = await embedBenchmark().catch((error: unknown) => error);

if (result !== undefined) {
  console.error(result);

  process.exit(1);
}
