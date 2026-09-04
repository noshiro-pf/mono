import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Result, type UnknownResult, unknownToString } from 'ts-data-forge';
import { $ } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { stripDistDevOnlyCode } from '../../../../tools/configs/strip-dev-only-code.mjs';

const distDir = path.resolve(projectRootPath, './dist');

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

  await logStep({
    startMessage:
      'Linking the package into test/dist_/node_modules (for exports-map resolution)',
    action: () =>
      runStep(
        Result.fromPromise(ensureDistTestPackageLink()),
        'Failed to link the package into test/dist_/node_modules',
      ),
    successMessage: 'Linked test/dist_/node_modules/ts-repo-utils',
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
  }

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

/**
 * Materializes a minimal `test/dist_/node_modules/ts-repo-utils` package (a
 * directory containing symlinks to the repository's `package.json` and
 * `dist/` only — the same surface a published tarball has) so that the dist
 * smoke tests (`test/dist_/**`) resolve the package through the real
 * `package.json` `exports` map, exactly like an external consumer.
 *
 * Deliberately NOT a symlink to the repository root: that would expose the
 * whole repository (including `node_modules/`) under `test/dist_/`, which
 * derails tools that walk the tree.
 *
 * (`node_modules` is gitignored, so the links are re-created on every build.)
 */
const ensureDistTestPackageLink = async (): Promise<void> => {
  const packageDir = path.resolve(
    projectRootPath,
    'test/dist_/node_modules/ts-repo-utils',
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
