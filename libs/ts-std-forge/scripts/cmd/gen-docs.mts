import { $, isDirectlyExecuted, Result } from 'ts-repo-utils';
import { unknownToString } from '../../src/entry-point.mjs';
import { embedExamplesInJsDoc } from './embed-examples-in-jsdoc.mjs';

/**
 * Generates documentation using TypeDoc and formats the output.
 */
export const genDocs = async (): Promise<void> => {
  console.info('Starting documentation generation...\n');

  // What puts `doc:embed:jsdoc` in front of CI. `ws:doc` is the style-check
  // matrix entry that runs each package's `doc` and then asserts the tree is
  // clean; every other package with an `@example` mapping reaches its
  // embedder from here, and this one did not, so its examples — and the
  // coverage check that comes with them — were checked by nothing.
  await logStep({
    startMessage: 'Embedding examples into JSDoc',
    action: () =>
      runStep(embedExamplesInJsDoc(), 'Example embedding into JSDoc failed'),
    successMessage: 'Example embedding into JSDoc completed',
  });

  await logStep({
    startMessage: 'Formatting files',
    action: () => runCmdStep('pnpm run fmt', 'File formatting failed'),
    successMessage: 'Formatting completed',
  });

  console.info('✅ Documentation generation completed successfully!\n');
};

const mut_step = { current: 1 };

const logStep = async ({
  startMessage,
  successMessage,
  action,
}: Readonly<{
  startMessage: string;
  action: () => Promise<void>;
  successMessage: string;
}>): Promise<void> => {
  console.info(`${mut_step.current}. ${startMessage}...`);

  await action();

  console.info(`✓ ${successMessage}.\n`);

  mut_step.current += 1;
};

const runStep = async (
  action: Promise<Result<undefined, unknown>>,
  errorMsg: string,
): Promise<void> => {
  const result = await action;

  if (Result.isErr(result)) {
    console.error(`${errorMsg}: ${unknownToString(result.value)}`);

    console.error('❌ Documentation generation failed');

    process.exit(1);
  }
};

const runCmdStep = async (cmd: string, errorMsg: string): Promise<void> => {
  const result = await $(cmd);

  if (Result.isErr(result)) {
    console.error(`${errorMsg}: ${result.value.message}`);

    console.error('❌ Documentation generation failed');

    process.exit(1);
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await genDocs();
}
