#!/usr/bin/env tsx
import '../../node-global.mjs';
import { type Package } from './types.mjs';
/**
 * Retrieves all workspace packages from a monorepo based on the workspace
 * patterns defined in the root package.json file.
 *
 * @param rootPackageJsonDir - The directory containing the root package.json
 *   file
 * @returns A promise that resolves to an array of Package objects containing
 *   package metadata
 */
export declare const getWorkspacePackages: (rootPackageJsonDir: string) => Promise<readonly Package[]>;
//# sourceMappingURL=get-workspace-packages.d.mts.map