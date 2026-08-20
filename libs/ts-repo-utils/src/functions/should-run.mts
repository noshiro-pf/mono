import micromatch from 'micromatch';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { castMutable, Result } from 'ts-data-forge';
import { getDiffFrom, getGitRoot } from './diff.mjs';

/**
 * Checks whether a CI step should run, based on which files differ from a base
 * branch. Reports `false` when every changed file matches one of the ignored
 * patterns.
 *
 * This is the general form of {@link checkShouldRunTypeChecks}: it carries no
 * default ignore list, so the caller states exactly which paths are irrelevant
 * to the step being gated.
 *
 * Prefer gating the individual steps of a workflow with this over a
 * `paths-ignore` trigger filter: a workflow that a path filter skips never
 * reports a status check, so a pull request that changed only the filtered
 * paths waits forever on a required check that will never arrive.
 *
 * @example
 *   ```typescript
 *   // Skip when the diff only touches a directory nothing checks
 *   await checkShouldRun({ pathsIgnore: ['experimental/'] });
 *
 *   // Custom base branch
 *   await checkShouldRun({
 *     pathsIgnore: ['docs/', '**.md'],
 *     baseBranch: 'origin/develop',
 *   });
 *   ```;
 *
 * @example
 *   GitHub Actions usage
 *   ```yaml
 *   - name: Check diff
 *   id: check_diff
 *   run: npm exec -- check-should-run --paths-ignore 'experimental/'
 *
 *   - name: Run the checks
 *   if: steps.check_diff.outputs.should_run == 'true'
 *   run: npm run check
 *   ```
 *
 * @param options - Configuration options
 * @param options.pathsIgnore - Patterns whose files do not affect the step.
 *   Matched with micromatch (with `dot: true`) against paths relative to the
 *   repository root, with one shorthand: a pattern ending with `/` is a
 *   directory prefix, so `docs/` is `docs/**`. Exact file names
 *   (`.editorconfig`) and ordinary globs (`**.md`, `docs/**`) both work.
 *   Defaults to `[]`, which ignores nothing.
 * @param options.baseBranch - Base branch to compare against for determining
 *   changed files. Defaults to `'origin/main'`
 * @returns Whether the step should run. An empty diff reads as "nothing
 *   changed" and so returns `false`. When running in GitHub Actions, also
 *   appends `should_run=true` or `should_run=false` to the file named by the
 *   `GITHUB_OUTPUT` environment variable.
 */
export const checkShouldRun = async (
  options?: Readonly<{
    pathsIgnore?: readonly string[];
    baseBranch?: string;
  }>,
): Promise<boolean> => {
  const pathsIgnore = options?.pathsIgnore ?? [];

  const baseBranch = options?.baseBranch ?? 'origin/main';

  const GITHUB_OUTPUT = process.env['GITHUB_OUTPUT'];

  const gitRoot = await getGitRoot();

  if (Result.isErr(gitRoot)) {
    console.error('Error getting the git root:', gitRoot.value);

    process.exit(1);
  }

  const files = await getDiffFrom(baseBranch);

  if (Result.isErr(files)) {
    console.error('Error getting diff:', files.value);

    process.exit(1);
  }

  // `getDiffFrom` returns absolute paths, while the patterns are written
  // relative to the repository root.
  const changedFiles = files.value.map((file) =>
    path.relative(gitRoot.value, file).split(path.sep).join('/'),
  );

  const patterns = pathsIgnore.map(toMatchPattern);

  const shouldRun: boolean = changedFiles.some(
    (file) => !micromatch.isMatch(file, castMutable(patterns), { dot: true }),
  );

  if (GITHUB_OUTPUT !== undefined) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.appendFile(GITHUB_OUTPUT, `should_run=${shouldRun}\n`);
  }

  return shouldRun;
};

/**
 * Checks if TypeScript type checks should run based on the diff from a base
 * branch. Skips type checks if all changed files match the ignored patterns.
 *
 * This is {@link checkShouldRun} with an ignore list of the files that a
 * TypeScript project typically has but never type-checks — documentation,
 * tooling configuration, license text. Pass `pathsIgnore` to replace that list,
 * or call {@link checkShouldRun} directly for a step that is not a type check.
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
 *   run: npm exec check-should-run-type-checks
 *
 *   - name: Run type checks
 *   if: steps.check_diff.outputs.should_run == 'true'
 *   run: npm run type-check
 *   ```
 *
 * @param options - Configuration options
 * @param options.pathsIgnore - Array of patterns to ignore when determining if
 *   type checks should run. Matched as described in {@link checkShouldRun}:
 *
 *   - **Exact file matches**: e.g., `.cspell.config.yaml` matches only that file
 *   - **Directory prefixes**: e.g., `docs/` matches any file in docs directory
 *   - **File extensions**: e.g., `**.md` matches any markdown file Defaults to:
 *       `['LICENSE', '.editorconfig', '.gitignore', '.cspell.json', '.cspell.config.yaml',
 *       '.markdownlint-cli2.mjs', '.npmignore', '.prettierignore',
 *       '.prettierrc', 'docs/', '**.md', '**.txt']`
 *
 * @param options.baseBranch - Base branch to compare against for determining
 *   changed files. Defaults to `'origin/main'`
 * @returns A promise that resolves when the check is complete. The function
 *   will set the GITHUB_OUTPUT environment variable with `should_run=true` or
 *   `should_run=false` if running in GitHub Actions environment.
 */
export const checkShouldRunTypeChecks = async (
  options?: Readonly<{
    pathsIgnore?: readonly string[];
    baseBranch?: string;
  }>,
): Promise<boolean> =>
  checkShouldRun({
    pathsIgnore: options?.pathsIgnore ?? defaultTypeCheckPathsIgnore,
    baseBranch: options?.baseBranch,
  });

const defaultTypeCheckPathsIgnore = [
  'LICENSE',
  '.editorconfig',
  '.gitignore',
  '.cspell.json',
  '.cspell.config.yaml',
  '.markdownlint-cli2.mjs',
  '.npmignore',
  '.prettierignore',
  '.prettierrc',
  'docs/',
  '**.md',
  '**.txt',
] as const;

/**
 * Expands the trailing-slash shorthand for a directory into the glob
 * micromatch needs. Every other pattern is already one.
 */
const toMatchPattern = (pattern: string): string =>
  pattern.endsWith('/') ? (`${pattern}**` as const) : pattern;
