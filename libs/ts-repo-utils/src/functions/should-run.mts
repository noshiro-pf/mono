import { pipe, Result } from 'ts-data-forge';
import '../node-global.mjs';
import { getDiffFrom } from './diff.mjs';

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
