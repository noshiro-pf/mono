import '../node-global.mjs';
/**
 * Format a list of files using Prettier
 *
 * @param files - Array of file paths to format
 * @returns 'ok' if successful, 'err' if any errors occurred
 */
export declare const formatFilesList: (files: readonly string[], options?: Readonly<{
    silent?: boolean;
}>) => Promise<"ok" | "err">;
/**
 * Format files matching the given glob pattern using Prettier
 *
 * @param pathGlob - Glob pattern to match files
 * @returns 'ok' if successful, 'err' if any errors occurred
 */
export declare const formatFiles: (pathGlob: string, options?: Readonly<{
    silent?: boolean;
}>) => Promise<"ok" | "err">;
/**
 * Format only files that have been changed (git status)
 *
 * @param options - Options for formatting
 * @returns 'ok' if successful, 'err' if any errors occurred
 */
export declare const formatUntracked: (options?: Readonly<{
    silent?: boolean;
}>) => Promise<"ok" | "err">;
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
export declare const formatDiffFrom: (base: string, options?: Readonly<{
    includeUntracked?: boolean;
    silent?: boolean;
}>) => Promise<"ok" | "err">;
//# sourceMappingURL=format.d.mts.map