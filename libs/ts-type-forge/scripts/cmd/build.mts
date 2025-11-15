import { unknownToString } from 'ts-data-forge';
import 'ts-repo-utils';
import { genRootIndex } from '../functions/index.mjs';
import { projectRootPath } from '../project-root-path.mjs';

const srcDir = path.resolve(projectRootPath, 'src');

const indexFilePath = path.resolve(srcDir, 'index.d.mts');

/**
 * Builds the entire project.
 */
const build = async (): Promise<void> => {
  echo('Starting build process...\n');

  await logStep({
    startMessage: 'Generating root index.d.mts',
    action: () =>
      runStep(
        Result.fromPromise(genRootIndex(srcDir, indexFilePath)),
        'Failed to generate tsconfig',
      ),
    successMessage: 'Generated src/index.d.mts',
  });

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

  echo('✅ Build completed successfully!\n');
};

const step = { current: 1 };

const logStep = async ({
  startMessage,
  successMessage,
  action,
}: Readonly<{
  startMessage: string;
  action: () => Promise<void>;
  successMessage: string;
}>): Promise<void> => {
  echo(`${step.current}. ${startMessage}...`);

  await action();

  echo(`✓ ${successMessage}.\n`);

  step.current += 1;
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
