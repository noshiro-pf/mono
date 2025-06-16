import { assertRepoIsDirty } from 'ts-repo-utils';

/**
 * Runs all validation and build steps for the project.
 * @throws Error if any step fails.
 */

echo('Starting full project validation and build...\n');

try {
  // Step 1: Install dependencies
  echo('1. Installing dependencies...');
  const npmInstallResult = await $('npm i');
  if (npmInstallResult.type === 'error') {
    throw new Error(
      `Failed to install dependencies: ${npmInstallResult.exception.message}`,
    );
  }
  echo('✓ Dependencies installed\n');

  // Step 2: Spell check
  echo('2. Running spell check...');
  const spellCheckResult = await $(
    'cspell "**" --gitignore --gitignore-root ./ --no-progress --fail-fast',
  );
  if (spellCheckResult.type === 'error') {
    throw new Error(
      'Spell check failed, try `npm run cspell` for more details.',
    );
  }
  echo('✓ Spell check passed\n');

  // Step 3: Check file extensions
  echo('3. Checking file extensions...');
  await $('npm run check:ext');
  echo('✓ File extensions validated\n');

  // Step 4: Run tests
  echo('4. Running tests...');
  const testResult = await $('npm run test');
  if (testResult.type === 'error') {
    throw new Error(`Tests failed: ${testResult.exception.message}`);
  }
  echo('✓ Tests passed\n');

  // Step 5: Lint and check repo status
  echo('5. Running lint fixes...');
  const lintResult = await $('npm run lint:fix');
  if (lintResult.type === 'error') {
    throw new Error(`Lint fixes failed: ${lintResult.exception.message}`);
  }
  await assertRepoIsDirty();
  echo('✓ Lint fixes applied\n');

  // Step 6: Build and check repo status
  echo('6. Building project...');
  await $('npm run build');
  await assertRepoIsDirty();

  // Step 7: Generate docs and check repo status
  echo('7. Generating documentation...');
  await $('npm run doc');
  await assertRepoIsDirty();

  // Step 8: Format and check repo status
  echo('8. Formatting code...');
  const fmtResult = await $('npm run fmt');
  if (fmtResult.type === 'error') {
    throw new Error(`Formatting failed: ${fmtResult.exception.message}`);
  }
  await assertRepoIsDirty();

  echo('✅ All checks completed successfully!\n');
} catch (error) {
  echo(`❌ Check failed: ${String(error)}\n`);
  process.exit(1);
}
