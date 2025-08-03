import { Result } from 'ts-data-forge';
import '../../node-global.mjs';
import { type Package } from './types.mjs';
/**
 * Executes a npm script across multiple packages in parallel with a concurrency
 * limit.
 *
 * @param packages - Array of Package objects to execute the script in
 * @param scriptName - The name of the npm script to execute
 * @param concurrency - Maximum number of packages to process simultaneously
 *   (default: 3)
 * @returns A promise that resolves to an array of execution results
 */
export declare const executeParallel: (packages: readonly Package[], scriptName: string, concurrency?: number) => Promise<readonly Result<Readonly<{
    code?: number;
    skipped?: boolean;
}>, Error>[]>;
/**
 * Executes a npm script across packages in dependency order stages. Packages
 * are grouped into stages where each stage contains packages whose dependencies
 * have been completed in previous stages.
 *
 * @param packages - Array of Package objects to execute the script in
 * @param scriptName - The name of the npm script to execute
 * @param concurrency - Maximum number of packages to process simultaneously
 *   within each stage (default: 3)
 * @returns A promise that resolves when all stages are complete
 */
export declare const executeStages: (packages: readonly Package[], scriptName: string, concurrency?: number) => Promise<void>;
//# sourceMappingURL=execute-parallel.d.mts.map