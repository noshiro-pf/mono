import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { unknownToString, type UnknownResult } from 'ts-data-forge';
import { $, Result } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';
import { genAgentsMd } from './gen-agents-md.mjs';

const distDir = path.resolve(projectRootPath, './dist');

const tsconfigPath = path.resolve(
  projectRootPath,
  './configs/tsconfig.build.json',
);

/**
 * The native TypeScript compiler (TypeScript >= 7). It is installed under the
 * alias "typescript-native" because the "typescript" package must stay on 6.x
 * for tools that require the JS compiler API (typescript-eslint, typedoc,
 * prettier-plugin-organize-imports, ...), which TypeScript 7 no longer
 * provides. Invoked via an explicit path because both packages declare a
 * `tsc` bin and the winner of the `node_modules/.bin/tsc` conflict is not
 * guaranteed.
 */
const nativeTsc = path.resolve(
  projectRootPath,
  './node_modules/typescript-native/bin/tsc',
);

/**
 * Builds the entire project.
 */
const build = async (skipChecks: boolean): Promise<void> => {
  console.log('Starting build process...\n');

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
    startMessage: 'Generating AGENTS.md',
    action: () => runStep(genAgentsMd(), 'Failed to generate AGENTS.md'),
    successMessage: 'Generated AGENTS.md',
  });

  await logStep({
    startMessage: 'Compiling sources with tsc',
    action: () =>
      runCmdStep(
        `node "${nativeTsc}" --project "${tsconfigPath}"`,
        'TypeScript compilation failed',
      ),
    successMessage: 'Build completed',
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
