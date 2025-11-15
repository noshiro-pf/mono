import { unknownToString } from 'ts-data-forge';
import { projectRootPath } from '../project-root-path.mjs';

const distDir = path.resolve(projectRootPath, './dist');

const tsconfigPath = path.resolve(
  projectRootPath,
  './configs/tsconfig.build.json',
);

/**
 * Builds the entire project.
 */
const build = async (skipChecks: boolean): Promise<void> => {
  echo('Starting build process...\n');

  if (!skipChecks) {
    await logStep({
      startMessage: 'Checking file extensions',
      action: () =>
        runCmdStep('pnpm run check:ext', 'Checking file extensions failed'),
      successMessage: 'File extensions validated',
    });

    await logStep({
      startMessage: 'Running type checks',
      action: () => runCmdStep('pnpm run type-check', 'Type checking failed'),
      successMessage: 'Type checking passed',
    });
  }

  await logStep({
    startMessage: 'Cleaning dist directory',
    action: () =>
      runStep(
        Result.fromPromise(
          fs.rm(distDir, {
            recursive: true,
            force: true,
          }),
        ),
        'Failed to clean dist directory',
      ),
    successMessage: 'Cleaned dist directory',
  });

  await logStep({
    startMessage: 'Generating index files',
    action: () => runCmdStep('pnpm run gi', 'Generating index files failed'),
    successMessage: 'Index files generated',
  });

  await logStep({
    startMessage: 'Compiling sources with tsc',
    action: () =>
      runCmdStep(
        `tsc --project "${tsconfigPath}"`,
        'TypeScript compilation failed',
      ),
    successMessage: 'Build completed',
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

await build(process.argv.includes('--skip-check'));
