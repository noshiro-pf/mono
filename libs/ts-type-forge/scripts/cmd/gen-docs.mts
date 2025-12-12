import { unknownToString } from 'ts-data-forge';
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

  await logStep({
    startMessage: 'Embedding sample code into README',
    action: () => runStep(embedSamples(), 'Sample embedding failed'),
    successMessage: 'Sample code embedded into README',
  });

  await logStep({
    startMessage: 'Generating documentation with TypeDoc',
    action: () =>
      runCmdStep(
        `typedoc --options "${TYPEDOC_CONFIG}"`,
        'TypeDoc generation failed',
      ),
    successMessage: 'TypeDoc generation completed',
  });

  await logStep({
    startMessage: 'Linting markdown files',
    action: () => runCmdStep('pnpm run md', 'Markdown linting failed'),
    successMessage: 'Markdown linting completed',
  });

  await logStep({
    startMessage: 'Formatting files',
    action: () => runCmdStep('pnpm run fmt:diff', 'Formatting failed'),
    successMessage: 'Formatting completed',
  });

  echo('✅ Documentation generation completed successfully!\n');
};

const step = { current: 1 };

const logStep = async ({
  startMessage,
  successMessage,
  action,
}: Readonly<{
  startMessage: string;
  action: () => Promise<void>;
  successMessage: string;
}>): Promise<void> => {
  echo(`${step.current}. ${startMessage}...`);

  await action();

  echo(`✓ ${successMessage}.\n`);

  step.current += 1;
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
  promise: Promise<UnknownResult>,
  errorMsg: string,
): Promise<void> => {
  const result = await promise;

  if (Result.isErr(result)) {
    console.error(`${errorMsg}: ${unknownToString(result.value)}`);

    console.error('❌ Documentation generation failed');

    process.exit(1);
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await genDocs();
}
