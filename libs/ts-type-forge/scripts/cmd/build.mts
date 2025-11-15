import { unknownToString } from 'ts-data-forge';
import 'ts-repo-utils';
import { genRootIndex } from '../functions/gen-root-index.mjs';
import { projectRootPath } from '../project-root-path.mjs';

const srcDir = path.resolve(projectRootPath, 'src');

const indexFilePath = path.resolve(srcDir, 'index.d.mts');

/**
 * Builds the entire project.
 */
const build = async (): Promise<void> => {
  echo('Starting build process...\n');

  // Step 1: Generate dist tsconfig
  {
    echo('1. Generating root index.d.mts...');

    await runStep(
      Result.fromPromise(genRootIndex(srcDir, indexFilePath)),
      'Failed to generate tsconfig',
    );

    echo('✓ Generated src/index.d.mts\n');
  }

  // Step 2: Validate file extensions
  {
    echo('2. Checking file extensions...');

    await runCmdStep('pnpm run check:ext', 'Checking file extensions failed');

    echo('✓ File extensions validated\n');
  }

  // Step 3: Type checking
  {
    echo('3. Running type checking...');

    await runCmdStep('tsc --noEmit', 'Type checking failed');

    echo('✓ Type checking passed\n');
  }

  echo('✅ Build completed successfully!\n');
};

const runCmdStep = async (cmd: string, errorMsg: string): Promise<void> => {
  const result = await $(cmd);

  if (Result.isErr(result)) {
    console.error(`${errorMsg}: ${result.value.message}`);

    console.error('❌ Build failed');

    process.exit(1);
  }
};

const runStep = async (
  promise: Promise<Result<unknown, unknown>>,
  errorMsg: string,
): Promise<void> => {
  const result = await promise;

  if (Result.isErr(result)) {
    console.error(`${errorMsg}: ${unknownToString(result.value)}`);

    console.error('❌ Build failed');

    process.exit(1);
  }
};

await build();
