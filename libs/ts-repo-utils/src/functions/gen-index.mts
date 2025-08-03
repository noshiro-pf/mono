import micromatch from 'micromatch';
import { Arr, ISet, isString, pipe, Result } from 'ts-data-forge';
import '../node-global.mjs';
import { assertPathExists } from './assert-path-exists.mjs';

/** Configuration for index file generation. */
export type GenIndexConfig = DeepReadonly<{
  /** Target directories to generate index files for (string or array of strings) */
  targetDirectory: string | readonly string[];

  /**
   * Glob patterns of files or predicate function to exclude from exports
   * (default: excludes `'**\/*.{test,spec}.?(c|m)[jt]s?(x)'` and
   * `'**\/*.d.?(c|m)ts'`)
   */
  exclude?:
    | readonly string[]
    | ((
        args: Readonly<{
          absolutePath: string;
          relativePath: string;
          fileName: string;
        }>,
      ) => boolean);

  /** File extensions of source files to export (default: ['.ts', '.tsx']) */
  targetExtensions?: readonly `.${string}`[];

  /** File extension of index files to generate (default: '.ts') */
  indexFileExtension?: `.${string}`;

  /** File extension to use in export statements (default: '.js') */
  exportStatementExtension?: `.${string}` | 'none';

  /** Command to run for formatting generated files (optional) */
  formatCommand?: string;

  /** Whether to suppress output during execution (default: false) */
  silent?: boolean;
}>;

const defaultConfig = {
  exclude: ['**/*.{test,spec}.?(c|m)[jt]s?(x)', '**/*.d.?(c|m)ts'],
  targetExtensions: ['.ts', '.tsx'],
  indexFileExtension: '.ts',
  exportStatementExtension: '.js', // For ESM imports, .mts resolves to .mjs
  silent: false,
} as const satisfies Required<
  StrictOmit<GenIndexConfig, 'targetDirectory' | 'formatCommand'>
>;

type GenIndexConfigInternal = DeepReadonly<{
  formatCommand: string | undefined;
  targetDirectory: ISet<string>;
  exclude: (
    args: Readonly<{
      absolutePath: string;
      relativePath: string;
      fileName: string;
    }>,
  ) => boolean;
  targetExtensions: ISet<`.${string}`>;
  indexFileExtension: `.${string}`;
  exportStatementExtension: `.${string}` | 'none';
  silent: boolean;
}>;

/**
 * Generates index.ts files recursively in `config.targetDirectory`.
 *
 * @param config - Configuration for index file generation
 * @throws Error if any step fails.
 */
export const genIndex = async (config: GenIndexConfig): Promise<void> => {
  echo('Starting index file generation...\n');

  // Merge config with defaults
  const filledConfig: GenIndexConfigInternal = fillConfig(config);

  // Normalize target directories to array
  const targetDirs =
    typeof config.targetDirectory === 'string'
      ? [config.targetDirectory]
      : config.targetDirectory;

  try {
    // Step 1: Verify target directories exist
    for (const dir of targetDirs) {
      const resolvedDir = path.resolve(dir);
      // eslint-disable-next-line no-await-in-loop
      await assertPathExists(resolvedDir, `Target directory: ${dir}`);
    }

    // Step 2: Generate index files
    echo('Generating index files...');
    for (const dir of targetDirs) {
      const resolvedDir = path.resolve(dir);
      // eslint-disable-next-line no-await-in-loop
      await generateIndexFileForDir(resolvedDir, filledConfig);
    }
    echo('✓ Index files generated\n');

    // Step 3: Format generated files
    if (filledConfig.formatCommand !== undefined) {
      echo('Formatting generated files...');
      const fmtResult = await $(filledConfig.formatCommand, {
        silent: filledConfig.silent,
      });
      if (Result.isErr(fmtResult)) {
        throw new Error(`Formatting failed: ${fmtResult.value.message}`);
      }
      echo('✓ Formatting completed\n');
    }

    echo('✅ Index file generation completed successfully!\n');
  } catch (error) {
    echo(`❌ Index generation failed: ${String(error)}\n`);
    throw error;
  }
};

const fillConfig = (config: GenIndexConfig): GenIndexConfigInternal => {
  const targetExtensions =
    config.targetExtensions ?? defaultConfig.targetExtensions;

  const exportExtension =
    config.exportStatementExtension ?? defaultConfig.exportStatementExtension;

  return {
    formatCommand: config.formatCommand,
    targetDirectory: ISet.create(
      isString(config.targetDirectory)
        ? [config.targetDirectory]
        : config.targetDirectory,
    ),
    exclude: pipe(config.exclude).map((exclude) =>
      typeof exclude === 'function'
        ? exclude
        : pipe(
            ISet.create<string>(
              Arr.generate(function* () {
                if (exclude !== undefined && Array.isArray(exclude)) {
                  yield* exclude;
                }
                yield* defaultConfig.exclude;
              }),
            ),
          ).map(
            (set) =>
              ({
                relativePath,
                fileName,
              }: Readonly<{
                absolutePath: string;
                relativePath: string;
                fileName: string;
              }>) => {
                for (const pattern of set.values()) {
                  if (
                    micromatch.isMatch(relativePath, pattern) ||
                    micromatch.isMatch(fileName, pattern)
                  ) {
                    return true;
                  }
                }
                return false;
              },
          ).value,
    ).value,
    targetExtensions: ISet.create(targetExtensions),
    indexFileExtension:
      config.indexFileExtension ?? defaultConfig.indexFileExtension,
    exportStatementExtension: exportExtension,
    silent: config.silent ?? defaultConfig.silent,
  };
};

