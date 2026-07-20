import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { type UnknownResult, unknownToString } from 'ts-data-forge';
import { $, Result } from 'ts-repo-utils';
import { genEntryPoint, genGlobal } from '../functions/index.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import { genAgentsMd } from './gen-agents-md.mjs';

const srcDir = path.resolve(projectRootPath, 'src');

const distDir = path.resolve(projectRootPath, './dist');

const globalFilePath = path.resolve(srcDir, 'global.mts');

const entryPointFilePath = path.resolve(srcDir, 'entry-point.mts');

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

  await logStep({
    startMessage: 'Generating root entry-point.mts',
    action: () =>
      runStep(
        Result.fromPromise(genEntryPoint(srcDir, entryPointFilePath)),
        'Failed to generate entry-point.mts',
      ),
    successMessage: 'Generated src/entry-point.mts',
  });

  await logStep({
    startMessage: 'Generating AGENTS.md',
    action: () => runStep(genAgentsMd(), 'Failed to generate AGENTS.md'),
    successMessage: 'Generated AGENTS.md',
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
      action: () =>
        runCmdStep(`node "${nativeTsc}" --noEmit`, 'Type checking failed'),
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
        `node "${nativeTsc}" -p ./configs/tsconfig.build.json`,
        'Declaration emit failed',
      ),
    successMessage: 'Declaration emit completed',
  });

  await logStep({
    startMessage:
      'Linking the package into test/dist_/node_modules (for exports-map resolution)',
    action: () =>
      runStep(
        Result.fromPromise(ensureDistTestPackageLink()),
        'Failed to link the package into test/dist_/node_modules',
      ),
    successMessage: 'Linked test/dist_/node_modules/ts-type-forge',
  });

  if (!skipCheck) {
    await logStep({
      startMessage:
        'Type-checking the dist output through the package exports map (named imports)',
      action: () =>
        runCmdStep(
          `node "${nativeTsc}" -p ./test/dist_/named/tsconfig.json`,
          'dist output type check (named imports) failed',
        ),
      successMessage: 'dist output type check (named imports) passed',
    });

    await logStep({
      startMessage:
        'Type-checking the dist output through the package exports map (ambient global)',
      action: () =>
        runCmdStep(
          `node "${nativeTsc}" -p ./test/dist_/ambient/tsconfig.json`,
          'dist output type check (ambient global) failed',
        ),
      successMessage: 'dist output type check (ambient global) passed',
    });
  }

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

/**
 * Materializes a minimal `test/dist_/node_modules/ts-type-forge` package (a
 * directory containing symlinks to the repository's `package.json` and
 * `dist/` only — the same surface a published tarball has) so that the dist
 * smoke tests (`test/dist_/*.mts`) resolve the package through the real
 * `package.json` `exports` map, exactly like an external consumer.
 *
 * Deliberately NOT a symlink to the repository root: that would expose the
 * whole repository (including `node_modules/`) under `test/dist_/`, which
 * derails tools that walk the tree (e.g. markdownlint scanning every
 * dependency README through the link).
 *
 * (`node_modules` is gitignored, so the links are re-created on every build.)
 */
const ensureDistTestPackageLink = async (): Promise<void> => {
  const packageDir = path.resolve(
    projectRootPath,
    'test/dist_/node_modules/ts-type-forge',
  );

  // Remove leftovers from a previous build so the links never go stale.
  await fs.rm(packageDir, { recursive: true, force: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.mkdir(packageDir, { recursive: true });

  for (const entry of ['package.json', 'dist'] as const) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.symlink(
      path.relative(packageDir, path.resolve(projectRootPath, entry)),
      path.resolve(packageDir, entry),
    );
  }
};

await build(process.argv.includes('--skip-check'));
