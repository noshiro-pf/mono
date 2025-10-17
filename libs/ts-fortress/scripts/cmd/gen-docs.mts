import { assertPathExists } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';
import { embedSamples } from './embed-samples.mjs';

const TYPEDOC_CONFIG = path.resolve(
  projectRootPath,
  './configs/typedoc.config.mjs',
);

/**
 * Generates documentation using TypeDoc and formats the output.
 */
export const genDocs = async (): Promise<void> => {
  echo('Starting documentation generation...\n');

  // Verify TypeDoc config exists
  await assertPathExists(TYPEDOC_CONFIG, 'TypeDoc config');

  // Step 0: Embed sample code into README
  echo('0. Embedding sample code into README...');
  await runStep(embedSamples(), 'Sample embedding failed');
  echo('✓ Sample code embedded into README\n');

  // Step 1: Generate docs with TypeDoc
  echo('1. Generating documentation with TypeDoc...');
  await runCmdStep(
    `typedoc --options "${TYPEDOC_CONFIG}"`,
    'TypeDoc generation failed',
  );
  echo('✓ TypeDoc generation completed\n');

  // Step 2: Lint markdown files
  echo('2. Linting markdown files...');
  await runCmdStep('pnpm run md', 'Markdown linting failed');
  echo('✓ Markdown linting completed\n');

  echo('✅ Documentation generation completed successfully!\n');
};

const runCmdStep = async (cmd: string, errorMsg: string): Promise<void> => {
  const result = await $(cmd);
  if (Result.isErr(result)) {
    console.error(`${errorMsg}: ${result.value.message}`);
    console.error('❌ Documentation generation failed');
    process.exit(1);
  }
};

const runStep = async (
  promise: Promise<Result<unknown, unknown>>,
  errorMsg: string,
): Promise<void> => {
  const result = await promise;
  if (Result.isErr(result)) {
    console.error(`${errorMsg}: ${String(result.value)}`);
    console.error('❌ Documentation generation failed');
    process.exit(1);
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await genDocs();
}
