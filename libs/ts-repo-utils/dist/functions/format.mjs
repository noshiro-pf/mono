import * as prettier from 'prettier';
import { Result, Arr } from 'ts-data-forge';
import '../node-global.mjs';
import { getDiffFrom, getUntrackedFiles } from './diff.mjs';

/**
 * Format a list of files using Prettier
 *
 * @param files - Array of file paths to format
 * @returns 'ok' if successful, 'err' if any errors occurred
 */
const formatFilesList = async (files, options) => {
    const silent = options?.silent ?? false;
    if (files.length === 0) {
        if (!silent) {
            echo('No files to format');
        }
        return 'ok';
    }
    if (!silent) {
        echo(`Formatting ${files.length} files...`);
    }
    // Format each file
    const results = await Promise.allSettled(files.map(async (filePath) => {
        try {
            // Read file content
            const content = await fs.readFile(filePath, 'utf8');
            // Resolve prettier config for this file
            const prettierOptions = await prettier.resolveConfig(filePath);
            // Check if file is ignored by prettier
            const fileInfo = await prettier.getFileInfo(filePath, {
                ignorePath: '.prettierignore',
            });
            if (fileInfo.ignored) {
                if (!silent) {
                    echo(`Skipping ignored file: ${filePath}`);
                }
                return;
            }
            // Format the content
            const formatted = await prettier.format(content, {
                ...prettierOptions,
                filepath: filePath,
            });
            // Only write if content changed
            if (formatted !== content) {
                await fs.writeFile(filePath, formatted, 'utf8');
                if (!silent) {
                    echo(`Formatted: ${filePath}`);
                }
            }
        }
        catch (error) {
            console.error(`Error formatting ${filePath}:`, error);
            throw error;
        }
    }));
    // Check if any formatting failed
    const hasErrors = results.some((result) => result.status === 'rejected');
    return hasErrors ? 'err' : 'ok';
};
/**
 * Format files matching the given glob pattern using Prettier
 *
 * @param pathGlob - Glob pattern to match files
 * @returns 'ok' if successful, 'err' if any errors occurred
 */
const formatFiles = async (pathGlob, options) => {
    const silent = options?.silent ?? false;
    try {
        // Find all files matching the glob
        const files = await glob(pathGlob, {
            absolute: true,
            ignore: ['**/node_modules/**', '**/.git/**'],
            dot: true,
        });
        if (files.length === 0) {
            if (!silent) {
                echo('No files found matching pattern:', pathGlob);
            }
            return 'ok';
        }
        return await formatFilesList(files, { silent });
    }
    catch (error) {
        console.error('Error in formatFiles:', error);
        return 'err';
    }
};
/**
 * Format only files that have been changed (git status)
 *
 * @param options - Options for formatting
 * @returns 'ok' if successful, 'err' if any errors occurred
 */
const formatUntracked = async (options) => {
    const silent = options?.silent ?? false;
    try {
        const untrackedFilesResult = await getUntrackedFiles({
            silent,
        });
        if (Result.isErr(untrackedFilesResult)) {
            console.error('Error getting changed files:', untrackedFilesResult.value);
            return 'err';
        }
        const files = untrackedFilesResult.value;
        if (files.length === 0) {
            if (!silent) {
                echo('No changed files to format');
            }
            return 'ok';
        }
        if (!silent) {
            echo('Formatting changed files:', files);
        }
        // Filter out non-existent files before formatting
        const fileExistenceChecks = await Promise.allSettled(files.map(async (filePath) => {
            try {
                await fs.readFile(filePath, 'utf8');
                return filePath;
            }
            catch {
                if (!silent) {
                    echo(`Skipping non-existent file: ${filePath}`);
                }
                return undefined;
            }
        }));
        const existingFiles = fileExistenceChecks
            .filter((result) => result.status === 'fulfilled' && result.value !== undefined)
            .map((result) => result.value);
        return await formatFilesList(existingFiles, { silent });
    }
    catch (error) {
        console.error('Error in formatUntracked:', error);
        return 'err';
    }
};
/**
 * Format only files that differ from the specified base branch or commit
 *
 * @param base - Base branch name or commit hash to compare against (defaults to
 *   'main')
 * @param options - Options for formatting
 * @param options.includeUntracked - Include untracked files in addition to diff
 *   files (default is true)
 * @param options.silent - Silent mode to suppress command output (default is
 *   false)
 * @returns 'ok' if successful, 'err' if any errors occurred
 */
const formatDiffFrom = async (base, options) => {
    const silent = options?.silent ?? false;
    try {
        // Get files that differ from base branch/commit (excluding deleted files)
        const diffFromBaseResult = await getDiffFrom(base, {
            silent,
        });
        if (Result.isErr(diffFromBaseResult)) {
            console.error('Error getting changed files:', diffFromBaseResult.value);
            return 'err';
        }
        const diffFiles = diffFromBaseResult.value;
        let mut_allFiles = diffFiles;
        // If includeUntracked is true, also get untracked files
        if (options?.includeUntracked ?? true) {
            const untrackedFilesResult = await getUntrackedFiles({
                silent,
            });
            if (Result.isErr(untrackedFilesResult)) {
                console.error('Error getting untracked files:', untrackedFilesResult.value);
                return 'err';
            }
            const untrackedFiles = untrackedFilesResult.value;
            // Combine and deduplicate files
            mut_allFiles = Arr.uniq([...diffFiles, ...untrackedFiles]);
            if (!silent) {
                echo(`Formatting files that differ from ${base} and untracked files:`, mut_allFiles);
            }
        }
        else {
            if (!silent) {
                echo(`Formatting files that differ from ${base}:`, mut_allFiles);
            }
        }
        if (mut_allFiles.length === 0) {
            if (!silent) {
                echo(`No files to format`);
            }
            return 'ok';
        }
        return await formatFilesList(mut_allFiles, { silent });
    }
    catch (error) {
        console.error('Error in formatDiffFrom:', error);
        return 'err';
    }
};

export { formatDiffFrom, formatFiles, formatFilesList, formatUntracked };
//# sourceMappingURL=format.mjs.map
