import 'ts-repo-utils';

/**
 * Runs all validation and build steps for the project.
 */
const checkAll = async (): Promise<void> => {
  echo('Starting full project validation and build...\n');

  // Step 1: Install dependencies
  echo('1. Installing dependencies...');
  await runCmdStep('pnpm i', 'Failed to install dependencies');
  echo('✓ Dependencies installed\n');

  // Step 2: Spell check
  echo('2. Running spell check...');
  await runCmdStep('pnpm run cspell --fail-fast', 'Spell check failed');
  echo('✓ Spell check passed\n');

  // Step 3: Check file extensions
  echo('3. Checking file extensions...');
  await runCmdStep('pnpm run check:ext', 'Checking file extensions failed');
  echo('✓ File extensions validated\n');

  // Step 4: Run tests
  echo('4. Running tests...');
  await runCmdStep('pnpm run test', 'Tests failed');
  echo('✓ Tests passed\n');

  // Step 5: Lint
  echo('5. Running lint fixes...');
  await runCmdStep('pnpm run lint:fix', 'Linting failed');
  echo('✓ Lint fixes applied\n');

  // Step 6: Build
  echo('6. Building project...');
  await runCmdStep('pnpm run build', 'Build failed');

  // Step 7: Generate docs
  echo('7. Generating documentation...');
  await runCmdStep('pnpm run doc', 'Documentation generation failed');

  // Step 8: Backup repository settings
  echo('8. Backing up repository settings...');
  await runCmdStep(
    'pnpm run gh:backup-all',
    'Backing up repository settings failed',
  );

  echo('✅ All checks completed successfully!\n');
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
