#!/usr/bin/env tsx
import { executeParallel } from './execute-parallel.mjs';
import { getWorkspacePackages } from './get-workspace-packages.mjs';

/**
 * Executes a npm script command across all workspace packages in parallel.
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
 */
const runCmdInParallelAcrossWorkspaces = async ({ rootPackageJsonDir, cmd, concurrency = 3, filterWorkspacePattern, }) => {
    try {
        const packages = await getWorkspacePackages(rootPackageJsonDir);
        const filteredPackages = filterWorkspacePattern === undefined
            ? packages
            : packages.filter((pkg) => filterWorkspacePattern(pkg.name));
        await executeParallel(filteredPackages, cmd, concurrency);
        console.log(`\n✅ ${cmd} completed successfully`);
    }
    catch (error) {
        console.error(`\n❌ ${cmd} failed:`, error instanceof Error ? error.message : (error?.toString() ?? ''));
        process.exit(1);
    }
};

export { runCmdInParallelAcrossWorkspaces };
//# sourceMappingURL=run-cmd-in-parallel.mjs.map
