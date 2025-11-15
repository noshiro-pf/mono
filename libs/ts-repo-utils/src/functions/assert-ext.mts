import { Arr, type IMap, isString, Result } from 'ts-data-forge';
import '../node-global.mjs';
import { assertPathExists } from './assert-path-exists.mjs';
import { createResultAssert } from './create-result-assert.mjs';

/** Configuration for directory extension checking. */
export type CheckExtConfig = DeepReadonly<{
  /** Array of directory paths and their expected extensions */
  directories: {
    /** Directory path to check */
    path: string;

    /**
     * Expected file extension(s) (including the dot). Can be a single extension
     * or an array of valid extensions
     */
    extension: `.${string}` | `.${string}`[];

    /**
     * Optional glob patterns to ignore (defaults to ['tsconfig.json',
     * 'globals.d.*'])
     */
    ignorePatterns?: string[];
  }[];
}>;

export type CheckExtError = Readonly<{
  message: string;
  files: readonly string[];
}>;

/**
 * Validates that all files in specified directories have the correct
 * extensions.
 *
 * @param config - Configuration specifying directories and expected extensions.
 * @returns Result.ok when all files pass, otherwise Result.err with details.
 */
export const checkExt = async (
  config: CheckExtConfig,
): Promise<Result<undefined, CheckExtError>> => {
  // Check all directories in parallel
  const results = await Promise.all(
    config.directories.map(async ({ path: dir, extension, ignorePatterns }) => {
      try {
        return await getFilesWithIncorrectExtension(
          dir,
          isString(extension) ? [extension] : extension,
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

  if (allIncorrectFiles.length === 0) {
    return Result.ok(undefined);
  }

  const message = [
    'Files with incorrect extensions found:',
    ...allIncorrectFiles.map((file) => `  - ${file}`),
    '',
    describeExpectedExtensions(config),
  ].join('\n');

  return Result.err({
    message,
    files: allIncorrectFiles,
  });
};

/**
 * Validates that all files in specified directories have the correct
 * extensions. Exits with code 1 if any files have incorrect extensions.
 *
 * @param config - Configuration specifying directories and expected extensions.
 */
export const assertExt = createResultAssert<
  CheckExtConfig,
  undefined,
  CheckExtError
>({
  run: checkExt,
  onError: (error) => {
    echo(error.message);
  },
  onSuccess: () => {
    echo('✓ All files have correct extensions');
  },
});

/**
 * Checks if all files in a directory have the expected extension.
 *
 * @param dir - The directory to check.
 * @param expectedExtensions - The expected file extensions.
 * @param ignorePatterns - Optional glob patterns to ignore.
 * @returns Array of files with incorrect extensions.
 */
const getFilesWithIncorrectExtension = async (
  dir: string,
  expectedExtensions: readonly string[],
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

  // Type assertion: glob always returns string[] for this use case
  return files.filter(
    (file) => !expectedExtensions.some((ext) => file.endsWith(ext)),
  );
};

const describeExpectedExtensions = (config: CheckExtConfig): string => {
  // Group directories by extension for a cleaner message
  const extensionGroups: IMap<
    string,
    readonly Readonly<{
      relativePath: string;
      extKey: string;
    }>[]
  > = Arr.groupBy(
    config.directories.map(({ path: dirPath, extension }) => {
      const relativePath = path.relative(process.cwd(), dirPath);

      const extKey = isString(extension) ? extension : extension.join(' or ');

      return {
        relativePath,
        extKey,
      };
    }),
    ({ extKey }) => extKey,
  );

  // Generate message parts for each extension
  const messageParts = Array.from(extensionGroups.entries(), ([ext, dirs]) => {
    const dirList =
      dirs.length === 1
        ? dirs[0]?.relativePath
        : dirs.map((d) => d.relativePath).join(', ');

    return `${dirList} should have ${ext} extension`;
  });

  return `All files in ${messageParts.join(' and ')}.`;
};
