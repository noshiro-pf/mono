import '../node-global.mjs';
import { assertPathExists } from './assert-path-exists.mjs';

/**
 * Configuration for directory extension checking.
 */
export type CheckExtConfig = DeepReadonly<{
  /** Array of directory paths and their expected extensions */
  directories: {
    /** Directory path to check */
    path: string;
    /** Expected file extension (including the dot) */
    extension: string;
    /** Optional glob patterns to ignore (defaults to ['tsconfig.json', 'globals.d.*']) */
    ignorePatterns?: string[];
  }[];
}>;

/**
 * Validates that all files in specified directories have the correct extensions.
 * Exits with code 1 if any files have incorrect extensions.
 * @param config - Configuration specifying directories and expected extensions.
 */
export const assertExt = async (config: CheckExtConfig): Promise<void> => {
  // Check all directories in parallel
  const results = await Promise.all(
    config.directories.map(async ({ path: dir, extension, ignorePatterns }) => {
      try {
        return await getFilesWithIncorrectExtension(
          dir,
          extension,
          ignorePatterns,
        );
      } catch (error) {
        console.error(`Failed to check directory ${dir}: ${String(error)}`);
        return [];
      }
    }),
  );

  // Collect all incorrect files
  const allIncorrectFiles: readonly string[] = results.flat();

  if (allIncorrectFiles.length > 0) {
    const generateErrorMessage = (): string => {
      // Group directories by extension for a cleaner message
      const extensionGroups = new Map<string, string[]>();

      for (const { path: dirPath, extension } of config.directories) {
        const relativePath = path.relative(process.cwd(), dirPath);
        if (!extensionGroups.has(extension)) {
          extensionGroups.set(extension, []);
        }
        extensionGroups.get(extension)?.push(relativePath);
      }

      // Generate message parts for each extension
      const messageParts = Array.from(
        extensionGroups.entries(),
        ([ext, dirs]) => {
          const dirList = dirs.length === 1 ? dirs[0] : dirs.join(', ');
          return `${dirList} should have ${ext} extension`;
        },
      );

      return `All files in ${messageParts.join(' and ')}.`;
    };

    const errorMessage = [
      'Files with incorrect extensions found:',
      ...allIncorrectFiles.map((file) => `  - ${file}`),
      '',
      generateErrorMessage(),
    ].join('\n');

    echo(errorMessage);
    process.exit(1);
  }

  echo('✓ All files have correct extensions');
};

/**
 * Checks if all files in a directory have the expected extension.
 * @param dir - The directory to check.
 * @param expectedExtension - The expected file extension.
 * @param ignorePatterns - Optional glob patterns to ignore.
 * @returns Array of files with incorrect extensions.
 */
const getFilesWithIncorrectExtension = async (
  dir: string,
  expectedExtension: string,
  ignorePatterns?: readonly string[],
): Promise<readonly string[]> => {
  await assertPathExists(dir, 'Directory');

  const defaultIgnorePatterns = ['tsconfig.json', 'globals.d.*'];
  const finalIgnorePatterns = ignorePatterns ?? defaultIgnorePatterns;

  // Convert relative patterns to absolute paths for the glob ignore option
  const absoluteIgnorePatterns = finalIgnorePatterns.map((pattern) =>
    path.isAbsolute(pattern) ? pattern : `${dir}/${pattern}`,
  );

  const files = await glob(`${dir}/**/*`, {
    ignore: absoluteIgnorePatterns,
  });

  return files.filter((file) => !file.endsWith(expectedExtension));
};
