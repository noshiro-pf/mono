import { Result } from 'ts-data-forge';
import { assertRepoIsClean } from 'ts-repo-utils';

/**
 * Runs all validation and build steps for the project.
 */
const checkAll = async (): Promise<void> => {
  echo('Starting full project validation and build...\n');

  // Step 1: Install dependencies
  echo('1. Installing dependencies...');
  await runCmdStep('npm i', 'Failed to install dependencies');
  echo('✓ Dependencies installed\n');

  // Step 2: Spell check
  echo('2. Running spell check...');
  await runCmdStep(
    'cspell "**" --gitignore --gitignore-root ./ --no-progress --fail-fast',
    'Spell check failed',
  );
  echo('✓ Spell check passed\n');

  // Step 3: Check file extensions
  echo('3. Checking file extensions...');
  await runCmdStep('npm run check:ext', 'Checking file extensions failed');
  echo('✓ File extensions validated\n');

  // Step 4: Run tests
  echo('4. Running tests...');
  await runCmdStep('npm run test', 'Tests failed');
  echo('✓ Tests passed\n');

  // Step 5: Lint and check repo status
  echo('5. Running lint fixes...');
  await runCmdStep('npm run lint', 'Linting failed');
  await assertRepoIsClean();
  echo('✓ Lint fixes applied\n');

  // Step 6: Build and check repo status
  echo('6. Building project...');
  await runCmdStep('npm run build', 'Build failed');
  await assertRepoIsClean();

  // Step 7: Generate docs and check repo status
  echo('7. Generating documentation...');
  await runCmdStep('npm run doc', 'Documentation generation failed');
  await assertRepoIsClean();

  // Step 8: Format and check repo status
  echo('8. Formatting code...');
  await runCmdStep('npm run fmt', 'Formatting failed');
  await assertRepoIsClean();

  echo('✅ All checks completed successfully!\n');
};

const runCmdStep = async (cmd: string, errorMsg: string): Promise<void> => {
  const result = await $(cmd);
  if (Result.isErr(result)) {
    echo(`${errorMsg}: ${result.value.message}`);
    echo('❌ Check failed');
    process.exit(1);
  }
};

await checkAll();
