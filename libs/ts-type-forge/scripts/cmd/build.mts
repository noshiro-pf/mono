import { Result } from 'ts-data-forge';
import 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

const srcDir = path.resolve(projectRootPath, 'src');
const indexFilePath = path.resolve(srcDir, 'index.d.mts');

/**
 * Builds the entire project.
 */
const build = async (): Promise<void> => {
  echo('Starting build process...\n');

  // Step 1: Generate dist tsconfig
  {
    echo('1. Generating root index.d.mts...');
    await runStep(
      Result.fromPromise(genRootIndex()),
      'Failed to generate tsconfig',
    );
    echo('✓ Generated src/index.d.mts\n');
  }

  // Step 2: Validate file extensions
  echo('2. Checking file extensions...');
  await $('npm run check:ext');

  // Step 3: Type checking
  {
    echo('3. Running type checking...');
    await runCmdStep('tsc --noEmit', 'Type checking failed');
    echo('✓ Type checking passed\n');
  }

  echo('✅ Build completed successfully!\n');
};

const genRootIndex = async (): Promise<void> => {
  console.log(`Searching for .d.mts files in ${srcDir}...`);

  const dtsFiles: readonly string[] = await getDtsFiles();

  if (dtsFiles.length === 0) {
    console.log('No .d.mts files found (excluding index.d.mts).');
    // Optionally clear the index file or leave it as is
    // await fs.writeFile(indexFilePath, '', 'utf-8');
    return;
  }

  const referenceLines = dtsFiles
    .map((filePath) => {
      // Make path relative to srcDir and use forward slashes
      const relativePath = path
        .relative(srcDir, filePath)
        .replaceAll('\\', '/');
      return `/// <reference path="./${relativePath}" />`;
    })
    .toSorted(); // Sort alphabetically for consistent order

  const fileContent = `${referenceLines.join('\n')}\n`; // Add trailing newline

  try {
    await fs.writeFile(indexFilePath, fileContent, 'utf8');
    console.log(
      `Successfully generated ${indexFilePath} with ${referenceLines.length} references.`,
    );
  } catch (error) {
    console.error(`Error writing to ${indexFilePath}:`, error);
  }
};

const getDtsFiles = async (): Promise<readonly string[]> => {
  const dtsFiles = await glob(`${srcDir}/**/*.d.mts`);
  return dtsFiles.filter((filePath) => filePath !== indexFilePath);
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
