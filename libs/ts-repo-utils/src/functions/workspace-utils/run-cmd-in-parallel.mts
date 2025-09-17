#!/usr/bin/env tsx

import { executeParallel } from './execute-parallel.mjs';
import { getWorkspacePackages } from './get-workspace-packages.mjs';

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
export const runCmdInParallelAcrossWorkspaces = async ({
  rootPackageJsonDir,
  cmd,
  concurrency = 3,
  filterWorkspacePattern,
}: Readonly<{
  rootPackageJsonDir: string;
  cmd: string;
  concurrency?: number;
  filterWorkspacePattern?: (packageName: string) => boolean;
}>): Promise<void> => {
  try {
    const packages = await getWorkspacePackages(rootPackageJsonDir);

    const filteredPackages =
      filterWorkspacePattern === undefined
        ? packages
        : packages.filter((pkg) => filterWorkspacePattern(pkg.name));

    console.log(
      `\nStarting ${cmd} across ${filteredPackages.length} packages (fail-fast parallel mode)...`,
    );
    await executeParallel(filteredPackages, cmd, concurrency);
    console.log(`\n✅ ${cmd} completed successfully (all packages)`);
  } catch (error) {
    const errorMessage = Error.isError(error)
      ? error.message
      : (error?.toString() ?? '');
    console.error(`\n❌ ${cmd} failed (fail-fast mode stopped execution):`);
    console.error(errorMessage);
    process.exit(1);
  }
};
