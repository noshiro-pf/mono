# ts-repo-utils

[![npm version](https://img.shields.io/npm/v/ts-repo-utils.svg)](https://www.npmjs.com/package/ts-repo-utils)
[![npm downloads](https://img.shields.io/npm/dm/ts-repo-utils.svg)](https://www.npmjs.com/package/ts-repo-utils)
[![License](https://img.shields.io/npm/l/ts-repo-utils.svg)](./LICENSE)
[![codecov](https://codecov.io/gh/noshiro-pf/ts-repo-utils/graph/badge.svg?token=S4688Q0CX3)](https://codecov.io/gh/noshiro-pf/ts-repo-utils)

Utilities for TypeScript Repositories.

A comprehensive toolkit for managing TypeScript projects with strict ESM support, providing essential utilities for file validation, code formatting, git operations, and project automation.

## Installation

```bash
npm install ts-repo-utils
```

## CLI Commands

`ts-repo-utils` provides several CLI commands that can be used directly or through npm scripts.

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

**Options:**

- `<target-directory>` - Directory where the index file will be generated (comma-separated list can be used)
- `--target-ext` - File extensions to include in the index file (required, can be specified multiple times)
- `--index-ext` - Extension of the index file to be generated (required)
- `--export-ext` - Extension of the export statements in the index file (required, or 'none')
- `--exclude` - Glob patterns of files to exclude (optional, can be specified multiple times)
- `--fmt` - Command to format after generating the index file (optional)
- `--silent` - Suppress output messages (optional)

### `assert-repo-is-clean`

Checks if repository is clean and exits with code 1 if it has uncommitted changes.

```bash
# Basic usage
npm exec -- assert-repo-is-clean

# Silent mode
npm exec -- assert-repo-is-clean --silent
```

```yaml
# Example in GitHub Actions
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

- `--exclude-untracked` - Exclude untracked files in addition to diff files (default: false)
- `--exclude-modified` - Exclude modified files in addition to diff files (default: false)
- `--exclude-staged` - Exclude staged files in addition to diff files (default: false)
- `--silent` - Suppress output messages (default: false)

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

# Example in npm scripts
"fmt": "format-diff-from origin/main"
```

**Options:**

- `<base>` - Base branch name or commit hash to compare against (required)
- `--exclude-untracked` - Exclude untracked files in addition to diff files (default: false)
- `--exclude-modified` - Exclude modified files in addition to diff files (default: false)
- `--exclude-staged` - Exclude staged files in addition to diff files (default: false)
- `--silent` - Suppress output messages (default: false)

### `check-should-run-type-checks`

Checks if TypeScript type checks should run based on the diff from a base branch. Optimizes CI/CD pipelines by skipping type checks when only non-TypeScript files are changed.

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

### Usage in npm scripts

The CLI commands are commonly used in npm scripts for automation:

```json
{
    "scripts": {
        "fmt": "format-diff-from origin/main",
        "gi": "gen-index-ts ./src --index-ext .mts --export-ext .mjs --target-ext .mts --target-ext .tsx --fmt 'npm run fmt'",
        "check:clean": "assert-repo-is-clean"
    }
}
```

### Usage in CI/CD

These commands are particularly useful in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Format check
  run: |
      npm run fmt
      npm exec -- assert-repo-is-clean

# Check for uncommitted changes after build
- name: Build
  run: npm run build
- name: Check if there is no file diff
  run: npm exec -- assert-repo-is-clean
```

## API Reference

### Path and File System Utilities

#### `pathExists(filePath: string): Promise<boolean>`

Checks if a file or directory exists at the specified path.

```typescript
import { pathExists } from 'ts-repo-utils';

const exists = await pathExists('./src/index.ts');
console.log(exists); // true or false
```

#### `assertPathExists(filePath: string, description?: string): Promise<void>`

Validates that a path exists and exits with code 1 if it doesn't.

```typescript
import { assertPathExists } from 'ts-repo-utils';

// If the file doesn't exist, this will exit the process with code 1
await assertPathExists('./src/index.ts', 'Entry point file');
```

### File Extension Validation

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
type CheckExtConfig = DeepReadonly<{
    directories: {
        path: string; // Directory path to check
        extension: string; // Expected file extension (including the dot)
        ignorePatterns?: string[]; // Optional glob patterns to ignore
    }[];
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

Checks if repository is clean and exits with code 1 if it has uncommitted changes (shows changes and diff).

```typescript
import { assertRepoIsClean } from 'ts-repo-utils';

// Use in CI/build scripts to ensure clean state
await assertRepoIsClean();
```

### Command Execution

#### `$(command: string, options?: { silent?: boolean; timeout?: number }): Promise<ExecResult>`

Executes a shell command asynchronously with timeout support and type-safe results.

```typescript
import { $ } from 'ts-repo-utils';

const result = await $('npm test', { timeout: 60000 });

if (result.type === 'ok') {
    console.log('Tests passed:', result.stdout);
} else {
    console.error('Tests failed:', result.exception.message);
}
```

**Options:**

- `silent?: boolean` - Don't log command/output (default: false)
- `timeout?: number` - Timeout in milliseconds (default: 30000)

**Return Type:**

```typescript
type ExecResult = Readonly<
    | { type: 'ok'; stdout: string; stderr: string }
    | { type: 'error'; exception: ExecException }
>;
```

### Code Formatting Utilities

#### `formatFiles(pathGlob: string): Promise<'ok' | 'err'>`

Format files matching a glob pattern using Prettier.

```typescript
import { formatFiles } from 'ts-repo-utils';

// Format all TypeScript files in src
await formatFiles('src/**/*.ts');

// Format specific files
await formatFiles('src/{index,utils}.ts');
```

#### `formatUntracked(): Promise<'ok' | 'err'>`

Format only files that have been changed according to git status.

```typescript
import { formatUntracked } from 'ts-repo-utils';

// Format only modified files
await formatUntracked();
```

#### `formatDiffFrom(base: string): Promise<'ok' | 'err'>`

Format only files that differ from the specified base branch or commit.

```typescript
import { formatDiffFrom } from 'ts-repo-utils';

// Format files different from main branch
await formatDiffFrom('main');

// Format files different from specific commit
await formatDiffFrom('abc123');
```

### Index File Generation

#### `genIndex(config: GenIndexConfig): Promise<void>`

Generates index files recursively in target directories with automatic barrel exports.

```typescript
import { genIndex } from 'ts-repo-utils';

await genIndex({
    targetDirectory: './src',
    sourceExtension: '.ts',
    exportExtension: '.js',
    excludePatterns: ['*.test.ts', '*.spec.ts'],
});
```

**Configuration Type:**

```typescript
type GenIndexConfig = DeepReadonly<{
    targetDirectory: string | string[]; // Target directories to generate index files for
    sourceExtension?: `.${string}`; // File extension of source files (default: '.mts')
    exportExtension?: `.${string}`; // Extension to use in exports (default: '.mjs')
    excludePatterns?: string[]; // Glob patterns to exclude (default: excludes .d.* and .test.*)
}>;
```

**Features:**

- Creates barrel exports for all subdirectories
- Supports complex glob exclusion patterns (using micromatch)
- Automatically formats generated files using project's prettier config
- Works with both single directories and directory arrays
- Respects source and export extension configuration

## Key Features

- **Type Safety**: All functions use strict TypeScript types with readonly parameters
- **Error Handling**: Comprehensive error handling with descriptive messages
- **Git Integration**: Built-in git status and diff utilities
- **Formatting**: Prettier integration with configuration resolution
- **ESM Support**: Designed for ES modules with .mts/.mjs extension handling
- **Concurrent Processing**: Uses Promise.all for performance optimization
- **Configurable**: Flexible configuration options with sensible defaults
- **Console Feedback**: Informative logging throughout operations

## Common Patterns

### Pre-commit Hook

```typescript
import { formatUntracked, assertExt, assertRepoIsClean } from 'ts-repo-utils';

// Format changed files
await formatUntracked();

// Validate file extensions
await assertExt({
    directories: [{ path: './src', extension: '.ts' }],
});

// Ensure repository is clean (exits if dirty)
await assertRepoIsClean();
```

### Build Pipeline

```typescript
import { assertExt, genIndex, $, formatFiles } from 'ts-repo-utils';

// Validate extensions
await assertExt({
    directories: [
        { path: './src', extension: '.ts' },
        { path: './scripts', extension: '.mjs' },
    ],
});

// Generate barrel exports
await genIndex({ targetDirectory: './src' });

// Type check
await $('tsc --noEmit');

// Build
await $('rollup -c');

// Format output
await formatFiles('dist/**/*.js');
```

### Project Validation

```typescript
import { pathExists, assertPathExists, assertRepoIsClean } from 'ts-repo-utils';

// Check required files exist (exits with code 1 if files don't exist)
await assertPathExists('./package.json', 'Package manifest');
await assertPathExists('./tsconfig.json', 'TypeScript config');

// Verify clean repository state (exits with code 1 if repo is dirty)
await assertRepoIsClean();
```

## License

Apache-2.0
