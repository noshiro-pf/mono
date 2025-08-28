import '../../node-global.mjs';
import { type Package } from './types.mjs';
/**
 * Executes a npm script across multiple packages in parallel with a concurrency
 * limit. Uses fail-fast behavior - stops execution immediately when any package
 * fails.
 *
 * @param packages - Array of Package objects to execute the script in
 * @param scriptName - The name of the npm script to execute
 * @param concurrency - Maximum number of packages to process simultaneously
 *   (default: 3)
 * @returns A promise that resolves to an array of execution results, or rejects
 *   immediately on first failure
 */
export declare const executeParallel: (packages: readonly Package[], scriptName: string, concurrency?: number) => Promise<readonly Readonly<{
    code?: number;
    skipped?: boolean;
}>[]>;
/**
 * Executes a npm script across packages in dependency order stages. Packages
 * are grouped into stages where each stage contains packages whose dependencies
 * have been completed in previous stages. Uses fail-fast behavior - stops
 * execution immediately when any package fails.
 *
 * @param packages - Array of Package objects to execute the script in
 * @param scriptName - The name of the npm script to execute
 * @param concurrency - Maximum number of packages to process simultaneously
 *   within each stage (default: 3)
 * @returns A promise that resolves when all stages are complete, or rejects
 *   immediately on first failure
 */
export declare const executeStages: (packages: readonly Package[], scriptName: string, concurrency?: number) => Promise<void>;
//# sourceMappingURL=execute-parallel.d.mts.map