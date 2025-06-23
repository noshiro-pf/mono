import { assertPathExists } from 'ts-repo-utils';
import { Result } from '../../src/index.mjs';
import { projectRootPath } from '../project-root-path.mjs';

// Build configuration
const BUILD_CONFIG = {
  distDir: path.resolve(projectRootPath, './dist'),
  srcGlobalsFile: path.resolve(projectRootPath, './src/globals.d.mts'),
  rollupConfig: path.resolve(projectRootPath, './configs/rollup.config.ts'),
  distTsConfig: { include: ['.'] },
} as const;

/**
 * Builds the entire project.
 */
const build = async (): Promise<void> => {
  echo('Starting build process...\n');

  // Step 1: Validate file extensions
  echo('1. Checking file extensions...');
  await $('npm run check:ext');

  // Step 2: Clean previous build
  {
    echo('2. Cleaning dist directory...');
    await runStep(
      Result.fromPromise(
        fs.rm(BUILD_CONFIG.distDir, {
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
    await runCmdStep('npm run gi', 'Generating index files failed');
    echo('✓ Generating index files completed\n');
  }

  // Step 4: Type checking
  {
    echo('4. Running type checking...');
    await runCmdStep('tsc --noEmit', 'Type checking failed');
    echo('✓ Type checking passed\n');
  }

  // Step 5: Build with Rollup
  {
    echo('5. Building with Rollup...');
    await assertPathExists(BUILD_CONFIG.rollupConfig, 'Rollup config');
    await runCmdStep(
      [
        'rollup',
        `--config ${BUILD_CONFIG.rollupConfig}`,
        '--configPlugin typescript',
        '--configImportAttributesKey with',
      ].join(' '),
      'Rollup build failed',
    );
    echo('✓ Rollup build completed\n');
  }

  // Step 6: Copy globals
  {
    echo('6. Copying global type definitions...');
    await assertPathExists(BUILD_CONFIG.srcGlobalsFile, 'Global types file');

    const destFile = path.resolve(BUILD_CONFIG.distDir, 'globals.d.mts');
    await runCmdStep(
      `cp "${BUILD_CONFIG.srcGlobalsFile}" "${destFile}"`,
      'Failed to copy globals',
    );
    echo('✓ Copied globals.d.mts to dist\n');
  }

  // Step 7: Generate dist tsconfig
  {
    echo('7. Generating dist TypeScript config...');
    const configContent = JSON.stringify(BUILD_CONFIG.distTsConfig);
    const configFile = path.resolve(BUILD_CONFIG.distDir, 'tsconfig.json');
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
    echo(`${errorMsg}: ${result.value.message}`);
    echo('❌ Build failed');
    process.exit(1);
  }
};

const runStep = async (
  promise: Promise<Result.Base>,
  errorMsg: string,
): Promise<void> => {
  const result = await promise;
  if (Result.isErr(result)) {
    echo(`${errorMsg}: ${String(result.value)}`);
    echo('❌ Build failed');
    process.exit(1);
  }
};

await build();
