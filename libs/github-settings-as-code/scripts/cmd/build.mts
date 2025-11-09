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
    // Step 1: Validate file extensions
    {
      echo('1. Checking file extensions...');
      await runCmdStep('pnpm run check:ext', 'Checking file extensions failed');
      echo('✓ File extensions validated\n');
    }

    // Step 2: Clean previous build
    {
      echo('2. Cleaning dist directory...');
      await runStep(
        Result.fromPromise(
          fs.rm(distDir, {
            recursive: true,
            force: true,
          }),
        ),
        'Failed to clean dist directory',
      );
      echo('✓ Cleaned dist directory\n');
    }

    // Step 3: Generate index files
    {
      echo('3. Generating index files...');
      await runCmdStep('pnpm run gi', 'Generating index files failed');
      echo('✓ Generating index files completed\n');
    }

    // Step 4: Type checking
    {
      echo('4. Running type checking...');
      await runCmdStep('tsc --noEmit', 'Type checking failed');
      echo('✓ Type checking passed\n');
    }
  }

  // Step 5: Build with Rollup
  {
    const rollupConfig = path.resolve(
      projectRootPath,
      './configs/rollup.config.ts',
    );

    echo('5. Building with Rollup...');
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
    echo('✓ Rollup build completed\n');
  }

  // Step 6: Copy globals
  {
    const srcGlobalsFile = path.resolve(projectRootPath, './src/globals.d.mts');
    echo('6. Copying global type definitions...');
    await assertPathExists(srcGlobalsFile, 'Global types file');

    const destFile = path.resolve(distDir, 'globals.d.mts');
    await runCmdStep(
      `cp "${srcGlobalsFile}" "${destFile}"`,
      'Failed to copy globals',
    );
    echo('✓ Copied globals.d.mts to dist\n');
  }

  // Step 7: Generate dist/types.d.mts
  {
    echo('7. Generating dist/types.d.mts...');
    const content = [
      "import './globals.d.mts';",
      "export * from './entry-point.mjs';",
    ].join('\n');

    const typesFile = path.resolve(distDir, 'types.d.mts');
    await runStep(
      Result.fromPromise(fs.writeFile(typesFile, content)),
      'Failed to generate dist/types.d.mts',
    );
    echo('✓ Generated dist/types.d.mts\n');
  }

  // Step 8: Generate dist tsconfig
  {
    echo('8. Generating dist TypeScript config...');
    const configContent = JSON.stringify({ include: ['.'] });
    const configFile = path.resolve(distDir, 'tsconfig.json');
    await runStep(
      Result.fromPromise(fs.writeFile(configFile, configContent)),
      'Failed to generate tsconfig',
    );
    echo('✓ Generated dist/tsconfig.json\n');
  }

  echo('✅ Build completed successfully!\n');
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
