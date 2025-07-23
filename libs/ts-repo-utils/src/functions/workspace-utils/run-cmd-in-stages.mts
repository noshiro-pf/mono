#!/usr/bin/env tsx

import { executeStages } from './execute-parallel.mjs';
import { getWorkspacePackages } from './get-workspace-packages.mjs';

/**
 * Executes a npm script command across all workspace packages in dependency order stages.
 * Packages are grouped into stages where each stage contains packages whose
 * dependencies have been completed in previous stages.
 * @param options - Configuration options for the staged execution
 * @param options.rootPackageJsonDir - The directory containing the root package.json file
 * @param options.cmd - The npm script command to execute in each package
 * @param options.concurrency - Maximum number of packages to process simultaneously within each stage (default: 3)
 * @param options.filterWorkspacePattern - Optional function to filter packages by name
 * @returns A promise that resolves when all stages have completed execution
 */
export const runCmdInStagesAcrossWorkspaces = async ({
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

    await executeStages(filteredPackages, cmd, concurrency);
    console.log(`\n✅ ${cmd} completed successfully`);
  } catch (error) {
    console.error(
      `\n❌ ${cmd} failed:`,
      error instanceof Error ? error.message : (error?.toString() ?? ''),
    );
    process.exit(1);
  }
};
