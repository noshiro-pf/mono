import { spawn } from 'node:child_process';

// Runs all validation and build steps for the strict-typescript-lib repository.
// The pipeline: install deps, spell/md lint, type-check the build tooling with
// the root typescript, regenerate every packages/vX.Y/source, type-check each
// generated lib against its pinned typescript@5.x, lint --fix across
// workspaces, and format the entire repo (must not produce a diff).
const checkAll = async (): Promise<void> => {
  console.info('Starting full project validation and build...\n');

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
    startMessage: 'Checking build tooling (root + workspace scripts/configs)',
    action: () =>
      runCmdStep('pnpm run check:root', 'Checking scripts and configs failed'),
    successMessage: 'Build tooling validated',
  });

  await logStep({
    startMessage: 'Generating strict-typescript-lib outputs (gen)',
    action: () =>
      runCmdStep(
        'pnpm run ws:gen:with-codemod-fixed',
        'Generation of lib files failed',
      ),
    successMessage: 'Generation completed',
  });

  await logStep({
    startMessage: 'Type-checking generated lib with each pinned typescript@5.x',
    action: () => runCmdStep('pnpm run ws:type-check', 'Type-check failed'),
    successMessage: 'Type-check passed',
  });

  await logStep({
    startMessage: 'Running lint fixes',
    action: () => runCmdStep('pnpm run lint:fix', 'Linting failed'),
    successMessage: 'Lint fixes applied',
  });

  await logStep({
    startMessage: 'Formatting code',
    action: () => runCmdStep('pnpm run fmt', 'File formatting failed'),
    successMessage: 'Code formatted',
  });

  console.info('✅ All checks completed successfully!\n');
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

// We use `spawn` with `stdio: 'inherit'` so that the (potentially huge)
// gen pipeline output streams directly through, instead of being buffered
// by `child_process.exec` (which caps at 1MB by default).
const runCmdStep = (cmd: string, errorMsg: string): Promise<void> =>
  new Promise((resolve) => {
    const child = spawn(cmd, {
      shell: true,
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();

        return;
      }

      console.info(`${errorMsg}: exit code ${code ?? 'null'}`);

      console.info('❌ Check failed');

      process.exit(1);
    });

    child.on('error', (err) => {
      console.info(`${errorMsg}: ${err.message}`);

      console.info('❌ Check failed');

      process.exit(1);
    });
  });

await checkAll();
