import micromatch from 'micromatch';
import { Arr, ISet, isString, Result } from 'ts-data-forge';
import '../node-global.mjs';
import { assertPathExists } from './assert-path-exists.mjs';

/**
 * Configuration for index file generation.
 */
export type GenIndexConfig = DeepReadonly<{
  /** Target directories to generate index files for (string or array of strings) */
  targetDirectory: string | readonly string[];

  /** Glob patterns of files to exclude from exports (default: excludes `'**\/*.{test,spec}.?(c|m)[jt]s?(x)'`) */
  excludePatterns?: readonly string[];

  /** File extensions of source files to export (default: ['.ts', '.tsx']) */
  sourceExtensions?: readonly `.${string}`[];

  /** File extension of index files to generate (default: '.ts') */
  indexExtension?: `.${string}`;

  /** File extension to use in export statements (default: '.js') */
  exportExtension?: `.${string}`;

  /** Command to run for formatting generated files (default: 'npm run fmt') */
  formatCommand?: string;

  /** Whether to suppress output during execution (default: false) */
  silent?: boolean;
}>;

type GenIndexConfigInternal = DeepReadonly<{
  formatCommand: string | undefined;
  targetDirectory: ISet<string>;
  excludePatterns: ISet<string>;
  sourceExtensions: ISet<`.${string}`>;
  indexExtension: `.${string}`;
  exportExtension: `.${string}`;
  silent: boolean;
}>;

/**
 * Generates index.ts files recursively in `config.targetDirectory`.
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
    echo('2. Generating index files...');
    for (const dir of targetDirs) {
      const resolvedDir = path.resolve(dir);
      // eslint-disable-next-line no-await-in-loop
      await generateIndexFileForDir(resolvedDir, filledConfig);
    }
    echo('✓ Index files generated\n');

    // Step 3: Format generated files
    if (filledConfig.formatCommand !== undefined) {
      echo('3. Formatting generated files...');
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

/**
 * Fills the configuration with default values.
 * Default values:
 * - sourceExtensions: ['.ts']
 * - indexExtension: '.ts'
 * - exportExtension: '.js'
 * - excludePatterns: ['**\/*.{test,spec}.?(c|m)[jt]s?(x)']
 * - silent: false
 * @param config - The input configuration object.
 * @returns The configuration object with all required properties filled with defaults.
 */
const fillConfig = (config: GenIndexConfig): GenIndexConfigInternal => {
  const sourceExtensions = config.sourceExtensions ?? ['.ts'];
  const exportExtension = config.exportExtension ?? '.js'; // For ESM imports, .mts resolves to .mjs

  return {
    formatCommand: config.formatCommand,
    targetDirectory: ISet.create(
      isString(config.targetDirectory)
        ? [config.targetDirectory]
        : config.targetDirectory,
    ),
    excludePatterns: ISet.create(
      Arr.generate(function* () {
        if (config.excludePatterns !== undefined) {
          yield* config.excludePatterns;
        }
        yield '**/*.{test,spec}.?(c|m)[jt]s?(x)';
      }),
    ),
    sourceExtensions: ISet.create(sourceExtensions),
    indexExtension: config.indexExtension ?? '.ts',
    exportExtension,
    silent: config.silent ?? false,
  };
};

/**
 * Generates an index.ts file for the given directory.
 * Recursively calls itself for subdirectories.
 * @param dirPath - The absolute path to the directory to process.
 * @param config - The merged configuration object.
 * @param baseDir - The base directory path for calculating relative paths (optional, defaults to dirPath).
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

    const subDirectories: string[] = [];
    const filesToExport: string[] = [];

    for (const entry of entries) {
      const entryName = entry.name;
      const entryPath = path.join(dirPath, entryName);
      const relativePath = path.relative(actualBaseDir, entryPath);

      if (
        config.excludePatterns.some(
          (pat) =>
            micromatch.isMatch(relativePath, pat) ||
            micromatch.isMatch(entryName, pat),
        )
      ) {
        continue; // Skip excluded directories/files
      }

      if (entry.isDirectory()) {
        subDirectories.push(entryName);
        // Recursively call for subdirectories first
        // eslint-disable-next-line no-await-in-loop
        await generateIndexFileForDir(entryPath, config, actualBaseDir);
      } else if (entry.isFile() && shouldExportFile(relativePath, config)) {
        filesToExport.push(entryName);
      }
    }

    const indexContent = generateIndexContent(
      subDirectories,
      filesToExport,
      config,
    );

    const indexPath = path.join(dirPath, `index${config.indexExtension}`);

    await fs.writeFile(indexPath, indexContent);
    echo(`Generated: ${path.relative(process.cwd(), indexPath)}`);
  } catch (error) {
    throw new Error(
      `Failed to generate index for directory ${dirPath}: ${String(error)}`,
    );
  }
};

/**
 * Determines if a file should be exported in the index file.
 * A file is exported if:
 * - It has one of the configured source extensions
 * - It's not an index file itself
 * - It doesn't match any exclusion patterns
 * @param filePath - The relative path to the file from the target directory.
 * @param config - The merged configuration object.
 * @returns True if the file should be exported.
 */
const shouldExportFile = (
  filePath: string,
  config: GenIndexConfigInternal,
): boolean => {
  const fileName = path.basename(filePath);

  const ext = path.extname(fileName);

  // Must have the correct source extension
  if (!config.sourceExtensions.has(ext)) {
    return false;
  }

  // Don't export the index file itself
  if (
    /^index\.[cm]?[jt]s[x]?$/u.test(fileName) // Matches index.ts, index.mts, index.js, index.tsx
  ) {
    return false;
  }

  // Check against exclusion patterns
  for (const pattern of config.excludePatterns.values()) {
    if (
      micromatch.isMatch(filePath, pattern) ||
      micromatch.isMatch(fileName, pattern)
    ) {
      return false;
    }
  }

  return true;
};

/**
 * Generates the content for an index file.
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
    ...subDirectories.map(
      (subDir) => `export * from "./${subDir}/index${config.exportExtension}";`,
    ),
    ...filesToExport.map((file) => {
      const fileNameWithoutExt = path.basename(file, path.extname(file));

      return `export * from "./${fileNameWithoutExt}${config.exportExtension}";`;
    }),
  ];

  return exportStatements.length === 0
    ? 'export {};'
    : exportStatements.join('\n');
};
