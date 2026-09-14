import * as path from 'node:path';
import { type UnknownResult, unknownToString } from 'ts-data-forge';
import { $, Result } from 'ts-repo-utils';
import {
  genEntryPoint,
  genGlobal,
  genNumberBrandTypes,
} from '../functions/index.mjs';
import { workspaceRootPath } from '../workspace-root-path.mjs';

const srcDir = path.resolve(workspaceRootPath, 'src');

const globalFilePath = path.resolve(srcDir, 'global.mts');

const entryPointFilePath = path.resolve(srcDir, 'entry-point.mts');

/**
 * Regenerates the committed sources this package derives from its own tree.
 *
 * `gi` sits in the middle rather than beside the other barrels: `global.mts`
 * and `entry-point.mts` are written from the per-directory `index.mts` files,
 * so they are stale until those have been regenerated.
 *
 * Not part of `build` — the output is committed, and a build that rewrites
 * sources is a build that cannot run beside its siblings (see "Building from a
 * clean checkout" in CLAUDE.md). `pnpm run ws:gen:src` is the repository-wide
 * form, and CI runs it and then asserts the tree is clean.
 */
const gen = async (): Promise<void> => {
  await logStep({
    startMessage: 'Generating branded integer number types',
    action: () =>
      runStep(
        genNumberBrandTypes(srcDir),
        'Failed to generate branded integer number types',
      ),
    successMessage: 'Generated src/branded-types/predefined-numbers/*.mts',
  });

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

  await logStep({
    startMessage: 'Generating root entry-point.mts',
    action: () =>
      runStep(
        Result.fromPromise(genEntryPoint(srcDir, entryPointFilePath)),
        'Failed to generate entry-point.mts',
      ),
    successMessage: 'Generated src/entry-point.mts',
  });

  console.info('✅ Generation completed successfully!\n');
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

    console.error('❌ Generation failed');

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

    console.error('❌ Generation failed');

    process.exit(1);
  }
};

await gen();
