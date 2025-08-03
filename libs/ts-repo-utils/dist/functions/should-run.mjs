import { Result } from 'ts-data-forge';
import '../node-global.mjs';
import { getDiffFrom } from './diff.mjs';

/**
 * Checks if TypeScript type checks should run based on the diff from a base
 * branch. Skips type checks if all changed files match the ignored patterns.
 *
 * This function is typically used in CI/CD pipelines to determine whether
 * expensive type checking operations should be performed. If all changed files
 * are documentation, configuration, or other non-TypeScript files, type checks
 * can be safely skipped to improve build performance.
 *
 * @example
 *   ```typescript
 *   // Use default settings (compare against origin/main, ignore docs/md/txt files)
 *   await checkShouldRunTypeChecks();
 *
 *   // Custom ignore patterns
 *   await checkShouldRunTypeChecks({
 *     pathsIgnore: ['.eslintrc.json', 'docs/', '**.md', 'scripts/'],
 *   });
 *
 *   // Custom base branch
 *   await checkShouldRunTypeChecks({
 *     baseBranch: 'origin/develop',
 *   });
 *   ```;
 *
 * @example
 *   GitHub Actions usage
 *   ```yaml
 *   - name: Check if type checks should run
 *   id: check_diff
 *   run: npx check-should-run-type-checks
 *
 *   - name: Run type checks
 *   if: steps.check_diff.outputs.should_run == 'true'
 *   run: npm run type-check
 *   ```
 *
 * @param options - Configuration options
 * @param options.pathsIgnore - Array of patterns to ignore when determining if
 *   type checks should run. Supports three pattern types:
 *
 *   - **Exact file matches**: e.g., `.cspell.json` matches only that file
 *   - **Directory prefixes**: e.g., `docs/` matches any file in docs directory
 *   - **File extensions**: e.g., `**.md` matches any markdown file Defaults to:
 *       `['LICENSE', '.editorconfig', '.gitignore', '.cspell.json',
 *       '.markdownlint-cli2.mjs', '.npmignore', '.prettierignore',
 *       '.prettierrc', 'docs/', '**.md', '**.txt']`
 *
 * @param options.baseBranch - Base branch to compare against for determining
 *   changed files. Defaults to `'origin/main'`
 * @returns A promise that resolves when the check is complete. The function
 *   will set the GITHUB_OUTPUT environment variable with `should_run=true` or
 *   `should_run=false` if running in GitHub Actions environment.
 */
const checkShouldRunTypeChecks = async (options) => {
    const pathsIgnore = options?.pathsIgnore ?? [
        'LICENSE',
        '.editorconfig',
        '.gitignore',
        '.cspell.json',
        '.markdownlint-cli2.mjs',
        '.npmignore',
        '.prettierignore',
        '.prettierrc',
        'docs/',
        '**.md',
        '**.txt',
    ];
    const baseBranch = options?.baseBranch ?? 'origin/main';
    const GITHUB_OUTPUT = process.env['GITHUB_OUTPUT'];
    const files = await getDiffFrom(baseBranch);
    if (Result.isErr(files)) {
        console.error('Error getting diff:', files.value);
        process.exit(1);
    }
    const shouldRunTsChecks = !files.value.every((file) => pathsIgnore.some((pattern) => {
        // Exact file match
        if (pattern === file) {
            return true;
        }
        // Directory prefix match (pattern ends with '/')
        if (pattern.endsWith('/') && file.startsWith(pattern)) {
            return true;
        }
        // File extension pattern match (pattern starts with '**.')
        if (pattern.startsWith('**.')) {
            const extension = pattern.slice(2); // Remove '**'
            return path.basename(file).endsWith(extension);
        }
        return false;
    }));
    if (GITHUB_OUTPUT !== undefined) {
        await fs.appendFile(GITHUB_OUTPUT, `should_run=${shouldRunTsChecks}\n`);
    }
};

export { checkShouldRunTypeChecks };
//# sourceMappingURL=should-run.mjs.map
