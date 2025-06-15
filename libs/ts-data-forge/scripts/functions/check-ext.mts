import '../node-global.mjs';
import { ensurePathExists } from '../utils.mjs';

/**
 * Checks if all files in a directory have the expected extension.
 * @param dir - The directory to check.
 * @param expectedExtension - The expected file extension.
 * @returns Array of files with incorrect extensions.
 */
const getFilesWithIncorrectExtension = async (
  dir: string,
  expectedExtension: string,
): Promise<string[]> => {
  await ensurePathExists(dir, 'Directory');

  const files = await glob(`${dir}/**/*`, {
    ignore: [`${dir}/tsconfig.json`, `${dir}/globals.d.mts`],
  });

  return files.filter((file) => !file.endsWith(expectedExtension));
};

/**
 * Validates that all files in specified directories have the correct extensions.
 * @throws Error with details of all incorrect files found.
 */
export const checkExt = async (): Promise<void> => {
  const directories = [
    { path: path.resolve(projectRootPath, './src'), extension: '.mts' },
    { path: path.resolve(projectRootPath, './scripts'), extension: '.mts' },
  ];

  const allIncorrectFiles: string[] = [];

  // Check all directories in parallel
  const results = await Promise.all(
    directories.map(async ({ path: dir, extension }) => {
      try {
        return await getFilesWithIncorrectExtension(dir, extension);
      } catch (error) {
        console.error(`Failed to check directory ${dir}: ${String(error)}`);
        return [];
      }
    }),
  );

  // Collect all incorrect files
  results.forEach((incorrectFiles) => {
    allIncorrectFiles.push(...incorrectFiles);
  });

  if (allIncorrectFiles.length > 0) {
    const errorMessage = [
      'Files with incorrect extensions found:',
      ...allIncorrectFiles.map((file) => `  - ${file}`),
      '',
      'All files in src/ and scripts/ should have .mts extension.',
    ].join('\n');

    throw new Error(errorMessage);
  }

  echo('✓ All files have correct extensions');
};
