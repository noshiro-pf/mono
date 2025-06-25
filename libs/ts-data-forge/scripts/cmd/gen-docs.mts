import { assertPathExists } from 'ts-repo-utils';
import { Result } from '../../src/index.mjs';
import { projectRootPath } from '../project-root-path.mjs';

const TYPEDOC_CONFIG = path.resolve(
  projectRootPath,
  './configs/typedoc.config.mjs',
);

const EMBED_SAMPLES_SCRIPT = path.resolve(
  projectRootPath,
  './scripts/cmd/embed-samples.mjs',
);

/**
 * Generates documentation using TypeDoc and formats the output.
 */
const genDocs = async (): Promise<void> => {
  echo('Starting documentation generation...\n');

  // Verify TypeDoc config exists
  await assertPathExists(TYPEDOC_CONFIG, 'TypeDoc config');

  // Step 0: Embed sample code into README
  echo('0. Embedding sample code into README...');
  await runStep(
    `npm run z:node-esm -- "${EMBED_SAMPLES_SCRIPT}"`,
    'Sample embedding failed',
  );
  echo('✓ Sample code embedded into README\n');

  // Step 1: Generate docs with TypeDoc
  echo('1. Generating documentation with TypeDoc...');
  await runStep(
    `typedoc --options "${TYPEDOC_CONFIG}"`,
    'TypeDoc generation failed',
  );
  echo('✓ TypeDoc generation completed\n');

  // Step 2: Format generated files
  echo('2. Formatting generated files...');
  await runStep('npm run fmt', 'Formatting failed');
  echo('✓ Formatting completed\n');

  // Step 3: Lint markdown files
  echo('3. Linting markdown files...');
  await runStep('npm run md', 'Markdown linting failed');
  echo('✓ Markdown linting completed\n');

  echo('✅ Documentation generation completed successfully!\n');
};

const runStep = async (cmd: string, errorMsg: string): Promise<void> => {
  const result = await $(cmd);
  if (Result.isErr(result)) {
    echo(`${errorMsg}: ${result.value.message}`);
    echo('❌ Documentation generation failed');
    process.exit(1);
  }
};

await genDocs();
