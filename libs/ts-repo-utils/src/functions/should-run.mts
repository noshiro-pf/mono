import { pipe, Result } from 'ts-data-forge';
import '../node-global.mjs';
import { getDiffFrom } from './diff.mjs';

/**
 * Checks if TypeScript type checks should run based on the diff from
 * origin/main. Skips type checks if all changed files are documentation files,
 * spell check config, or other non-TypeScript files that don't affect type
 * checking.
 *
 * Ignored file patterns:
 *
 * - '.cspell.json'
 * - '**.md'
 * - '**.txt'
 * - 'docs/**'
 *
 * @returns A promise that resolves when the check is complete. Sets
 *   GITHUB_OUTPUT environment variable with should_run=true/false if running in
 *   GitHub Actions.
 */
export const checkShouldRunTypeChecks = async (): Promise<void> => {
  // paths-ignore:
  //   - '.cspell.json'
  //   - '**.md'
  //   - '**.txt'
  //   - 'docs/**'

  const GITHUB_OUTPUT = process.env['GITHUB_OUTPUT'];

  const files = await getDiffFrom('origin/main');

  if (Result.isErr(files)) {
    console.error('Error getting diff:', files.value);
    process.exit(1);
  }

  const shouldRunTsChecks: boolean = !files.value.every(
    (file) =>
      file === '.cspell.json' ||
      file.startsWith('docs/') ||
      pipe(path.basename(file)).map(
        (filename) => filename.endsWith('.md') || filename.endsWith('.txt'),
      ).value,
  );

  if (GITHUB_OUTPUT !== undefined) {
    await fs.appendFile(GITHUB_OUTPUT, `should_run=${shouldRunTsChecks}\n`);
  }
};