/**
 * Generates an index.ts file for the given directory. Recursively calls itself
 * for subdirectories.
 *
 * @param dirPath - The absolute path to the directory to process.
 * @param config - The merged configuration object.
 * @param baseDir - The base directory path for calculating relative paths
 *   (optional, defaults to dirPath).
 * @throws Error if directory processing fails.
 */
const generateIndexFileForDir = async (
  dirPath: string,
  config: GenIndexConfigInternal,
  baseDir?: string,
): Promise<void> => {
  try {
    const actualBaseDir = baseDir ?? dirPath;
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    const mut_subDirectories: string[] = [];
    const mut_filesToExport: string[] = [];

    for (const entry of entries) {
      const entryName = entry.name;
      const entryPath = path.join(dirPath, entryName);
      const relativePath = path.relative(actualBaseDir, entryPath);

      if (
        config.exclude({
          absolutePath: entryPath,
          relativePath,
          fileName: entryName,
        })
      ) {
        continue; // Skip excluded directories/files
      }

      if (entry.isDirectory()) {
        mut_subDirectories.push(entryName);
        // Recursively call for subdirectories first
        // eslint-disable-next-line no-await-in-loop
        await generateIndexFileForDir(entryPath, config, actualBaseDir);
      } else if (
        entry.isFile() &&
        shouldExportFile({
          absolutePath: entryPath,
          filePath: relativePath,
          config,
        })
      ) {
        mut_filesToExport.push(entryName);
      }
    }

    const indexContent = generateIndexContent(
      mut_subDirectories,
      mut_filesToExport,
      config,
    );

    const indexPath = path.join(dirPath, `index${config.indexFileExtension}`);

    await fs.writeFile(indexPath, indexContent);
    echo(`Generated: ${path.relative(process.cwd(), indexPath)}`);
  } catch (error) {
    throw new Error(
      `Failed to generate index for directory ${dirPath}: ${String(error)}`,
    );
  }
};

const indexRegex = /^index\.[cm]?[jt]s[x]?$/u;

/**
 * Determines if a file should be exported in the index file. A file is exported
 * if:
 *
 * - It has one of the configured source extensions
 * - It's not an index file itself
 * - It doesn't match any exclusion patterns
 *
 * @param filePath - The relative path to the file from the target directory.
 * @param absolutePath - The absolute path to the file.
 * @param config - The merged configuration object.
 * @returns True if the file should be exported.
 */
const shouldExportFile = ({
  absolutePath,
  filePath,
  config,
}: Readonly<{
  absolutePath: string;
  filePath: string;
  config: GenIndexConfigInternal;
}>): boolean => {
  const fileName = path.basename(filePath);

  const ext = path.extname(fileName);

  // Must have the correct source extension
  if (!config.targetExtensions.has(ext)) {
    return false;
  }

  // Don't export the index file itself
  if (
    indexRegex.test(fileName) // Matches index.ts, index.mts, index.js, index.tsx
  ) {
    return false;
  }

  // Check against exclusion patterns
  if (
    config.exclude({
      absolutePath,
      relativePath: filePath,
      fileName,
    })
  ) {
    return false;
  }

  return true;
};

if (import.meta.vitest !== undefined) {
  describe('index file regex', () => {
    test.each([
      ['index.ts', true],
      ['index.js', true],
      ['index.mts', true],
      ['index.mjs', true],
      ['index.cts', true],
      ['index.cjs', true],
      ['index.tsx', true],
      ['index.jsx', true],
      ['not-index.ts', false],
      ['index.txt', false],
    ] as const)('indexRegex.test($0) to be $1', (fileName, expected) => {
      expect(indexRegex.test(fileName)).toBe(expected);
    });
  });
}

/**
 * Generates the content for an index file.
 *
 * @param subDirectories - Array of subdirectory names.
 * @param filesToExport - Array of file names to export.
 * @param config - The merged configuration object.
 * @returns The index file content.
 */
const generateIndexContent = (
  subDirectories: readonly string[],
  filesToExport: readonly string[],
  config: GenIndexConfigInternal,
): string => {
  const exportStatements = [
    ...subDirectories.map((subDir) =>
      config.exportStatementExtension === 'none'
        ? `export * from "./${subDir}";`
        : `export * from "./${subDir}/index${config.exportStatementExtension}";`,
    ),
    ...filesToExport.map((file) => {
      const fileNameWithoutExt = path.basename(file, path.extname(file));

      return config.exportStatementExtension === 'none'
        ? `export * from "./${fileNameWithoutExt}";`
        : `export * from "./${fileNameWithoutExt}${config.exportStatementExtension}";`;
    }),
  ];

  return exportStatements.length === 0
    ? 'export {};'
    : exportStatements.join('\n');
};
