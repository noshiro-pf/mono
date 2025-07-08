#!/usr/bin/env tsx

import { executeParallel } from './execute-parallel.mjs';
import { getWorkspacePackages } from './get-workspace-packages.mjs';

/**
 * Executes a npm script command across all workspace packages in parallel.
 * @param options - Configuration options for the parallel execution
 * @param options.rootPackageJsonDir - The directory containing the root package.json file
 * @param options.cmd - The npm script command to execute in each package
 * @param options.concurrency - Maximum number of packages to process simultaneously (default: 3)
 * @param options.filterWorkspacePattern - Optional function to filter packages by name
 * @returns A promise that resolves when all packages have completed execution
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

    await executeParallel(filteredPackages, cmd, concurrency);
    console.log(`\n✅ ${cmd} completed successfully`);
  } catch (err) {
    console.error(
      `\n❌ ${cmd} failed:`,
      err instanceof Error ? err.message : (err?.toString() ?? ''),
    );
    process.exit(1);
  }
};
