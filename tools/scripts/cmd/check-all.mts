import { Result } from 'ts-data-forge';
import { $ } from 'ts-repo-utils';

/**
 * Runs all validation and build steps for the project.
 */
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
    startMessage: 'Checking file extensions',
    action: () =>
      runCmdStep('pnpm run ws:check:ext', 'Checking file extensions failed'),
    successMessage: 'File extensions validated',
  });

  await logStep({
    startMessage: 'Building project',
    action: () => runCmdStep('pnpm run ws:build', 'Build failed'),
    successMessage: 'Build succeeded',
  });

  // A package's `build` only type-checks what it publishes; everything else
  // (tests, scripts, configs, lint config) imports siblings that are built
  // later, so it is checked here, once every `dist/` exists.
  await logStep({
    startMessage: 'Running type checking',
    action: () => runCmdStep('pnpm run ws:type-check', 'Type checking failed'),
    successMessage: 'Type checking passed',
  });

  // The root lints itself with the workspace copies of eslint-config-typed and
  // the eslint-plugin-ts-* packages, which resolve to their `dist/`.
  await logStep({
    startMessage: 'Checking scripts and configs',
    action: () =>
      runCmdStep('pnpm run check:root', 'Checking scripts and configs failed'),
    successMessage: 'Scripts and configs validated',
  });

  // Both need `dist/`: knip executes each package's vitest config, which
  // imports siblings through their `exports` map.
  await logStep({
    startMessage: 'Checking for unused dependencies',
    action: () => runCmdStep('pnpm run knip', 'knip found unused declarations'),
    successMessage: 'No unused declarations',
  });

  await logStep({
    startMessage: 'Checking what the packages publish',
    action: () =>
      runCmdStep(
        'pnpm run lint:published-deps',
        'A published module imports something consumers do not get',
      ),
    successMessage: 'Published imports validated',
  });

  await logStep({
    startMessage: 'Regenerating the package documentation',
    action: () => runCmdStep('pnpm run ws:doc', 'Document generation failed'),
    successMessage: 'Documentation regenerated',
  });

  await logStep({
    startMessage: 'Running tests',
    action: () => runCmdStep('pnpm run ws:test:cov', 'Tests failed'),
    successMessage: 'Tests passed',
  });

  // Packs every package and installs it into `verify-npm-packages/local`, so
  // it needs the build above. Slow, and the last thing CI would tell you.
  await logStep({
    startMessage: 'Installing and running the packed packages',
    action: () =>
      runCmdStep(
        'pnpm run verify:npm-packages',
        'A packed package does not install or run',
      ),
    successMessage: 'Packed packages install and run',
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
    action: () => runCmdStep('pnpm run fmt:diff', 'File formatting failed'),
    successMessage: 'Code formatted',
  });

  // `ws:test:browser` is deliberately not here: it needs Playwright's browsers
  // installed, which `pnpm install` does not do. Run it directly, or let CI.
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

const runCmdStep = async (cmd: string, errorMsg: string): Promise<void> => {
  const result = await $(cmd);

  if (Result.isErr(result)) {
    console.info(`${errorMsg}: ${result.value.message}`);

    console.info('❌ Check failed');

    process.exit(1);
  }
};

await checkAll();
