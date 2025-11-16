import 'ts-repo-utils';

/**
 * Runs all validation and build steps for the project.
 */
const checkAll = async (): Promise<void> => {
  echo('Starting full project validation and build...\n');

  await logStep({
    startMessage: 'Installing dependencies',
    action: () => runCmdStep('pnpm i', 'Failed to install dependencies'),
    successMessage: 'Dependencies installed',
  });

  await logStep({
    startMessage: 'Running spell check',
    action: () =>
      runCmdStep('pnpm run cspell --fail-fast', 'Spell check failed'),
    successMessage: 'Spell check passed',
  });

  await logStep({
    startMessage: 'Checking file extensions',
    action: () =>
      runCmdStep('pnpm run check:ext', 'Checking file extensions failed'),
    successMessage: 'File extensions validated',
  });

  await logStep({
    startMessage: 'Running tests',
    action: () => runCmdStep('pnpm run test', 'Tests failed'),
    successMessage: 'Tests passed',
  });

  await logStep({
    startMessage: 'Running lint fixes',
    action: () => runCmdStep('pnpm run lint:fix', 'Linting failed'),
    successMessage: 'Lint fixes applied',
  });

  await logStep({
    startMessage: 'Building project',
    action: () => runCmdStep('pnpm run build', 'Build failed'),
    successMessage: 'Build succeeded',
  });

  await logStep({
    startMessage: 'Generating documentation',
    action: () => runCmdStep('pnpm run doc', 'Documentation generation failed'),
    successMessage: 'Documentation generated',
  });

  await logStep({
    startMessage: 'Backing up repository settings',
    action: () =>
      runCmdStep(
        'pnpm run gh:backup-all',
        'Backing up repository settings failed',
      ),
    successMessage: 'Repository settings backed up',
  });

  echo('✅ All checks completed successfully!\n');
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

    console.error('❌ Check failed');

    process.exit(1);
  }
};

await checkAll();
