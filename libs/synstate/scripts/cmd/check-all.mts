import { Result } from 'ts-data-forge';
import { $ } from 'ts-repo-utils';

/**
 * Runs all validation and build steps for the project.
 */
const checkAll = async (): Promise<void> => {
  console.log('Starting full project validation and build...\n');

  await logStep({
    startMessage: 'Installing dependencies',
    action: () => runCmdStep('pnpm i', 'Failed to install dependencies'),
    successMessage: 'Dependencies installed',
  });

  await logStep({
    startMessage: 'Running spell check',
    action: () => runCmdStep('pnpm run cspell', 'Spell check failed'),
    successMessage: 'Spell check passed',
  });

  await logStep({
    startMessage: 'Running Markdown check',
    action: () => runCmdStep('pnpm run md', 'Markdown check failed'),
    successMessage: 'Markdown check passed',
  });

  await logStep({
    startMessage: 'Checking file extensions',
    action: () =>
      runCmdStep('pnpm run ws:check:ext', 'Checking file extensions failed'),
    successMessage: 'File extensions validated',
  });

  await logStep({
    startMessage: 'Checking scripts and configs',
    action: () =>
      runCmdStep('pnpm run check:root', 'Checking scripts and configs failed'),
    successMessage: 'Scripts and configs validated',
  });

  await logStep({
    startMessage: 'Building project',
    action: () => runCmdStep('pnpm run ws:build', 'Build failed'),
    successMessage: 'Build succeeded',
  });

  await logStep({
    startMessage: 'Running tests',
    action: () => runCmdStep('pnpm run ws:test:cov', 'Tests failed'),
    successMessage: 'Tests passed',
  });

  await logStep({
    startMessage: 'Generating documentation',
    action: () =>
      runCmdStep('pnpm run ws:doc', 'Documentation generation failed'),
    successMessage: 'Documentation generated',
  });

  await logStep({
    startMessage: 'Running lint fixes',
    action: () => runCmdStep('pnpm run ws:lint:fix', 'Linting failed'),
    successMessage: 'Lint fixes applied',
  });

  await logStep({
    startMessage: 'Running codemod',
    action: () => runCmdStep('pnpm run codemod:full', 'Codemod failed'),
    successMessage: 'Codemod applied',
  });

  await logStep({
    startMessage: 'Formatting code',
    action: () => runCmdStep('pnpm run fmt:full', 'File formatting failed'),
    successMessage: 'Code formatted',
  });

  console.log('✅ All checks completed successfully!\n');
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
  console.log(`${mut_step.current}. ${startMessage}...`);

  await action();

  console.log(`✓ ${successMessage}.\n`);

  mut_step.current += 1;
};

const runCmdStep = async (cmd: string, errorMsg: string): Promise<void> => {
  const result = await $(cmd);

  if (Result.isErr(result)) {
    console.log(`${errorMsg}: ${result.value.message}`);

    console.log('❌ Check failed');

    process.exit(1);
  }
};

await checkAll();
