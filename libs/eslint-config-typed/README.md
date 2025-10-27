# eslint-config-typed

[![npm version](https://img.shields.io/npm/v/eslint-config-typed.svg)](https://www.npmjs.com/package/eslint-config-typed)
[![npm downloads](https://img.shields.io/npm/dm/eslint-config-typed.svg)](https://www.npmjs.com/package/eslint-config-typed)
[![License](https://img.shields.io/npm/l/eslint-config-typed.svg)](./LICENSE)
[![codecov](https://codecov.io/gh/noshiro-pf/eslint-config-typed/graph/badge.svg?token=MJ5ZUDVEAF)](https://codecov.io/gh/noshiro-pf/eslint-config-typed)

A comprehensive ESLint configuration package with strongly-typed rule definitions and pre-configured setups for TypeScript, React, testing frameworks, and more.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
    - [defineConfig helper](#defineconfig-helper)
    - [defineKnownRules utility](#defineknownrules-utility)
    - [withDefaultOption utility](#withdefaultoption-utility)
- [Configuration Examples](#configuration-examples)
    - [TypeScript + React Project](#typescript--react-project)
    - [Node.js TypeScript Project](#nodejs-typescript-project)
    - [React + Testing Libraries](#react--testing-libraries)
- [VS Code Integration](#vs-code-integration)
- [Included plugins](#included-plugins)
- [API Reference](#api-reference)
    - [Configuration Functions](#configuration-functions)
        - [Base Configurations](#base-configurations)
        - [Framework Configurations](#framework-configurations)
        - [Utility Configurations](#utility-configurations)
    - [Rule Collections](#rule-collections)
    - [Exported Pre-configured Rule Options](#exported-pre-configured-rule-options)
    - [Custom Plugins](#custom-plugins)
    - [Type Definitions](#type-definitions)
        - [Core Types](#core-types)
        - [Rule Types](#rule-types)
- [Customization](#customization)
    - [Override Specific Rules](#override-specific-rules)
    - [Use Type-Safe Rule Options](#use-type-safe-rule-options)
    - [Target Specific Files](#target-specific-files)
- [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
        - [1. ESLint can't find tsconfig.json](#1-eslint-cant-find-tsconfigjson)
        - [2. Import resolution errors](#2-import-resolution-errors)
        - [3. Performance issues](#3-performance-issues)
    - [Known Limitations](#known-limitations)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🎯 **Type-Safe Configuration**: Fully typed ESLint rules and configurations for better IDE support
- 📦 **Pre-configured Setups**: Ready-to-use configurations for TypeScript, React, Preact, and popular testing frameworks
- 📝 **Comprehensive Type Definitions**: Complete TypeScript types for all ESLint rules and options
- 🔄 **ESLint Flat Config Support**: Built for the modern ESLint flat configuration system
- 🔧 **Custom Rules**: Additional custom ESLint rules for enhanced code quality

## Requirements

- Node.js >= 18.0.0
- ESLint >= 9.0.0
- TypeScript >= 5.0.0 (for TypeScript projects)

## Installation

```sh
npm add -D eslint eslint-config-typed
# or
yarn add -D eslint eslint-config-typed
# or
pnpm add -D eslint eslint-config-typed
```

All required ESLint plugins and dependencies are automatically installed.

## Quick Start

Create an `eslint.config.js` file in your project root:

```js
import {
    defineConfig,
    eslintConfigForTypeScript,
    eslintConfigForVitest,
    defineKnownRules,
} from 'eslint-config-typed';
// import * as path from 'node:path';
// import * as url from 'node:url';

const thisDir = import.meta.dirname;
// or path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig([
    {
        // config with just ignores is the replacement for `.eslintignore`
        ignores: ['**/build/**', '**/dist/**', 'src/some/file/to/ignore.ts'],
    },

    // Base config for TypeScript & JavaScript code
    ...eslintConfigForTypeScript({
        tsconfigRootDir: thisDir,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [thisDir],

        // If you are using a monorepo and the root package.json is located at ../../../:
        // packageDirs: [path.resolve(thisDir, '../../..'), thisDir],
    }),
    eslintConfigForVitest(),

    // You can override per-rule settings if necessary.
    {
        rules: defineKnownRules({
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/prefer-readonly-parameter-types': 'off',
            'react-hooks/exhaustive-deps': 'warn',
            'functional/no-let': [
                'error',
                {
                    allowInForLoopInit: true,
                    allowInFunctions: false,
                    ignoreIdentifierPattern: ignorePattern.filter(
                        (p) => p !== '^draft',
                    ),
                },
            ],
        }),
    },
]);
```

Add a lint script to your `package.json`:

```json
{
    "scripts": {
        "lint": "eslint './src/**/*'",
        "lint:fix": "eslint './src/**/*' --fix"
    }
}
```

Run the linter:

```sh
npm run lint
# or auto-fix issues
npm run lint:fix
```

### defineConfig helper

`defineConfig` wraps your flat configuration array so JavaScript config files get full IntelliSense without relying on JSDoc casts. It keeps literal types intact while returning the config unchanged at runtime.

```js
import { defineConfig, eslintConfigForTypeScript } from 'eslint-config-typed';

export default defineConfig([
    ...eslintConfigForTypeScript({
        tsconfigRootDir: import.meta.dirname,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [import.meta.dirname],
    }),
    {
        rules: defineKnownRules({
            // ...
        }),
    },
]);
```

This is equivalent to:

```js
import { eslintConfigForTypeScript } from 'eslint-config-typed';

/** @type {import('@typescript-eslint/utils/ts-eslint').FlatConfig[]} */
export default [
    ...eslintConfigForTypeScript({
        tsconfigRootDir: import.meta.dirname,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [import.meta.dirname],
    }),
    {
        rules: defineKnownRules({
            // ...
        }),
    },
];
```

### defineKnownRules utility

`defineKnownRules` is a helper designed for the `rules` field in ESLint flat configs. It keeps the returned object untouched while giving you type-safe rule names and option inference in editors. When you wrap your overrides with this function you can rely on:

- autocomplete and early feedback for rule identifiers, eliminating typo-prone string literals;
- strongly typed options for every plugin rule that ships with `eslint-config-typed`, so you can discover valid properties without leaving your editor;
- a zero-cost runtime helper—because the object is returned as-is, it blends seamlessly into any flat config block.

### withDefaultOption utility

`withDefaultOption` is a companion helper that highlights rules which ship with option objects. It maps the familiar severity strings to the numeric values ESLint expects: `withDefaultOption('error')` returns `2`, and `withDefaultOption('warn')` returns `1`. Within `defineKnownRules`, rules that provide options require one of these helpers when you want to keep the defaults and only adjust severity. This convention visually distinguishes rules that contain options, reminding users that a rule has configurable options.

`defineKnownRules` also reserves `0` for deprecated rules. The resulting severity matrix looks like this:

| Rule type            | Allowed severity values in `defineKnownRules`                  |
| :------------------- | :------------------------------------------------------------- |
| Deprecated rule      | `0`                                                            |
| Rule without options | `"off"`, `"warn"`, `"error"`                                   |
| Rule with options    | `"off"`, `1`, `2`, `["warn", <option>]`, `["error", <option>]` |

## Configuration Examples

### TypeScript + React Project

```js
import {
    defineConfig,
    eslintConfigForTypeScript,
    eslintConfigForReact,
    eslintConfigForNodeJs,
    defineKnownRules,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default defineConfig([
    { ignores: ['**/dist/**', '**/build/**', '**/.next/**'] },
    ...eslintConfigForTypeScript({
        tsconfigRootDir: thisDir,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [thisDir],
    }),
    eslintConfigForReact(['src/**']),
    eslintConfigForNodeJs(['scripts/**', 'configs/**']),
    {
        files: ['scripts/**', 'configs/**'],
        rules: defineKnownRules({
            '@typescript-eslint/explicit-function-return-type': 'off',
            'no-await-in-loop': 'off',
            'import/no-unassigned-import': 'off',
            'import/no-internal-modules': 'off',
            'import/no-default-export': 'off',
            'import/no-extraneous-dependencies': 'off',
        }),
    },
]);
```

### Node.js TypeScript Project

```js
import {
    defineConfig,
    eslintConfigForTypeScript,
    eslintConfigForNodeJs,
    defineKnownRules,
} from 'eslint-config-typed';

export default defineConfig([
    { ignores: ['**/dist/**', '**/node_modules/**'] },
    ...eslintConfigForTypeScript({
        tsconfigRootDir: import.meta.dirname,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [import.meta.dirname],
    }),
    eslintConfigForNodeJs(),
    {
        rules: defineKnownRules({
            // Allow console in Node.js
            'no-console': 'off',
            // Allow process.env access
            'no-process-env': 'off',
        }),
    },
]);
```

### React + Testing Libraries

```js
import {
    defineConfig,
    eslintConfigForTypeScript,
    eslintConfigForReact,
    eslintConfigForVitest,
    eslintConfigForTestingLibrary,
} from 'eslint-config-typed';

export default defineConfig([
    { ignores: ['**/dist/**', '**/coverage/**'] },
    ...eslintConfigForTypeScript({
        tsconfigRootDir: import.meta.dirname,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [import.meta.dirname],
    }),
    ...eslintConfigForReact(),
    eslintConfigForVitest(),
    eslintConfigForTestingLibrary(),
]);
```

## VS Code Integration

Add the following to `.vscode/settings.json` for proper ESLint integration:

```json
{
    "eslint.workingDirectories": [
        {
            "mode": "auto"
        }
    ],
    "eslint.experimental.useFlatConfig": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "explicit"
    }
}
```

## Included plugins

- "@typescript-eslint/eslint-plugin": "8.46.2"
- "eslint-plugin-unicorn": "62.0.0"
- "eslint-plugin-functional": "9.0.2"
- "eslint-plugin-array-func": "5.1.0"
- "eslint-plugin-prefer-arrow-functions": "3.9.1"
- "eslint-plugin-sort-destructure-keys": "^2.0.0"
- "eslint-plugin-security": "3.0.1"
- "eslint-plugin-promise": "7.2.1"
- "eslint-plugin-import": "2.32.0"
- "eslint-plugin-strict-dependencies": "1.3.27"
- "eslint-plugin-react": "7.37.5"
- "eslint-plugin-react-hooks": "7.0.1"
- "eslint-plugin-react-perf": "3.3.3"
- "eslint-plugin-react-refresh": "0.4.24"
- "eslint-plugin-jsx-a11y": "6.10.2"
- "eslint-plugin-vitest": "0.5.4"
- "eslint-plugin-jest": "29.0.1"
- "eslint-plugin-playwright": "2.2.2"
- "eslint-plugin-cypress": "5.2.0"
- "eslint-plugin-testing-library": "7.13.3"
- "eslint-plugin-eslint-plugin": "7.2.0"
- "eslint-plugin-total-functions" (Reimplemented in this repository to support flat config)
- "eslint-plugin-tree-shakable" (Reimplemented in this repository to support flat config)

## API Reference

### Configuration Functions

These functions return arrays of ESLint flat configurations:

#### Base Configurations

- **`eslintConfigForTypeScript(options)`** - TypeScript configuration with strict type checking rules
    - `options.tsconfigRootDir`: Root directory containing tsconfig.json
    - `options.tsconfigFileName`: Path to tsconfig.json file
    - `options.packageDirs`: Array of package directories for import resolution
- **`eslintConfigForBrowser`** - Browser configuration (Turn off Node.js-specific rules)
- **`eslintConfigForNodeJs`** - Node.js configuration (Turn off browser-specific rules)

#### Framework Configurations

- **`eslintConfigForReact(options?)`** - React configuration with hooks and JSX rules
    - `eslintConfigForBrowser` is included in this configuration
- **`eslintConfigForPreact(options?)`** - Preact configuration (lighter React alternative)
    - `eslintConfigForBrowser` is included in this configuration
- **`eslintConfigForVitest(options?)`** - Vitest testing framework configuration
- **`eslintConfigForJest(options?)`** - Jest testing framework configuration
- **`eslintConfigForTestingLibrary(options?)`** - Testing Library configuration
- **`eslintConfigForPlaywright(options?)`** - Playwright E2E testing configuration
- **`eslintConfigForCypress(options?)`** - Cypress E2E testing configuration

#### Utility Configurations

- **`eslintConfigForTypeScriptWithoutRules(options)`** - TypeScript parser & plugins setup without any rules

### Rule Collections

Pre-configured rule sets that can be imported and customized:

| Rule set                                   | Plugin name                            | Description                          |
| :----------------------------------------- | :------------------------------------- | :----------------------------------- |
| **`eslintRules`**                          | (eslint)                               | Core ESLint rules                    |
| **`typescriptEslintRules`**                | `@typescript-eslint/eslint-plugin`     | TypeScript-specific ESLint rules     |
| **`eslintFunctionalRules`**                | `eslint-plugin-functional`             | Functional programming style rules   |
| **`eslintTotalFunctionsRules`**            | `eslint-plugin-total-functions`        | Functional programming style rules   |
| **`eslintUnicornRules`**                   | `eslint-plugin-unicorn`                | Unicorn plugin rules for better code |
| **`eslintArrayFuncRules`**                 | `eslint-plugin-array-func`             | Array function preference rules      |
| **`eslintPreferArrowFunctionRules`**       | `eslint-plugin-prefer-arrow-functions` | Arrow function preference rules      |
| **`eslintPluginSortDestructureKeysRules`** | `eslint-plugin-sort-destructure-keys`  | Object destructuring rules           |
| **`eslintPromiseRules`**                   | `eslint-plugin-promise`                | Promise handling rules               |
| **`eslintImportsRules`**                   | `eslint-plugin-import`                 | Import/export rules                  |
| **`eslintSecurityRules`**                  | `eslint-plugin-security`               | Security best practices              |
| **`eslintTreeShakableRules`**              | `eslint-plugin-tree-shakable`          | Tree-shaking optimization rules      |
| **`eslintReactRules`**                     | `eslint-plugin-react`                  | React-specific rules                 |
| **`eslintReactHooksRules`**                | `eslint-plugin-react-hooks`            | React Hooks rules                    |
| **`eslintReactPerfRules`**                 | `eslint-plugin-react-perf`             | React performance optimization rules |
| **`eslintReactRefreshRules`**              | `eslint-plugin-react-refresh`          | React Refresh (HMR) rules            |
| **`eslintJsxA11yRules`**                   | `eslint-plugin-jsx-a11y`               | Accessibility rules for JSX          |
| **`eslintVitestRules`**                    | `eslint-plugin-vitest`                 | Vitest-specific rules                |
| **`eslintJestRules`**                      | `eslint-plugin-jest`                   | Jest-specific rules                  |
| **`eslintTestingLibraryRules`**            | `eslint-plugin-testing-library`        | Testing Library rules                |
| **`eslintPlaywrightRules`**                | `eslint-plugin-playwright`             | Playwright-specific rules            |
| **`eslintCypressRules`**                   | `eslint-plugin-cypress`                | Cypress-specific rules               |
| **`eslintPluginRules`**                    | `eslint-plugin-eslint-plugin`          | eslint-plugin development rules      |

### Exported Pre-configured Rule Options

| Pre-configured rule option        | Rule                    | Description                                     |
| :-------------------------------- | :---------------------- | :---------------------------------------------- |
| **`restrictedGlobals`**           | `no-restricted-globals` | Array of restricted global variables            |
| **`restrictedGlobalsForBrowser`** | `no-restricted-globals` | Browser-environment-specific restricted globals |

You can find other pre-configured rule options by traversing the pre-defined rules object like this:

- `typescriptEslintRules['@typescript-eslint/no-restricted-types'][1].types`
- `eslintRules['no-restricted-syntax'].slice(1)`

The shape of the rule option varies depending on the rule, so please check the contents by tracing the predefined rules each time and extract it.

### Custom Plugins

- **`eslintPluginTotalFunctions`**
    - `eslint-plugin-total-functions` with support for Flat Config
- **`eslintPluginTreeShakable`**
    - `eslint-plugin-tree-shakable` with support for Flat Config
- **`eslintPluginCustom`** - Custom ESLint plugin with additional rules
    - Currently, this plugin only provides the `custom/no-restricted-syntax` rule (which duplicates ESLint's `no-restricted-syntax` rule).
    - Can be used to set the error level to `error` or `warn` as needed.

Example:

```js
import { eslintRules } from 'eslint-config-typed';

export default defineConfig([
    // ...
    {
        rules: defineKnownRules({
            'no-restricted-syntax': [
                'warn',
                ...eslintRules['no-restricted-syntax'].slice(1),
            ],
            'custom/no-restricted-syntax': [
                'error',
                {
                    // Restrict import style of React
                    selector:
                        "ImportDeclaration[source.value='react'][specifiers.0.type!='ImportNamespaceSpecifier']",
                    message:
                        "React should be imported as `import * as React from 'react'.",
                },
            ],
        }),
    },
]);
```

### Type Definitions

All rules and configurations come with complete TypeScript type definitions:

#### Core Types

- **`FlatConfig`** - ESLint flat configuration type
- **`ESLintPlugin`** - ESLint plugin type
- **`Rule`** - ESLint rule definition type
- **`Rules`** - Collection of rules type

#### Rule Types

Each plugin provides typed rule definitions:

- General rules
    - **`EslintRules`** & **`EslintRulesOption`**
    - **`TypeScriptEslintRules`** & **`TypeScriptEslintRulesOption`**
    - **`EslintFunctionalRules`** & **`EslintFunctionalRulesOption`**
    - **`EslintTotalFunctionsRules`** (no options)
    - **`EslintUnicornRules`** & **`EslintUnicornRulesOption`**
    - **`EslintArrayFuncRules`** (no options)
    - **`EslintPreferArrowFunctionRules`** & **`EslintPreferArrowFunctionRulesOption`**
    - **`EslintPluginSortDestructureKeysRules`** & **`EslintPluginSortDestructureKeysRulesOption`**
    - **`EslintPromiseRules`** & **`EslintPromiseRulesOption`**
    - **`EslintImportsRules`** & **`EslintImportsRulesOption`**
    - **`EslintStrictDependenciesRules`** & **`EslintStrictDependenciesRulesOption`**
    - **`EslintSecurityRules`** (no options)
    - **`EslintTreeShakableRules`** (no options)
- React & JSX
    - **`EslintReactRules`** & **`EslintReactRulesOption`**
    - **`EslintReactHooksRules`** & **`EslintReactHooksRulesOption`**
    - **`EslintReactPerfRules`** & **`EslintReactPerfRulesOption`**
    - **`EslintReactRefreshRules`** & **`EslintReactRefreshRulesOption`**
    - **`EslintJsxA11yRules`** & **`EslintJsxA11yRulesOption`**
- Testing
    - **`EslintVitestRules`** & **`EslintVitestRulesOption`**
    - **`EslintJestRules`** & **`EslintJestRulesOption`**
    - **`EslintPlaywrightRules`** & **`EslintPlaywrightRulesOption`**
    - **`EslintCypressRules`** & **`EslintCypressRulesOption`**
    - **`EslintTestingLibraryRules`** & **`EslintTestingLibraryRulesOption`**
- Others
    - **`EslintPluginRules`** & **`EslintPluginRulesOption`**

## Customization

The pre-configured rules of `eslint-config-typed` are opinionated settings that prioritize strictness and enable as many non-conflicting rules as possible. Therefore, it is intended to be used by downgrading the severity of unnecessary rules in the config file from `"error"` to `"warn"` or `"off"`, or by overriding option settings.

### Override Specific Rules

You can override any rule by adding a configuration object after the preset configurations:

```js
import { typescriptEslintRules } from 'eslint-config-typed';

export default defineConfig([
    ...eslintConfigForTypeScript(options),
    {
        rules: defineKnownRules({
            // Downgrade to warning (Option settings are inherited)
            '@typescript-eslint/no-explicit-any': 'warn',
            // Disable a rule
            '@typescript-eslint/prefer-readonly-parameter-types': 'off',
            // Configure with options
            'functional/no-let': [
                'error',
                {
                    allowInForLoopInit: true,
                    allowInFunctions: false,
                },
            ],

            // Update rule options
            '@typescript-eslint/no-restricted-types': [
                'error',
                {
                    types: {
                        ...typescriptEslintRules[
                            '@typescript-eslint/no-restricted-types'
                        ][1].types,
                        Function: "Don't use Function type",
                    },
                },
            ],
        }),
    },
]);
```

### Use Type-Safe Rule Options

Leverage TypeScript for type-safe rule configuration:

```ts
// configs/restricted-syntax-defs.mjs

import { eslintRules } from 'eslint-config-typed';

/** @type {import("eslint-config-typed").EslintRulesOption["no-restricted-syntax"]} */
export const restrictedSyntax = [
    ...eslintRules['no-restricted-syntax'].slice(1),
    {
        // Restrict type annotation style for React.useMemo
        selector:
            "TSTypeAnnotation[parent.parent.type='CallExpression'][parent.parent.callee.object.name='React'][parent.parent.callee.property.name='useMemo']",
        message:
            'The variable type T should be annotated as `React.useMemo<T>` or `const v: T = React.useMemo(...)`.',
    },
];
```

```ts
// eslint.config.js

import { restrictedSyntax } from './configs/restricted-syntax-defs.mjs';

export default defineConfig([
    ...eslintConfigForTypeScript(options),
    {
        rules: defineKnownRules({
            'no-restricted-syntax': ['error', restrictedSyntax],
        }),
    },
]);
```

### Target Specific Files

Apply different rules to different file patterns:

```js
export default defineConfig([
    ...eslintConfigForTypeScript(options),
    {
        files: ['**/*.test.ts', '**/*.spec.ts'],
        rules: defineKnownRules({
            // Allow any in tests
            '@typescript-eslint/no-explicit-any': 'off',
            // Allow console in tests
            'no-console': 'off',
        }),
    },
    {
        files: ['scripts/**/*.ts'],
        rules: defineKnownRules({
            // Allow console in scripts
            'no-await-in-loop': 'off',
            'import/no-unassigned-import': 'off',
        }),
    },
]);
```

## Troubleshooting

### Common Issues

#### 1. ESLint can't find tsconfig.json

Ensure the paths are correct:

```js
const thisDir = import.meta.dirname;

export default defineConfig([
    ...eslintConfigForTypeScript({
        tsconfigRootDir: thisDir, // Must be absolute path
        tsconfigFileName: './tsconfig.json', // Relative to tsconfigRootDir
        packageDirs: [thisDir],
    }),
]);
```

#### 2. Import resolution errors

The `packageDirs` option helps ESLint resolve imports correctly in monorepos:

```js
export default defineConfig([
    ...eslintConfigForTypeScript({
        tsconfigRootDir: thisDir,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [
            path.resolve(thisDir, '../../..'), // Monorepo root
            thisDir, // Current package
        ],
    }),
]);
```

#### 3. Performance issues

For large projects, consider:

- Using `TIMING=1 eslint` to identify heavy rules
- Using `NODE_OPTIONS='--max-old-space-size=<memory-size-MB>' eslint` to increase the maximum memory available
- Separate heavy rules into a separate config and prepare a dedicated command
- Using `.eslintignore` or `ignores` patterns to skip generated files
- Running ESLint with `--cache` flag
- Limiting the scope of type-aware rules

### Known Limitations

- The `import/no-unused-modules` rule does not function properly with Native ESM
- Some type-aware rules may have performance impacts on very large codebases
- Flat config requires ESLint 9.0+ and may not be compatible with older tools

## Contributing

Contributions are welcome! Please check our [GitHub repository](https://github.com/noshiro-pf/eslint-config-typed) for:

- Issue reporting
- Feature requests
- Pull requests

## License

This project is licensed under the [Apache License 2.0](./LICENSE).
