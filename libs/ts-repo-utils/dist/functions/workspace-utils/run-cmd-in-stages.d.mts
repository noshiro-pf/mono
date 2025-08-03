#!/usr/bin/env tsx
/**
 * Executes a npm script command across all workspace packages in dependency
 * order stages. Packages are grouped into stages where each stage contains
 * packages whose dependencies have been completed in previous stages.
 *
 * @param options - Configuration options for the staged execution
 * @param options.rootPackageJsonDir - The directory containing the root
 *   package.json file
 * @param options.cmd - The npm script command to execute in each package
 * @param options.concurrency - Maximum number of packages to process
 *   simultaneously within each stage (default: 3)
 * @param options.filterWorkspacePattern - Optional function to filter packages
 *   by name
 * @returns A promise that resolves when all stages have completed execution
 */
export declare const runCmdInStagesAcrossWorkspaces: ({ rootPackageJsonDir, cmd, concurrency, filterWorkspacePattern, }: Readonly<{
    rootPackageJsonDir: string;
    cmd: string;
    concurrency?: number;
    filterWorkspacePattern?: (packageName: string) => boolean;
}>) => Promise<void>;
//# sourceMappingURL=run-cmd-in-stages.d.mts.map