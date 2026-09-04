import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { unknownToString } from 'ts-data-forge';
import { $, Result } from 'ts-repo-utils';
import { workspaceRootPath } from '../workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { stripDistDevOnlyCode } from '../../../../tools/configs/strip-dev-only-code.mjs';

const distDir = path.resolve(workspaceRootPath, './dist');

/**
 * The monorepo root, where the hoisted `node_modules` lives.
 */
const monorepoRootPath = path.resolve(workspaceRootPath, '../..');

/**
 * The native TypeScript compiler (TypeScript >= 7), installed under the alias
 * "typescript-native" and hoisted to the monorepo root's `node_modules`. It
 * emits everything this package ships: the JavaScript, the declarations and
 * both source maps.
 */
const nativeTsc = path.resolve(
  monorepoRootPath,
  './node_modules/typescript-native/bin/tsc',
);

/**
 * Builds the package.
 */
const build = async (skipCheck: boolean): Promise<void> => {
  console.info('Starting build process...\n');

  await logStep({
    startMessage: 'Generating index files',
    action: () => runCmdStep('pnpm run gi', 'Generating index files failed'),
    successMessage: 'Index files generated',
  });

  if (!skipCheck) {
    await logStep({
      startMessage: 'Checking file extensions',
      action: () =>
        runCmdStep('pnpm run check:ext', 'Checking file extensions failed'),
      successMessage: 'File extensions validated',
    });
  }

  await logStep({
    startMessage: 'Cleaning dist directory',
    action: () =>
      runStep(
        () => fs.rm(distDir, { recursive: true, force: true }),
        'Failed to clean dist directory',
      ),
    successMessage: 'Cleaned dist directory',
  });

  await logStep({
    startMessage: 'Compiling with the native tsc',
    action: () =>
      runCmdStep(
        `node "${nativeTsc}" -p "${path.resolve(workspaceRootPath, './configs/tsconfig.build.json')}"`,
        'Compilation failed',
      ),
    successMessage: 'JavaScript and type declarations emitted',
  });

  // The compiler emits the type tests, the in-source tests and each
  // declaration's JSDoc into the JavaScript as written. This is what a
  // bundler's dead-code elimination used to remove; what goes is listed in
  // `tools/configs/strip-dev-only-code.mts`.
  await logStep({
    startMessage: 'Stripping development-only code from dist',
    action: () =>
      runStep(
        () => stripDistDevOnlyCode(distDir),
        'Stripping development-only code failed',
      ),
    successMessage: 'Development-only code stripped',
  });

  console.info('✅ Build completed successfully!\n');
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
  console.info(`${mut_step.current}. ${startMessage}...`);

  await action();

  console.info(`✓ ${successMessage}.\n`);

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
  action: () => Promise<unknown>,
  errorMsg: string,
): Promise<void> => {
  try {
    await action();
  } catch (error) {
    console.error(`${errorMsg}: ${unknownToString(error)}`);

    console.error('❌ Build failed');

    process.exit(1);
  }
};

await build(process.argv.includes('--skip-check'));
