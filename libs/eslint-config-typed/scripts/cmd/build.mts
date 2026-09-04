import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { unknownToString, type UnknownResult } from 'ts-data-forge';
import { $, Result } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { stripDistDevOnlyCode } from '../../../../tools/configs/strip-dev-only-code.mjs';

const distDir = path.resolve(projectRootPath, './dist');

/**
 * The monorepo root, where the hoisted `node_modules` lives.
 */
const monorepoRootPath = path.resolve(projectRootPath, '../..');

/**
 * The native TypeScript compiler (TypeScript >= 7). It is installed under the
 * alias "typescript-native" because the "typescript" package must stay on 6.x
 * for tools that require the JS compiler API (typescript-eslint, typedoc,
 * prettier-plugin-organize-imports, ...), which TypeScript 7 no longer
 * provides. Invoked via an explicit path because both packages declare a
 * `tsc` bin and the winner of the `node_modules/.bin/tsc` conflict is not
 * guaranteed. It is hoisted to the monorepo root's `node_modules`.
 */
const nativeTsc = path.resolve(
  monorepoRootPath,
  './node_modules/typescript-native/bin/tsc',
);

/**
 * Builds the entire project.
 */
const build = async (skipCheck: boolean): Promise<void> => {
  console.info('Starting build process...\n');

  if (!skipCheck) {
    await logStep({
      startMessage: 'Checking file extensions',
      action: () =>
        runCmdStep('pnpm run check:ext', 'Checking file extensions failed'),
      successMessage: 'File extensions validated',
    });

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
      startMessage: 'Generating rules types',
      action: () =>
        runCmdStep('pnpm run gen-rule-type', 'Generating rules types failed'),
      successMessage: 'Generated rules types',
    });

    await logStep({
      startMessage: 'Generating index files',
      action: () => runCmdStep('pnpm run gi', 'Generating index files failed'),
      successMessage: 'Index files generated',
    });
  }

  await logStep({
    startMessage: 'Compiling with the native tsc',
    action: () =>
      runCmdStep(
        `node "${nativeTsc}" -p "${path.resolve(projectRootPath, './configs/tsconfig.build.json')}"`,
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
        Result.fromPromise(stripDistDevOnlyCode(distDir)),
        'Stripping development-only code failed',
      ),
    successMessage: 'Development-only code stripped',
  });

  await logStep({
    startMessage: 'Generating dist/types.d.mts',
    action: async () => {
      const content = "export * from './entry-point.mjs';\n";

      const typesFile = path.resolve(distDir, 'types.d.mts');

      await runStep(
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        Result.fromPromise(fs.writeFile(typesFile, content)),
        'Failed to generate dist/types.d.mts',
      );
    },
    successMessage: 'Generated dist/types.d.mts',
  });

  await logStep({
    startMessage: 'Generating dist TypeScript config',
    action: async () => {
      const configContent = JSON.stringify({ include: ['.'] });

      const configFile = path.resolve(distDir, 'tsconfig.json');

      await runStep(
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        Result.fromPromise(fs.writeFile(configFile, configContent)),
        'Failed to generate tsconfig',
      );
    },
    successMessage: 'Generated dist/tsconfig.json',
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
