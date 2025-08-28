#!/usr/bin/env tsx
import { executeStages } from './execute-parallel.mjs';
import { getWorkspacePackages } from './get-workspace-packages.mjs';

/**
 * Executes a npm script command across all workspace packages in dependency
 * order stages. Packages are grouped into stages where each stage contains
 * packages whose dependencies have been completed in previous stages. Uses
 * fail-fast behavior - stops execution immediately when any package fails.
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
 *   successfully, or rejects immediately on first failure
 */
const runCmdInStagesAcrossWorkspaces = async ({ rootPackageJsonDir, cmd, concurrency = 3, filterWorkspacePattern, }) => {
    try {
        const packages = await getWorkspacePackages(rootPackageJsonDir);
        const filteredPackages = filterWorkspacePattern === undefined
            ? packages
            : packages.filter((pkg) => filterWorkspacePattern(pkg.name));
        console.log(`\nStarting ${cmd} across ${filteredPackages.length} packages (fail-fast mode)...`);
        await executeStages(filteredPackages, cmd, concurrency);
        console.log(`\n✅ ${cmd} completed successfully (all stages)`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : (error?.toString() ?? '');
        console.error(`\n❌ ${cmd} failed (fail-fast mode stopped execution):`);
        console.error(errorMessage);
        process.exit(1);
    }
};

export { runCmdInStagesAcrossWorkspaces };
//# sourceMappingURL=run-cmd-in-stages.mjs.map
