import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { rollup } from 'rollup';
import { type UnknownResult } from 'ts-data-forge';
import { $, Result } from 'ts-repo-utils';
import { workspaceRootPath } from '../workspace-root-path.mjs';

const distDir = path.resolve(workspaceRootPath, './dist');

/**
 * The monorepo root, where the hoisted `node_modules` lives.
 */
const monorepoRootPath = path.resolve(workspaceRootPath, '../..');

/**
 * The native TypeScript compiler (TypeScript >= 7), installed under the alias
 * "typescript-native" and hoisted to the monorepo root's `node_modules`. It is
 * used for type checking and declaration emit; JS transpilation is done by
 * esbuild via Rollup.
 */
const nativeTsc = path.resolve(
  monorepoRootPath,
  './node_modules/typescript-native/bin/tsc',
);

/**
 * Builds the ESLint plugin package.
 */
const build = async (skipCheck: boolean): Promise<void> => {
  console.info('Starting build process...\n');

  await logStep({
    startMessage: 'Generating rule type definitions',
    action: () =>
      runCmdStep('pnpm run gen:rule-types', 'Rule type generation failed'),
    successMessage: 'Rule type definitions generated',
  });

  if (!skipCheck) {
    await logStep({
      startMessage: 'Verifying branded number type coverage',
      action: () =>
        runCmdStep(
          'pnpm run check:branded-number-types',
          'Branded number type coverage check failed',
        ),
      successMessage: 'Branded number type coverage verified',
    });

    await logStep({
      startMessage: 'Checking file extensions',
      action: () =>
        runCmdStep('pnpm run check:ext', 'Checking file extensions failed'),
      successMessage: 'File extensions validated',
    });

    await logStep({
      startMessage: 'Running type checking',
      action: () =>
        runCmdStep(`node "${nativeTsc}" --noEmit`, 'Type checking failed'),
      successMessage: 'Type checking passed',
    });
  }

  await logStep({
    startMessage: 'Cleaning dist directory',
    action: () =>
      runStep(
        Result.fromPromise(fs.rm(distDir, { recursive: true, force: true })),
        'Failed to clean dist directory',
      ),
    successMessage: 'Cleaned dist directory',
  });

  await logStep({
    startMessage: 'Building with Rollup',
    action: async () => {
      const { default: rollupConfig } =
        await import('../../configs/rollup.config.mjs');

      await runStep(
        Result.fromPromise(
          (async () => {
            await using bundle = await rollup(rollupConfig);

            const outputs =
              rollupConfig.output === undefined
                ? ([] as const)
                : Array.isArray(rollupConfig.output)
                  ? rollupConfig.output
                  : ([rollupConfig.output] as const);

            for (const output of outputs) {
              await bundle.write(output);
            }
          })(),
        ),
        'Rollup build failed',
      );
    },
    successMessage: 'Rollup build completed',
  });

  await logStep({
    startMessage: 'Generating type declarations',
    action: () =>
      runCmdStep(
        `node "${nativeTsc}" -p "${path.resolve(workspaceRootPath, './configs/tsconfig.build.json')}" --emitDeclarationOnly`,
        'Type declaration generation failed',
      ),
    successMessage: 'Type declarations generated',
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
    console.error(`${errorMsg}: ${String(result.value)}`);

    console.error('❌ Build failed');

    process.exit(1);
  }
};

await build(process.argv.includes('--skip-check'));
