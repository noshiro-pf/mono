import '../node-global.mjs';
import { ensurePathExists } from '../utils.mjs';
import { checkExt } from './check-ext.mjs';

const CONFIG = {
  baseDir: path.resolve(projectRootPath, './src'),
  targetExtension: '.mts',
  exportExtension: '.mjs', // For ESM imports, .mts resolves to .mjs
  indexFileName: {
    mts: 'index.mts',
    mjs: 'index.mjs',
  },
} as const;

/**
 * Generates index files for the project and formats the output.
 * @throws Error if any step fails.
 */
export const genIndex = async (): Promise<void> => {
  echo('Starting index file generation...\n');

  try {
    // Step 1: Validate file extensions
    echo('1. Validating file extensions...');
    await checkExt();
    echo('✓ File extensions validated\n');

    // Step 2: Verify source directory exists
    await ensurePathExists(CONFIG.baseDir, 'Source directory');

    // Step 3: Generate index files
    echo('2. Generating index files...');
    await generateIndexFileForDir(CONFIG.baseDir);
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

/**
 * Generates an index.mts file for the given directory.
 * Recursively calls itself for subdirectories.
 * @param dirPath - The absolute path to the directory to process.
 * @throws Error if directory processing fails.
 */
const generateIndexFileForDir = async (dirPath: string): Promise<void> => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    const subDirectories: string[] = [];
    const filesToExport: string[] = [];

    for (const entry of entries) {
      const entryName = entry.name;
      if (entry.isDirectory()) {
        subDirectories.push(entryName);
        // Recursively call for subdirectories first
        // eslint-disable-next-line no-await-in-loop
        await generateIndexFileForDir(path.join(dirPath, entryName));
      } else if (entry.isFile() && shouldExportFile(entryName)) {
        filesToExport.push(entryName);
      }
    }

    // Sort directories and files alphabetically for consistent output
    subDirectories.sort();
    filesToExport.sort();

    const indexContent = generateIndexContent(subDirectories, filesToExport);
    const indexPath = path.join(dirPath, CONFIG.indexFileName.mts);

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
 * @param fileName - The name of the file to check.
 * @returns True if the file should be exported.
 */
const shouldExportFile = (fileName: string): boolean =>
  fileName.endsWith(CONFIG.targetExtension) &&
  fileName !== CONFIG.indexFileName.mts &&
  !fileName.endsWith(`.d${CONFIG.targetExtension}`) &&
  !fileName.includes('.test.'); // Exclude test files

/**
 * Generates the content for an index file.
 * @param subDirectories - Array of subdirectory names.
 * @param filesToExport - Array of file names to export.
 * @returns The index file content.
 */
const generateIndexContent = (
  subDirectories: readonly string[],
  filesToExport: readonly string[],
): string => {
  const exportStatements = [
    ...subDirectories.map(
      (subDir) => `export * from "./${subDir}/${CONFIG.indexFileName.mjs}";`,
    ),
    ...filesToExport.map((file) => {
      const fileNameWithoutExt = file.substring(
        0,
        file.length - CONFIG.targetExtension.length,
      );

      return `export * from "./${fileNameWithoutExt}${CONFIG.exportExtension}";`;
    }),
  ];

  return exportStatements.length === 0
    ? 'export {};'
    : exportStatements.join('\n');
};
