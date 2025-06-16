import micromatch from 'micromatch';
import '../node-global.mjs';
import { assertExt } from './assert-ext.mjs';
import { assertPathExists } from './assert-path-exists.mjs';

/**
 * Configuration for index file generation.
 */
export type GenIndexConfig = DeepReadonly<{
  /** Target directories to generate index files for (string or array of strings) */
  targetDirectory: string | string[];

  /** File extension of source files to export (default: '.mts') */
  sourceExtension?: `.${string}`;

  /** File extension to use in export statements (default: '.mjs') */
  exportExtension?: `.${string}`;

  /** Glob patterns of files to exclude from exports (default: excludes .d.* and .test.* files) */
  excludePatterns?: string[];
}>;

/**
 * Generates index.mts files recursively in `config.targetDirectory`.
 * @param config - Configuration for index file generation
 * @throws Error if any step fails.
 */
export const genIndex = async (config: GenIndexConfig): Promise<void> => {
  echo('Starting index file generation...\n');

  // Merge config with defaults
  const filledConfig: DeepRequired<GenIndexConfig> = fillConfig(config);

  // Normalize target directories to array
  const targetDirs =
    typeof config.targetDirectory === 'string'
      ? [config.targetDirectory]
      : config.targetDirectory;

  try {
    // Step 1: Validate file extensions
    echo('1. Validating file extensions...');
    await assertExt({
      directories: [
        {
          path: path.resolve(projectRootPath, './src'),
          extension: '.mts',
          ignorePatterns: ['tsconfig.json', 'globals.d.mts'],
        },
        {
          path: path.resolve(projectRootPath, './scripts'),
          extension: '.mts',
          ignorePatterns: ['tsconfig.json'],
        },
      ],
    });
    echo('✓ File extensions validated\n');

    // Step 2: Verify target directories exist
    for (const dir of targetDirs) {
      const resolvedDir = path.resolve(dir);
      // eslint-disable-next-line no-await-in-loop
      await assertPathExists(resolvedDir, `Target directory: ${dir}`);
    }

    // Step 3: Generate index files
    echo('2. Generating index files...');
    for (const dir of targetDirs) {
      const resolvedDir = path.resolve(dir);
      // eslint-disable-next-line no-await-in-loop
      await generateIndexFileForDir(resolvedDir, filledConfig);
    }
    echo('✓ Index files generated\n');

    // Step 4: Format generated files
    echo('3. Formatting generated files...');
    const fmtResult = await $('npm run fmt');
    if (fmtResult.type === 'error') {
      throw new Error(`Formatting failed: ${fmtResult.exception.message}`);
    }
    echo('✓ Formatting completed\n');

    echo('✅ Index file generation completed successfully!\n');
  } catch (error) {
    echo(`❌ Index generation failed: ${String(error)}\n`);
    throw error;
  }
};

const fillConfig = (config: GenIndexConfig): DeepRequired<GenIndexConfig> => {
  const sourceExtension = config.sourceExtension ?? '.mts';
  const exportExtension = config.exportExtension ?? '.mjs'; // For ESM imports, .mts resolves to .mjs

  return {
    targetDirectory: config.targetDirectory,
    sourceExtension,
    exportExtension,
    excludePatterns: config.excludePatterns ?? [
      `*.d${sourceExtension}`,
      `*.test${sourceExtension}`,
    ],
  };
};

/**
 * Generates an index.mts file for the given directory.
 * Recursively calls itself for subdirectories.
 * @param dirPath - The absolute path to the directory to process.
 * @param config - The merged configuration object.
 * @param baseDir - The base directory path for calculating relative paths (optional, defaults to dirPath).
 * @throws Error if directory processing fails.
 */
const generateIndexFileForDir = async (
  dirPath: string,
  config: DeepReadonly<{
    sourceExtension: `.${string}`;
    exportExtension: `.${string}`;
    excludePatterns: string[];
  }>,
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

    const indexPath = path.join(dirPath, `index${config.sourceExtension}`);

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
 * @param filePath - The relative path to the file from the target directory.
 * @param config - The merged configuration object.
 * @returns True if the file should be exported.
 */
const shouldExportFile = (
  filePath: string,
  config: DeepReadonly<{
    sourceExtension: `.${string}`;
    excludePatterns: string[];
  }>,
): boolean => {
  const fileName = path.basename(filePath);

  // Must have the correct source extension
  if (!fileName.endsWith(config.sourceExtension)) {
    return false;
  }

  // Don't export the index file itself
  if (fileName === `index${config.sourceExtension}`) {
    return false;
  }

  // Check against exclusion patterns
  for (const pattern of config.excludePatterns) {
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
  config: DeepReadonly<{
    sourceExtension: string;
    exportExtension: `.${string}`;
  }>,
): string => {
  const exportStatements = [
    ...subDirectories.map(
      (subDir) => `export * from "./${subDir}/index${config.exportExtension}";`,
    ),
    ...filesToExport.map((file) => {
      const fileNameWithoutExt = path.basename(file, config.sourceExtension);

      return `export * from "./${fileNameWithoutExt}${config.exportExtension}";`;
    }),
  ];

  return exportStatements.length === 0
    ? 'export {};'
    : exportStatements.join('\n');
};
