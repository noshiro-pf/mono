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

#### `assertRepoIsDirty(): Promise<void>`

Checks if repository is dirty and exits with code 1 if it is (shows changes and diff).

```typescript
import { assertRepoIsDirty } from 'ts-repo-utils';

// Use in CI/build scripts to ensure clean state
await assertRepoIsDirty();
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

#### `formatChanged(): Promise<'ok' | 'err'>`

Format only files that have been changed according to git status.

```typescript
import { formatChanged } from 'ts-repo-utils';

// Format only modified files
await formatChanged();
```

#### `formatDiffFrom(base?: string): Promise<'ok' | 'err'>`

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
import { formatChanged, assertExt, assertRepoIsDirty } from 'ts-repo-utils';

// Format changed files
await formatChanged();

// Validate file extensions
await assertExt({
    directories: [{ path: './src', extension: '.ts' }],
});

// Ensure repository is clean (exits if dirty)
await assertRepoIsDirty();
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
import { pathExists, assertPathExists, assertRepoIsDirty } from 'ts-repo-utils';

// Check required files exist (exits with code 1 if files don't exist)
await assertPathExists('./package.json', 'Package manifest');
await assertPathExists('./tsconfig.json', 'TypeScript config');

// Verify clean repository state (exits with code 1 if repo is dirty)
await assertRepoIsDirty();
```

## License

Apache-2.0
