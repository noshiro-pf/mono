import { Result } from 'ts-data-forge';
import { assertRepoIsDirty } from '../../src/index.mjs';
import '../../src/node-global.mjs';

/**
 * Runs all validation and build steps for the project.
 * @throws Error if any step fails.
 */

echo('Starting full project validation and build...\n');

try {
  // Step 1: Install dependencies
  echo('1. Installing dependencies...');
  const npmInstallResult = await $('npm i');
  if (Result.isErr(npmInstallResult)) {
    throw new Error(
      `Failed to install dependencies: ${npmInstallResult.value.message}`,
    );
  }
  echo('✓ Dependencies installed\n');

  // Step 2: Spell check
  echo('2. Running spell check...');
  const spellCheckResult = await $(
    'cspell "**" --gitignore --gitignore-root ./ --no-progress --fail-fast',
  );
  if (Result.isErr(spellCheckResult)) {
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
  if (Result.isErr(testResult)) {
    throw new Error(`Tests failed: ${testResult.value.message}`);
  }
  echo('✓ Tests passed\n');

  // Step 5: Lint and check repo status
  echo('5. Running lint fixes...');
  const lintResult = await $('npm run lint:fix');
  if (Result.isErr(lintResult)) {
    throw new Error(`Lint fixes failed: ${lintResult.value.message}`);
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
  if (Result.isErr(fmtResult)) {
    throw new Error(`Formatting failed: ${fmtResult.value.message}`);
  }
  await assertRepoIsDirty();

  echo('✅ All checks completed successfully!\n');
} catch (error) {
  echo(`❌ Check failed: ${String(error)}\n`);
  process.exit(1);
}
