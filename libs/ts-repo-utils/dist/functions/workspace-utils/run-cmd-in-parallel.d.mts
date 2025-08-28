#!/usr/bin/env tsx
/**
 * Executes a npm script command across all workspace packages in parallel. Uses
 * fail-fast behavior - stops execution immediately when any package fails.
 *
 * @param options - Configuration options for the parallel execution
 * @param options.rootPackageJsonDir - The directory containing the root
 *   package.json file
 * @param options.cmd - The npm script command to execute in each package
 * @param options.concurrency - Maximum number of packages to process
 *   simultaneously (default: 3)
 * @param options.filterWorkspacePattern - Optional function to filter packages
 *   by name
 * @returns A promise that resolves when all packages have completed execution
 *   successfully, or rejects immediately on first failure
 */
export declare const runCmdInParallelAcrossWorkspaces: ({ rootPackageJsonDir, cmd, concurrency, filterWorkspacePattern, }: Readonly<{
    rootPackageJsonDir: string;
    cmd: string;
    concurrency?: number;
    filterWorkspacePattern?: (packageName: string) => boolean;
}>) => Promise<void>;
//# sourceMappingURL=run-cmd-in-parallel.d.mts.map