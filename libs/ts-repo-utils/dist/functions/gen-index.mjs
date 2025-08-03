import micromatch from 'micromatch';
import { Result, ISet, pipe, Arr, isString } from 'ts-data-forge';
import '../node-global.mjs';
import { assertPathExists } from './assert-path-exists.mjs';

const defaultConfig = {
    exclude: ['**/*.{test,spec}.?(c|m)[jt]s?(x)', '**/*.d.?(c|m)ts'],
    targetExtensions: ['.ts', '.tsx'],
    indexFileExtension: '.ts',
    exportStatementExtension: '.js', // For ESM imports, .mts resolves to .mjs
    silent: false,
};
/**
 * Generates index.ts files recursively in `config.targetDirectory`.
 *
 * @param config - Configuration for index file generation
 * @throws Error if any step fails.
 */
const genIndex = async (config) => {
    echo('Starting index file generation...\n');
    // Merge config with defaults
    const filledConfig = fillConfig(config);
    // Normalize target directories to array
    const targetDirs = typeof config.targetDirectory === 'string'
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
    }
    catch (error) {
        echo(`❌ Index generation failed: ${String(error)}\n`);
        throw error;
    }
};
const fillConfig = (config) => {
    const targetExtensions = config.targetExtensions ?? defaultConfig.targetExtensions;
    const exportExtension = config.exportStatementExtension ?? defaultConfig.exportStatementExtension;
    return {
        formatCommand: config.formatCommand,
        targetDirectory: ISet.create(isString(config.targetDirectory)
            ? [config.targetDirectory]
            : config.targetDirectory),
        exclude: pipe(config.exclude).map((exclude) => typeof exclude === 'function'
            ? exclude
            : pipe(ISet.create(Arr.generate(function* () {
                if (exclude !== undefined && Array.isArray(exclude)) {
                    yield* exclude;
                }
                yield* defaultConfig.exclude;
            }))).map((set) => ({ relativePath, fileName, }) => {
                for (const pattern of set.values()) {
                    if (micromatch.isMatch(relativePath, pattern) ||
                        micromatch.isMatch(fileName, pattern)) {
                        return true;
                    }
                }
                return false;
            }).value).value,
        targetExtensions: ISet.create(targetExtensions),
        indexFileExtension: config.indexFileExtension ?? defaultConfig.indexFileExtension,
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
const generateIndexFileForDir = async (dirPath, config, baseDir) => {
    try {
        const actualBaseDir = baseDir ?? dirPath;
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const mut_subDirectories = [];
        const mut_filesToExport = [];
        for (const entry of entries) {
            const entryName = entry.name;
            const entryPath = path.join(dirPath, entryName);
            const relativePath = path.relative(actualBaseDir, entryPath);
            if (config.exclude({
                absolutePath: entryPath,
                relativePath,
                fileName: entryName,
            })) {
                continue; // Skip excluded directories/files
            }
            if (entry.isDirectory()) {
                mut_subDirectories.push(entryName);
                // Recursively call for subdirectories first
                // eslint-disable-next-line no-await-in-loop
                await generateIndexFileForDir(entryPath, config, actualBaseDir);
            }
            else if (entry.isFile() &&
                shouldExportFile({
                    absolutePath: entryPath,
                    filePath: relativePath,
                    config,
                })) {
                mut_filesToExport.push(entryName);
            }
        }
        const indexContent = generateIndexContent(mut_subDirectories, mut_filesToExport, config);
        const indexPath = path.join(dirPath, `index${config.indexFileExtension}`);
        await fs.writeFile(indexPath, indexContent);
        echo(`Generated: ${path.relative(process.cwd(), indexPath)}`);
    }
    catch (error) {
        throw new Error(`Failed to generate index for directory ${dirPath}: ${String(error)}`);
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
const shouldExportFile = ({ absolutePath, filePath, config, }) => {
    const fileName = path.basename(filePath);
    const ext = path.extname(fileName);
    // Must have the correct source extension
    if (!config.targetExtensions.has(ext)) {
        return false;
    }
    // Don't export the index file itself
    if (indexRegex.test(fileName) // Matches index.ts, index.mts, index.js, index.tsx
    ) {
        return false;
    }
    // Check against exclusion patterns
    if (config.exclude({
        absolutePath,
        relativePath: filePath,
        fileName,
    })) {
        return false;
    }
    return true;
};
/**
 * Generates the content for an index file.
 *
 * @param subDirectories - Array of subdirectory names.
 * @param filesToExport - Array of file names to export.
 * @param config - The merged configuration object.
 * @returns The index file content.
 */
const generateIndexContent = (subDirectories, filesToExport, config) => {
    const exportStatements = [
        ...subDirectories.map((subDir) => config.exportStatementExtension === 'none'
            ? `export * from "./${subDir}";`
            : `export * from "./${subDir}/index${config.exportStatementExtension}";`),
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

export { genIndex };
//# sourceMappingURL=gen-index.mjs.map
