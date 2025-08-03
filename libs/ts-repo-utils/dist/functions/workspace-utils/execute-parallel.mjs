import { spawn } from 'child_process';
import { pipe, createPromise, isRecord, hasKey, Result, isNotUndefined } from 'ts-data-forge';
import '../../node-global.mjs';

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
const executeParallel = async (packages, scriptName, concurrency = 3) => {
    const mut_resultPromises = [];
    const mut_executing = new Set();
    for (const pkg of packages) {
        const promise = executeScript(pkg, scriptName);
        mut_resultPromises.push(promise);
        const wrappedPromise = promise.finally(() => {
            mut_executing.delete(wrappedPromise);
        });
        mut_executing.add(wrappedPromise);
        // If we reach concurrency limit, wait for one to finish
        if (mut_executing.size >= concurrency) {
            // eslint-disable-next-line no-await-in-loop
            await Promise.race(mut_executing);
        }
    }
    return Promise.all(mut_resultPromises);
};
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
const executeStages = async (packages, scriptName, concurrency = 3) => {
    const dependencyGraph = buildDependencyGraph(packages);
    const sorted = topologicalSortPackages(packages, dependencyGraph);
    const mut_stages = [];
    const mut_completed = new Set();
    while (mut_completed.size < sorted.length) {
        const mut_stage = [];
        for (const pkg of sorted) {
            if (mut_completed.has(pkg.name))
                continue;
            const deps = dependencyGraph.get(pkg.name) ?? [];
            const depsCompleted = deps.every((dep) => mut_completed.has(dep));
            if (depsCompleted) {
                mut_stage.push(pkg);
            }
        }
        if (mut_stage.length === 0) {
            throw new Error('Circular dependency detected');
        }
        mut_stages.push(mut_stage);
        for (const pkg of mut_stage) {
            mut_completed.add(pkg.name);
        }
    }
    console.log(`\nExecuting ${scriptName} in ${mut_stages.length} stages...\n`);
    for (const [i, stage] of mut_stages.entries()) {
        if (stage.length > 0) {
            console.log(`Stage ${i + 1}: ${stage.map((p) => p.name).join(', ')}`);
            // eslint-disable-next-line no-await-in-loop
            await executeParallel(stage, scriptName, concurrency);
        }
    }
};
/**
 * Executes a npm script in a specific package directory.
 *
 * @param pkg - The package object containing path and metadata
 * @param scriptName - The name of the npm script to execute
 * @param options - Configuration options
 * @param options.prefix - Whether to prefix output with package name (default:
 *   true)
 * @returns A promise that resolves to execution result with exit code or
 *   skipped flag
 */
const executeScript = (pkg, scriptName, { prefix = true } = {}) => pipe(createPromise((resolve, reject) => {
    const packageJsonScripts = isRecord(pkg.packageJson) && isRecord(pkg.packageJson['scripts'])
        ? pkg.packageJson['scripts']
        : {};
    const hasScript = hasKey(packageJsonScripts, scriptName);
    if (!hasScript) {
        resolve({ skipped: true });
        return;
    }
    const prefixStr = prefix ? `[${pkg.name}] ` : '';
    const proc = spawn('npm', ['run', scriptName], {
        cwd: pkg.path,
        shell: true,
        stdio: 'pipe',
    });
    proc.stdout.on('data', (data) => {
        process.stdout.write(prefixStr + data.toString());
    });
    proc.stderr.on('data', (data) => {
        process.stderr.write(prefixStr + data.toString());
    });
    proc.on('close', (code) => {
        if (code === 0) {
            resolve({ code });
        }
        else {
            reject(new Error(`${pkg.name} exited with code ${code}`));
        }
    });
    proc.on('error', reject);
})).map((result) => result.then(Result.mapErr((err) => {
    const errorMessage = err instanceof Error
        ? err.message
        : isRecord(err) && hasKey(err, 'message')
            ? (err.message?.toString() ?? 'Unknown error message')
            : 'Unknown error';
    console.error(`\nError in ${pkg.name}:`, errorMessage);
    return err instanceof Error ? err : new Error(errorMessage);
}))).value;
/**
 * Performs a topological sort on packages based on their dependencies, ensuring
 * dependencies are ordered before their dependents.
 *
 * @param packages - Array of Package objects to sort
 * @returns An array of packages in dependency order (dependencies first)
 */
const topologicalSortPackages = (packages, dependencyGraph) => {
    const mut_visited = new Set();
    const mut_result = [];
    const packageMap = new Map(packages.map((p) => [p.name, p]));
    const visit = (pkgName) => {
        if (mut_visited.has(pkgName))
            return;
        mut_visited.add(pkgName);
        const deps = dependencyGraph.get(pkgName) ?? [];
        for (const dep of deps) {
            visit(dep);
        }
        mut_result.push(pkgName);
    };
    for (const pkg of packages) {
        visit(pkg.name);
    }
    return mut_result
        .map((pkgName) => packageMap.get(pkgName))
        .filter(isNotUndefined);
};
/**
 * Builds a dependency graph from the given packages, mapping each package name
 * to its internal workspace dependencies.
 *
 * @param packages - Array of Package objects to analyze
 * @returns A readonly map where keys are package names and values are arrays of
 *   their dependency package names
 */
const buildDependencyGraph = (packages) => {
    const packageMap = new Map(packages.map((p) => [p.name, p]));
    const mut_graph = new Map();
    for (const pkg of packages) {
        const deps = Object.keys(pkg.dependencies).filter((depName) => packageMap.has(depName));
        mut_graph.set(pkg.name, deps);
    }
    return mut_graph;
};

export { executeParallel, executeStages };
//# sourceMappingURL=execute-parallel.mjs.map
