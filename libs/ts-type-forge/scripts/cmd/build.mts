import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { unknownToString } from 'ts-data-forge';
import { $, Result } from 'ts-repo-utils';
import { genGlobal } from '../functions/index.mjs';
import { projectRootPath } from '../project-root-path.mjs';

const srcDir = path.resolve(projectRootPath, 'src');

const distDir = path.resolve(projectRootPath, './dist');

const globalFilePath = path.resolve(srcDir, 'global.mts');

/**
 * Builds the entire project.
 */
const build = async (skipCheck: boolean): Promise<void> => {
  console.log('Starting build process...\n');

  await logStep({
    startMessage: 'Generating per-directory index.mts files',
    action: () => runCmdStep('pnpm run gi', 'Index generation failed'),
    successMessage: 'Generated src/**/index.mts',
  });

  await logStep({
    startMessage: 'Generating root global.mts',
    action: () =>
      runStep(
        Result.fromPromise(genGlobal(srcDir, globalFilePath)),
        'Failed to generate global.mts',
      ),
    successMessage: 'Generated src/global.mts',
  });

  if (!skipCheck) {
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
    startMessage: 'Emitting declarations with tsc',
    action: () =>
      runCmdStep(
        'tsc -p ./configs/tsconfig.build.json',
        'Declaration emit failed',
      ),
    successMessage: 'Declaration emit completed',
  });

  console.log('✅ Build completed successfully!\n');
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
  console.log(`${mut_step.current}. ${startMessage}...`);

  await action();

  console.log(`✓ ${successMessage}.\n`);

  mut_step.current += 1;
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
  promise: Promise<UnknownResult>,
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
