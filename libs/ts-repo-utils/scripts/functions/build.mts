import '../node-global.mjs';
import { ensurePathExists } from '../utils.mjs';
import { checkExt } from './check-ext.mjs';
import { genIndex } from './gen-index.mjs';

// Build configuration
const BUILD_CONFIG = {
  distDir: path.resolve(projectRootPath, './dist'),
  srcGlobalsFile: path.resolve(projectRootPath, './src/globals.d.mts'),
  rollupConfig: path.resolve(projectRootPath, './configs/rollup.config.ts'),
  distTsConfig: { include: ['.'] },
} as const;

/**
 * Cleans the distribution directory.
 */
const cleanDist = async (): Promise<void> => {
  try {
    await fs.rm(BUILD_CONFIG.distDir, {
      recursive: true,
      force: true,
    });
    echo('✓ Cleaned dist directory\n');
  } catch (error) {
    throw new Error(`Failed to clean dist directory: ${String(error)}`);
  }
};

/**
 * Runs TypeScript type checking.
 */
const typeCheck = async (): Promise<void> => {
  const result = await $('tsc --noEmit');
  if (result.type === 'error') {
    throw new Error(`Type checking failed: ${result.exception.message}`);
  }
  echo('✓ Type checking passed\n');
};

/**
 * Builds the project using Rollup.
 */
const rollupBuild = async (): Promise<void> => {
  try {
    await ensurePathExists(BUILD_CONFIG.rollupConfig, 'Rollup config');

    const rollupCmd = [
      'rollup',
      `--config ${BUILD_CONFIG.rollupConfig}`,
      '--configPlugin typescript',
      '--configImportAttributesKey with',
    ].join(' ');

    const result = await $(rollupCmd);
    if (result.type === 'error') {
      throw new Error(`Rollup build failed: ${result.exception.message}`);
    }
    echo('✓ Rollup build completed\n');
  } catch (error) {
    throw new Error(`Rollup build failed: ${String(error)}`);
  }
};

/**
 * Copies global type definitions to dist.
 */
const copyGlobals = async (): Promise<void> => {
  try {
    await ensurePathExists(BUILD_CONFIG.srcGlobalsFile, 'Global types file');

    const destFile = path.resolve(BUILD_CONFIG.distDir, 'globals.d.mts');
    const copyResult = await $(
      `cp "${BUILD_CONFIG.srcGlobalsFile}" "${destFile}"`,
    );
    if (copyResult.type === 'error') {
      throw new Error(
        `Failed to copy globals: ${copyResult.exception.message}`,
      );
    }
    echo('✓ Copied globals.d.mts to dist\n');
  } catch (error) {
    throw new Error(`Failed to copy globals: ${String(error)}`);
  }
};

/**
 * Generates TypeScript configuration for dist directory.
 */
const generateDistTsConfig = async (): Promise<void> => {
  try {
    const configContent = JSON.stringify(BUILD_CONFIG.distTsConfig);
    const configFile = path.resolve(BUILD_CONFIG.distDir, 'tsconfig.json');

    await fs.writeFile(configFile, configContent);
    echo('✓ Generated dist/tsconfig.json\n');
  } catch (error) {
    throw new Error(`Failed to generate tsconfig: ${String(error)}`);
  }
};

/**
 * Builds the entire project.
 * @throws Error if any build step fails.
 */
export const build = async (): Promise<void> => {
  echo('Starting build process...\n');

  try {
    // Step 1: Validate file extensions
    echo('1. Checking file extensions...');
    await checkExt();

    // Step 2: Clean previous build
    echo('2. Cleaning dist directory...');
    await cleanDist();

    // Step 3: Generate index files
    echo('3. Generating index files...');
    await genIndex();

    // Step 4: Type checking
    echo('4. Running type checking...');
    await typeCheck();

    // Step 5: Build with Rollup
    echo('5. Building with Rollup...');
    await rollupBuild();

    // Step 6: Copy globals
    echo('6. Copying global type definitions...');
    await copyGlobals();

    // Step 7: Generate dist tsconfig
    echo('7. Generating dist TypeScript config...');
    await generateDistTsConfig();

    echo('✅ Build completed successfully!\n');
  } catch (error) {
    echo(`❌ Build failed: ${String(error)}\n`);
    throw error;
  }
};
