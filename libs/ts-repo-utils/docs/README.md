**ts-repo-utils**

***

# ts-repo-utils

[![npm version](https://img.shields.io/npm/v/ts-repo-utils.svg)](https://www.npmjs.com/package/ts-repo-utils)
[![npm downloads](https://img.shields.io/npm/dm/ts-repo-utils.svg)](https://www.npmjs.com/package/ts-repo-utils)
[![License](https://img.shields.io/npm/l/ts-repo-utils.svg)](./LICENSE)
[![codecov](https://codecov.io/gh/noshiro-pf/ts-repo-utils/graph/badge.svg?token=S4688Q0CX3)](https://codecov.io/gh/noshiro-pf/ts-repo-utils)

Utilities for TypeScript Repositories.

A comprehensive toolkit for managing TypeScript projects with strict ESM support, providing essential utilities for file validation, code formatting, git operations, and project automation.

## Installation

```bash
npm add --save-dev ts-repo-utils
```

```bash
yarn add --dev ts-repo-utils
```

```bash
pnpm add --save-dev ts-repo-utils
```

## CLI Commands

`ts-repo-utils` provides several CLI commands that can be used directly or through npm scripts.

### `assert-repo-is-clean`

Checks if the repository is clean (i.e., there are no uncommitted changes, untracked files, or staged files) and exits with code 1 if any are present.

```bash
# Basic usage
npm exec -- assert-repo-is-clean

# Silent mode
npm exec -- assert-repo-is-clean --silent
```

```yaml
# Example in GitHub Actions
- name: Format check
  run: npm run fmt
- name: Check if there is no file diff
  run: npm exec -- assert-repo-is-clean
```

**Options:**

- `--silent` - Suppress output messages (optional)

### `format-uncommitted`

Formats only untracked/modified files using Prettier.

```bash
# Basic usage
npm exec -- format-uncommitted

# Silent mode
npm exec -- format-uncommitted --silent
```

**Options:**

- `--exclude-untracked` - Exclude untracked files (default: false)
- `--exclude-modified` - Exclude modified files (default: false)
- `--exclude-staged` - Exclude staged files (default: false)
- `--silent` - Suppress output messages (default: false)
- `--ignore-unknown` - Skip files without a Prettier parser instead of erroring (default: true)

### `format-diff-from`

Formats only files that differ from the specified base branch or commit.

```bash
# Format files different from main branch
npm exec -- format-diff-from main

# Format files different from origin/main
npm exec -- format-diff-from origin/main

# Exclude untracked files
npm exec -- format-diff-from main --exclude-untracked

# Silent mode
npm exec -- format-diff-from main --silent
```

Example in npm scripts:

```json
{
    "scripts": {
        "fmt": "npm exec -- format-diff-from origin/main"
    }
}
```

**Options:**

- `<base>` - Base branch name or commit hash to compare against (required)
- `--exclude-untracked` - Exclude untracked files (default: false)
- `--exclude-modified` - Exclude modified files (default: false)
- `--exclude-staged` - Exclude staged files (default: false)
- `--silent` - Suppress output messages (default: false)
- `--ignore-unknown` - Skip files without a Prettier parser instead of erroring (default: true)

### `gen-index-ts`

Generates index.ts files recursively in target directories with automatic barrel exports.

```bash
# Basic usage with required options
npm exec -- gen-index-ts ./src --target-ext .mts --index-ext .mts --export-ext .mjs

# With formatting command
npm exec -- gen-index-ts ./src --target-ext .mts --index-ext .mts --export-ext .mjs --fmt 'npm run fmt'

# Multiple target extensions
npm exec -- gen-index-ts ./src --target-ext .mts --target-ext .tsx --index-ext .mts --export-ext .mjs

# With exclude patterns
npm exec -- gen-index-ts ./src --target-ext .ts --index-ext .ts --export-ext .js --exclude '*.test.ts' --exclude '*.spec.ts'

# Example in npm scripts
"gi": "gen-index-ts ./src --index-ext .mts --export-ext .mjs --target-ext .mts --target-ext .tsx --fmt 'npm run fmt'"
```

**Features:**

- Creates barrel exports for all subdirectories
- Supports complex glob exclusion patterns (using micromatch)
- Automatically formats generated files using the project's Prettier config
- Works with both single directories and directory arrays
- Respects source and export extension configuration

**Benefits:**

- Prevents forgetting to export modules
- TypeScript can detect duplicate variables, type names, etc.

**Options:**

- `<target-directory>` - Directory where the index file will be generated (comma-separated list can be used)
- `--target-ext` - File extensions to include in the index file (required, can be specified multiple times)
- `--index-ext` - Extension of the index file to be generated (required)
- `--export-ext` - Extension of the export statements in the index file (required, or 'none')
- `--exclude` - Glob patterns of files to exclude (optional, can be specified multiple times)
- `--fmt` - Command to format after generating the index file (optional)
- `--silent` - Suppress output messages (optional)

### `check-should-run-type-checks`

Checks whether TypeScript type checks should run based on file changes from the base branch. Optimizes CI/CD pipelines by skipping type checks when only non-TypeScript files have changed. The determination of "non-TypeScript files" is based on configurable ignore patterns, which can be specified using the `--paths-ignore` option.

```bash
# Basic usage (compares against origin/main)
npm exec -- check-should-run-type-checks

# Custom base branch
npm exec -- check-should-run-type-checks --base-branch origin/develop

# Custom ignore patterns
npm exec -- check-should-run-type-checks \
  --paths-ignore '.github/' \
  --paths-ignore 'docs/' \
  --paths-ignore '**.md' \
  --paths-ignore '**.yml'
```

```yaml
# Example in GitHub Actions
- name: Check if type checks should run
  id: check_diff
  run: npm exec -- check-should-run-type-checks

- name: Run type checks
  if: steps.check_diff.outputs.should_run == 'true'
  run: npm run type-check
```

**Options:**

- `--paths-ignore` - Patterns to ignore when checking if type checks should run (optional, can be specified multiple times)
    - Supports exact file matches: `.cspell.json`
    - Directory prefixes: `docs/` (matches any file in docs directory)
    - File extensions: `**.md` (matches any markdown file)
    - Default: `['LICENSE', '.editorconfig', '.gitignore', '.cspell.json', '.markdownlint-cli2.mjs', '.npmignore', '.prettierignore', '.prettierrc', 'docs/', '**.md', '**.txt']`
- `--base-branch` - Base branch to compare against for determining changed files (default: `origin/main`)

**GitHub Actions Integration:**

When running in GitHub Actions, the command sets the `GITHUB_OUTPUT` environment variable with `should_run=true` or `should_run=false`, which can be used in subsequent steps.

## API Reference

### Command Execution

#### `$(command: string, options?: ExecOptions): Promise<ExecResult>`

Executes a shell command asynchronously with type-safe results.

```typescript
import { $, Result } from 'ts-repo-utils';

// or
// import "ts-repo-utils"; // $ and Result are globally defined in ts-repo-utils

const result = await $('npm test');

if (Result.isOk(result)) {
    console.log('Tests passed:', result.value.stdout);
} else {
    console.error('Tests failed:', result.value.message);
}
```

**Options:**

- `silent?: boolean` - Don't log command/output (default: false)
- `'node:child_process'` `exec` function options

**Return Type:**

```typescript
type Ret = Promise<
    Result<
        Readonly<{ stdout: string | Buffer; stderr: string | Buffer }>,
        import('node:child_process').ExecException
    >
>;
```

### Script Execution Utilities

#### `isDirectlyExecuted(fileUrl: string): boolean`

Determines whether a script is being executed directly via CLI or imported as a module. This is useful for creating scripts that can both be imported as libraries and executed directly.

```typescript
import { isDirectlyExecuted } from 'ts-repo-utils';

// or
// import "ts-repo-utils"; // isDirectlyExecuted is globally defined in ts-repo-utils

// calculator.mjs
export const add = (a: number, b: number): number => a + b;
export const multiply = (a: number, b: number): number => a * b;

// Only run main logic when executed directly: node calculator.mjs (or tsx calculator.mts)
// When imported elsewhere, only the functions are available
if (isDirectlyExecuted(import.meta.url)) {
    console.log('Calculator CLI');
    console.log('2 + 3 =', add(2, 3));
    console.log('4 × 5 =', multiply(4, 5));
}
```

When executed directly (`node calculator.mjs`), it runs the main function and prints the results. When imported (`import { add } from './calculator.mjs'`), it only provides the functions without executing the main logic.

NOTE: If you use [tsx](https://www.npmjs.com/package/tsx) or [ts-node](https://www.npmjs.com/package/ts-node), run your scripts with the extension `.(m)ts` instead of `.(m)js` so that `isDirectlyExecuted` can correctly determine if the script is executed directly.

**Use Cases:**

- Creating CLI tools that can also be used as libraries
- Preventing automatic execution when a file is imported
- Running initialization code only during direct execution

### Path and File System Utilities

#### `pathExists(filePath: string): Promise<boolean>`

Checks if a file or directory exists at the specified path.

```typescript
import { pathExists } from 'ts-repo-utils';

const exists = await pathExists('./src/index.ts');
console.log(exists satisfies boolean); // true or false
```

#### `assertPathExists(filePath: string, description?: string): Promise<void>`

Validates that a path exists and exits with code 1 if it doesn't.

```typescript
import { assertPathExists } from 'ts-repo-utils';

// If the file doesn't exist, this will exit the process with code 1
await assertPathExists('./src/index.ts', 'Entry point file');
```

#### `assertExt(config: CheckExtConfig): Promise<void>`

Validates that all files in specified directories have the correct extensions. Exits with code 1 if any files have incorrect extensions.

```typescript
import { assertExt } from 'ts-repo-utils';

await assertExt({
    directories: [
        {
            path: './src',
            extension: '.ts',
            ignorePatterns: ['*.d.ts', '*.test.ts'],
        },
        {
            path: './scripts',
            extension: '.mjs',
        },
    ],
});
```

**Configuration Type:**

```typescript
type CheckExtConfig = Readonly<{
    directories: readonly Readonly<{
        path: string; // Directory path to check
        extension: string; // Expected file extension (including the dot)
        ignorePatterns?: readonly string[]; // Optional glob patterns to ignore
    }>[];
}>;
```

### Git Repository Utilities

#### `repoIsDirty(): Promise<boolean>`

Checks if the repository has uncommitted changes.

```typescript
import { repoIsDirty } from 'ts-repo-utils';

const isDirty = await repoIsDirty();
if (isDirty) {
    console.log('Repository has uncommitted changes');
}
```

#### `assertRepoIsClean(): Promise<void>`

Checks if the repository is clean and exits with code 1 if it has uncommitted changes (shows changes and diff).
(Function version of the `assert-repo-is-clean` command)

```typescript
import { assertRepoIsClean } from 'ts-repo-utils';

// Use in CI/build scripts to ensure clean state
await assertRepoIsClean();
```

**Options:**

- `silent?` - Suppress output messages (default: false)

#### Getting Git diff files

##### `getUntrackedFiles(options?)`

Gets untracked files from the working tree (files not added to git).  
Runs `git ls-files --others --exclude-standard [--deleted]`

##### `getModifiedFiles(options?)`

Gets modified files from the working tree (files that have been changed but not staged).  
Runs `git diff --name-only [--diff-filter=d]`

##### `getStagedFiles(options?)`

Gets files that are staged for commit (files added with git add).  
Runs `git diff --staged --name-only [--diff-filter=d]`

##### `getDiffFrom(base: string, options?)`

Gets files that differ from the specified base branch or commit.  
Runs `git diff --name-only <base> [--diff-filter=d]`

**Common options:**

- `excludeDeleted?: boolean` - Exclude deleted files (for formatters etc.) (default: true)
- `silent?: boolean` - Don't log command/output (default: false)

**Common Return Type:**

```typescript
type Ret = Result<
    readonly string[],
    import('node:child_process').ExecException | Readonly<{ message: string }>
>;
```

#### Build Optimization Utilities

##### `checkShouldRunTypeChecks(options?): Promise<boolean>`

Checks whether TypeScript type checks should run based on file changes from the base branch. Optimizes CI/CD pipelines by skipping type checks when only non-TypeScript files have changed.
(Function version of the `check-should-run-type-checks` command)

```typescript
import { checkShouldRunTypeChecks } from 'ts-repo-utils';

// Use default settings (compare against origin/main)
const shouldRun = await checkShouldRunTypeChecks();

if (shouldRun) {
    await $('npm run type-check');
}

// Custom ignore patterns and base branch
const shouldRun2 = await checkShouldRunTypeChecks({
    pathsIgnore: ['.eslintrc.json', 'docs/', '**.md', 'scripts/'],
    baseBranch: 'origin/develop',
});
```

**Options:**

- `pathsIgnore?` - Patterns to ignore when checking if type checks should run:
    - Exact file matches: `.cspell.json`
    - Directory prefixes: `docs/` (matches any file in docs directory)
    - File extensions: `**.md` (matches any markdown file)
    - Default: `['LICENSE', '.editorconfig', '.gitignore', '.cspell.json', '.markdownlint-cli2.mjs', '.npmignore', '.prettierignore', '.prettierrc', 'docs/', '**.md', '**.txt']`
- `baseBranch?` - Base branch to compare against (default: `origin/main`)

### Code Formatting Utilities

#### `formatFilesGlob(pathGlob: string, options?): Promise<Result<undefined, unknown>>`

Formats files matching a glob pattern using Prettier.

```typescript
import { formatFilesGlob } from 'ts-repo-utils';

// Format all TypeScript files in src
await formatFilesGlob('src/**/*.ts');

// Format specific files
await formatFilesGlob('src/{index,utils}.ts');

// With custom ignore function
await formatFilesGlob('src/**/*.ts', {
    ignore: (filePath) => filePath.includes('generated'),
    ignoreUnknown: false, // Error on files without parser
});
```

**Options:**

- `silent?` - Suppress output messages (default: false)
- `ignoreUnknown?` - Skip files without a Prettier parser instead of erroring (default: true)
- `ignore?` - Custom function to ignore files (default: built-in ignore list)

#### `formatUncommittedFiles(options?): Promise<Result>`

Formats only files that have been changed according to git status.
(Function version of the `format-uncommitted` command)

```typescript
import { formatUncommittedFiles } from 'ts-repo-utils';

// Format only modified files
await formatUncommittedFiles();

// With custom options
await formatUncommittedFiles({
    untracked: false, // Skip untracked files
    ignore: (filePath) => filePath.includes('test'),
});
```

**Options:**

- `untracked?` - Format untracked files (default: true)
- `modified?` - Format modified files (default: true)
- `staged?` - Format staged files (default: true)
- `silent?` - Suppress output messages (default: false)
- `ignoreUnknown?` - Skip files without a Prettier parser instead of erroring (default: true)
- `ignore?` - Custom function to ignore files (default: built-in ignore list)

**Return Type:**

```typescript
type Ret = Promise<
    Result<
        undefined,
        | import('node:child_process').ExecException
        | Readonly<{ message: string }>
        | readonly unknown[]
    >
>;
```

#### `formatDiffFrom(base: string, options?): Promise<Result>`

Formats only files that differ from the specified base branch or commit.
(Function version of the `format-diff-from` command)

```typescript
import { formatDiffFrom } from 'ts-repo-utils';

// Format files different from main branch
await formatDiffFrom('main');

// Format files different from specific commit
await formatDiffFrom('abc123');

// With custom options
await formatDiffFrom('main', {
    includeUntracked: false,
    ignore: (filePath) => filePath.includes('vendor'),
    ignoreUnknown: false, // Error on files without parser
});
```

**Options:**

- `includeUntracked?` - Include untracked files in addition to diff files (default: true)
- `includeModified?` - Include modified files in addition to diff files (default: true)
- `includeStaged?` - Include staged files in addition to diff files (default: true)
- `silent?` - Suppress output messages (default: false)
- `ignoreUnknown?` - Skip files without a Prettier parser instead of erroring (default: true)
- `ignore?` - Custom function to ignore files (default: built-in ignore list)

**Return Type:**

```typescript
type Ret = Promise<
    Result<
        undefined,
        | import('node:child_process').ExecException
        | Readonly<{ message: string }>
        | readonly unknown[]
    >
>;
```

### Index File Generation

#### `genIndex(config: GenIndexConfig): Promise<Result<undefined, unknown>>`

Generates index files recursively in target directories with automatic barrel exports.
(Function version of the `gen-index-ts` command)

```typescript
import { genIndex } from 'ts-repo-utils';

await genIndex({
    targetDirectory: './src',
    exclude: ['*.test.ts', '*.spec.ts'],
});
```

**Configuration Type:**

```typescript
type GenIndexConfig = Readonly<{
    /** Target directories to generate index files for (string or array of strings) */
    targetDirectory: string | readonly string[];

    /**
     * Glob patterns for files or predicate function to exclude from exports
     * (default: excludes `'**\/*.{test,spec}.?(c|m)[jt]s?(x)'` and
     * `'**\/*.d.?(c|m)ts'`)
     */
    exclude?:
        | readonly string[]
        | ((
              args: Readonly<{
                  absolutePath: string;
                  relativePath: string;
                  fileName: string;
              }>,
          ) => boolean);

    /**
     * File extensions of source files to include in exports (default: ['.ts',
     * '.tsx'])
     */
    targetExtensions?: readonly `.${string}`[];

    /** File extension of index files to generate (default: '.ts') */
    indexFileExtension?: `.${string}`;

    /** File extension to use in export statements (default: '.js') */
    exportStatementExtension?: `.${string}` | 'none';

    /** Command to run for formatting generated files (optional) */
    formatCommand?: string;

    /** Whether to suppress output during execution (default: false) */
    silent?: boolean;
}>;
```

**Features:**

- Creates barrel exports for all subdirectories
- Supports complex glob exclusion patterns (using micromatch)
- Automatically formats generated files using the project's Prettier config
- Works with both single directories and directory arrays
- Respects source and export extension configuration

**Benefits:**

- Prevents forgetting to export modules
- TypeScript can detect duplicate variables, type names, etc.

### Monorepo Workspace Management Utilities

#### `runCmdInStagesAcrossWorkspaces(options): Promise<void>`

Executes an npm script command across all workspace packages in dependency order stages. Packages are grouped into stages where each stage contains packages whose dependencies have been completed in previous stages. Uses fail-fast behavior.

```typescript
import { runCmdInStagesAcrossWorkspaces } from 'ts-repo-utils';

// Run build in dependency order
await runCmdInStagesAcrossWorkspaces({
    rootPackageJsonDir: '../',
    cmd: 'build',
    concurrency: 3,
    filterWorkspacePattern: (name) => !name.includes('experimental'),
});
```

**Options:**

- `rootPackageJsonDir` - Directory containing the root package.json file
- `cmd` - The npm script command to execute in each package
- `concurrency?` - Maximum packages to process simultaneously within each stage (default: 3)
- `filterWorkspacePattern?` - Optional function to filter packages by name

#### `runCmdInParallelAcrossWorkspaces(options): Promise<void>`

Executes an npm script command across all workspace packages in parallel. Uses fail-fast behavior - stops execution immediately when any package fails.

```typescript
import { runCmdInParallelAcrossWorkspaces } from 'ts-repo-utils';

// Run tests in parallel across all packages
await runCmdInParallelAcrossWorkspaces({
    rootPackageJsonDir: '../',
    cmd: 'test',
    concurrency: 5,
    filterWorkspacePattern: (name) => !name.includes('experimental'),
});
```

**Options:**

- `rootPackageJsonDir` - Directory containing the root package.json file
- `cmd` - The npm script command to execute in each package
- `concurrency?` - Maximum packages to process simultaneously (default: 3)
- `filterWorkspacePattern?` - Optional function to filter packages by name

#### `getWorkspacePackages(rootPackageJsonDir): Promise<readonly Package[]>`

Retrieves all workspace packages from a monorepo based on the workspace patterns defined in the root package.json file.

```typescript
import { getWorkspacePackages } from 'ts-repo-utils';

const packages = await getWorkspacePackages('.');
console.log(packages.map((pkg) => pkg.name));
// ['@myorg/package-a', '@myorg/package-b', ...]
```

**Return Type:**

```typescript
type Package = Readonly<{
    name: string;
    path: string;
    packageJson: JsonValue;
    dependencies: Readonly<Record<string, string>>;
}>;
```

#### `executeParallel(packages, scriptName, concurrency?): Promise<readonly Result[]>`

Executes an npm script across multiple packages in parallel with a concurrency limit. Lower-level function used by `runCmdInParallelAcrossWorkspaces`.

```typescript
import { executeParallel, getWorkspacePackages } from 'ts-repo-utils';

const packages = await getWorkspacePackages('.');
await executeParallel(packages, 'lint', 4);
```

#### `executeStages(packages, scriptName, concurrency?): Promise<void>`

Executes an npm script across packages in dependency order stages. Lower-level function used by `runCmdInStagesAcrossWorkspaces`.

```typescript
import { executeStages, getWorkspacePackages } from 'ts-repo-utils';

const packages = await getWorkspacePackages('.');
await executeStages(packages, 'build', 3);
```

**Features:**

- Automatic dependency graph construction
- Topological sorting for correct build order
- Parallel execution within each stage
- Fail-fast behavior on errors
- Circular dependency detection

### Globals

When you import `ts-repo-utils` without destructuring, several utilities become globally available. This is useful for scripts where you want quick access to common functions without explicit imports.

```typescript
import 'ts-repo-utils';

// Now these functions are globally available

const result = await $('npm test');
if (Result.isErr(result)) {
    console.error(result.value);
}

echo('Building project...');

const filePath: string = path.join('src', 'index.ts');

const configJson: string = await fs.readFile('./config.json', {
    encoding: 'utf8',
});

const files: readonly string[] = await glob('**/*.ts');

if (isDirectlyExecuted(import.meta.url)) {
    echo('Running as CLI');
}
```

- `$` - The command execution utility described above.
- `Result` - A utility for Result pattern (from [ts-data-forge](https://github.com/noshiro-pf/ts-data-forge#readme))
- `echo` - Equivalent to `console.log`
- `path` - `node:path`
- `fs` - `node:fs/promises`
- `glob` - `fast-glob`
- `isDirectlyExecuted` - The script execution utility described above.

## Common Patterns

### Pre-commit Hook

```typescript
import {
    assertExt,
    assertRepoIsClean,
    formatUncommittedFiles,
} from 'ts-repo-utils';

// Validate file extensions
await assertExt({
    directories: [{ path: './src', extension: '.ts' }],
});

// Format changed files
await formatUncommittedFiles();

// Ensure repository is clean (exits if dirty)
await assertRepoIsClean();
```

### Build Pipeline

```typescript
import { formatFilesGlob, genIndex } from 'ts-repo-utils';

// Generate barrel exports
await genIndex({ targetDirectory: './src' });

// Type check
await $('tsc --noEmit');

// Build
await $('rollup -c');

// Format output
await formatFilesGlob('dist/**/*.js');
```

### Project Validation

```typescript
import { assertExt, assertPathExists, assertRepoIsClean } from 'ts-repo-utils';

// Check required files exist (exits with code 1 if files don't exist)
await assertPathExists('./package.json', 'Package manifest');
await assertPathExists('./tsconfig.json', 'TypeScript config');

// Validate extensions
await assertExt({
    directories: [
        { path: './src', extension: '.ts' },
        { path: './scripts', extension: '.mjs' },
    ],
});

// Verify clean repository state (exits with code 1 if repo is dirty)
await assertRepoIsClean();
```

## License

Apache-2.0

## Modules

- [cmd/assert-repo-is-clean](cmd/assert-repo-is-clean.md)
- [cmd/check-should-run-type-checks](cmd/check-should-run-type-checks.md)
- [cmd/format-diff-from](cmd/format-diff-from.md)
- [cmd/format-uncommitted](cmd/format-uncommitted.md)
- [cmd/gen-index-ts](cmd/gen-index-ts.md)
- [functions](functions.md)
- [functions/assert-ext](functions/assert-ext.md)
- [functions/assert-path-exists](functions/assert-path-exists.md)
- [functions/assert-repo-is-clean](functions/assert-repo-is-clean.md)
- [functions/diff](functions/diff.md)
- [functions/exec-async](functions/exec-async.md)
- [functions/format](functions/format.md)
- [functions/gen-index](functions/gen-index.md)
- [functions/is-directly-executed](functions/is-directly-executed.md)
- [functions/should-run](functions/should-run.md)
- [functions/workspace-utils](functions/workspace-utils.md)
- [functions/workspace-utils/execute-parallel](functions/workspace-utils/execute-parallel.md)
- [functions/workspace-utils/get-workspace-packages](functions/workspace-utils/get-workspace-packages.md)
- [functions/workspace-utils/run-cmd-in-parallel](functions/workspace-utils/run-cmd-in-parallel.md)
- [functions/workspace-utils/run-cmd-in-stages](functions/workspace-utils/run-cmd-in-stages.md)
- [functions/workspace-utils/types](functions/workspace-utils/types.md)
- [globals](globals.md)
- [node-global](node-global.md)
