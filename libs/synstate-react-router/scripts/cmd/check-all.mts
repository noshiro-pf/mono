import 'ts-repo-utils';

/**
 * Runs all validation steps for the project.
 */
const checkAll = async (): Promise<void> => {
  echo('Starting full project validation...\n');

  await logStep({
    startMessage: 'Checking file extensions',
    action: () =>
      runCmdStep('pnpm run check:ext', 'Checking file extensions failed'),
    successMessage: 'File extensions validated',
  });

  await logStep({
    startMessage: 'Running type checking',
    action: () => runCmdStep('tsc --noEmit', 'Type checking failed'),
    successMessage: 'Type checking passed',
  });

  await logStep({
    startMessage: 'Running tests',
    action: () => runCmdStep('pnpm run test', 'Tests failed'),
    successMessage: 'Tests passed',
  });

  await logStep({
    startMessage: 'Running lint',
    action: () => runCmdStep('pnpm run lint', 'Linting failed'),
    successMessage: 'Lint passed',
  });

  echo('✅ All checks completed successfully!\n');
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
  echo(`${mut_step.current}. ${startMessage}...`);

  await action();

  echo(`✓ ${successMessage}.\n`);

  mut_step.current += 1;
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
