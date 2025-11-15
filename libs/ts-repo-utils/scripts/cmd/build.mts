import { unknownToString } from 'ts-data-forge';
import { assertPathExists } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

const distDir = path.resolve(projectRootPath, './dist');

/**
 * Builds the entire project.
 */
const build = async (skipCheck: boolean): Promise<void> => {
  echo('Starting build process...\n');

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

    await logStep({
      startMessage: 'Running type checking',
      action: () => runCmdStep('tsc --noEmit', 'Type checking failed'),
      successMessage: 'Type checking passed',
    });
  }

  await logStep({
    startMessage: 'Building with Rollup',
    action: async () => {
      const rollupConfig = path.resolve(
        projectRootPath,
        './configs/rollup.config.ts',
      );

      await assertPathExists(rollupConfig, 'Rollup config');

      await runCmdStep(
        [
          'rollup',
          `--config ${rollupConfig}`,
          '--configPlugin typescript',
          '--configImportAttributesKey with',
        ].join(' '),
        'Rollup build failed',
      );
    },
    successMessage: 'Rollup build completed',
  });

  await logStep({
    startMessage: 'Copying global type definitions',
    action: async () => {
      const srcGlobalsFile = path.resolve(
        projectRootPath,
        './src/globals.d.mts',
      );

      await assertPathExists(srcGlobalsFile, 'Global types file');

      const destFile = path.resolve(distDir, 'globals.d.mts');

      await runCmdStep(
        `cp "${srcGlobalsFile}" "${destFile}"`,
        'Failed to copy globals',
      );
    },
    successMessage: 'Copied globals.d.mts to dist',
  });

  await logStep({
    startMessage: 'Generating dist/types.d.mts',
    action: async () => {
      const content = [
        "import './globals.d.mts';",
        "export * from './entry-point.mjs';",
      ].join('\n');

      const typesFile = path.resolve(distDir, 'types.d.mts');

      await runStep(
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
        Result.fromPromise(fs.writeFile(configFile, configContent)),
        'Failed to generate tsconfig',
      );
    },
    successMessage: 'Generated dist/tsconfig.json',
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
