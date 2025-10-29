**eslint-config-typed**

***

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
- [TypeScript Configuration Files](#typescript-configuration-files)
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

## TypeScript Configuration Files

You can also write your eslint config in `.ts` or `.mts` format, all you need to do is run `npm add -D jiti`.

```ts
import {
    eslintConfigForTypeScript,
    eslintConfigForVitest,
    type FlatConfig,
} from 'eslint-config-typed';

export default [
    ...eslintConfigForTypeScript({
        tsconfigRootDir: thisDir,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [thisDir],
    }),
    eslintConfigForVitest(),
] satisfies FlatConfig[];
```

For details, see <https://eslint.org/docs/latest/use/configure/configuration-files#typescript-configuration-files>.

## Included plugins

- @typescript-eslint/eslint-plugin
- eslint-plugin-unicorn
- eslint-plugin-functional
- eslint-plugin-total-functions (Reimplemented in this repository to support flat config)
- eslint-plugin-array-func
- eslint-plugin-prefer-arrow-functions
- eslint-plugin-sort-destructure-keys
- eslint-plugin-security
- eslint-plugin-promise
- eslint-plugin-import
- eslint-plugin-strict-dependencies
- eslint-plugin-tree-shakable (Reimplemented in this repository to support flat config)
- eslint-plugin-react
- eslint-plugin-react-hooks
- eslint-plugin-react-perf
- eslint-plugin-react-refresh
- eslint-plugin-jsx-a11y
- eslint-plugin-vitest
- eslint-plugin-jest
- eslint-plugin-playwright
- eslint-plugin-cypress
- eslint-plugin-testing-library
- eslint-plugin-eslint-plugin

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

| Pre-configured rule option        | Rule                    | Description                                                                                                                                                   |
| :-------------------------------- | :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`restrictedGlobals`**           | `no-restricted-globals` | Array of restricted global variables                                                                                                                          |
| **`restrictedGlobalsForBrowser`** | `no-restricted-globals` | Browser-environment-specific restricted globals                                                                                                               |
| **`restrictedSyntax`**            | `no-restricted-syntax`  | Disallows the `in` operator, `Object.prototype.hasOwnProperty.call` (suggests using `Object.hasOwn`), and `new Array(*)` syntax (suggests using `Array.from`) |
| **`restrictedSyntaxForReact`**    | `no-restricted-syntax`  | Rule set to restrict React component styling                                                                                                                  |

You can find other pre-configured rule options by traversing the pre-defined rules object like this:

- `typescriptEslintRules['@typescript-eslint/no-unused-vars'][1].varsIgnorePattern`
- `eslintRules['logical-assignment-operators'].slice(1)`

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

This project is licensed under the [Apache License 2.0](_media/LICENSE).

## Modules

- [configs](configs.md)
- [configs/browser](configs/browser.md)
- [configs/cypress](configs/cypress.md)
- [configs/jest](configs/jest.md)
- [configs/nodejs](configs/nodejs.md)
- [configs/playwright](configs/playwright.md)
- [configs/plugins](configs/plugins.md)
- [configs/preact](configs/preact.md)
- [configs/react](configs/react.md)
- [configs/react-base](configs/react-base.md)
- [configs/testing-library](configs/testing-library.md)
- [configs/typescript](configs/typescript.md)
- [configs/typescript-without-rules](configs/typescript-without-rules.md)
- [configs/vitest](configs/vitest.md)
- [entry-point](entry-point.md)
- [globals](globals.md)
- [plugins](plugins.md)
- [plugins/custom](plugins/custom.md)
- [plugins/custom/custom](plugins/custom/custom.md)
- [plugins/custom/rules](plugins/custom/rules.md)
- [plugins/custom/rules/no-restricted-syntax2](plugins/custom/rules/no-restricted-syntax2.md)
- [plugins/custom/rules/rules](plugins/custom/rules/rules.md)
- [plugins/strict-dependencies](plugins/strict-dependencies.md)
- [plugins/strict-dependencies/plugin](plugins/strict-dependencies/plugin.md)
- [plugins/strict-dependencies/rules](plugins/strict-dependencies/rules.md)
- [plugins/strict-dependencies/rules/resolve-import-path](plugins/strict-dependencies/rules/resolve-import-path.md)
- [plugins/strict-dependencies/rules/rules](plugins/strict-dependencies/rules/rules.md)
- [plugins/strict-dependencies/rules/strict-dependencies](plugins/strict-dependencies/rules/strict-dependencies.md)
- [plugins/total-functions](plugins/total-functions.md)
- [plugins/total-functions/plugin](plugins/total-functions/plugin.md)
- [plugins/total-functions/rules](plugins/total-functions/rules.md)
- [plugins/total-functions/rules/common](plugins/total-functions/rules/common.md)
- [plugins/total-functions/rules/fp-ts](plugins/total-functions/rules/fp-ts.md)
- [plugins/total-functions/rules/no-enums](plugins/total-functions/rules/no-enums.md)
- [plugins/total-functions/rules/no-hidden-type-assertions](plugins/total-functions/rules/no-hidden-type-assertions.md)
- [plugins/total-functions/rules/no-nested-fp-ts-effects](plugins/total-functions/rules/no-nested-fp-ts-effects.md)
- [plugins/total-functions/rules/no-partial-array-reduce](plugins/total-functions/rules/no-partial-array-reduce.md)
- [plugins/total-functions/rules/no-partial-division](plugins/total-functions/rules/no-partial-division.md)
- [plugins/total-functions/rules/no-partial-string-normalize](plugins/total-functions/rules/no-partial-string-normalize.md)
- [plugins/total-functions/rules/no-partial-url-constructor](plugins/total-functions/rules/no-partial-url-constructor.md)
- [plugins/total-functions/rules/no-premature-fp-ts-effects](plugins/total-functions/rules/no-premature-fp-ts-effects.md)
- [plugins/total-functions/rules/no-unsafe-enum-assignment](plugins/total-functions/rules/no-unsafe-enum-assignment.md)
- [plugins/total-functions/rules/no-unsafe-mutable-readonly-assignment](plugins/total-functions/rules/no-unsafe-mutable-readonly-assignment.md)
- [plugins/total-functions/rules/no-unsafe-optional-property-assignment](plugins/total-functions/rules/no-unsafe-optional-property-assignment.md)
- [plugins/total-functions/rules/no-unsafe-readonly-mutable-assignment](plugins/total-functions/rules/no-unsafe-readonly-mutable-assignment.md)
- [plugins/total-functions/rules/no-unsafe-type-assertion](plugins/total-functions/rules/no-unsafe-type-assertion.md)
- [plugins/total-functions/rules/require-strict-mode](plugins/total-functions/rules/require-strict-mode.md)
- [plugins/total-functions/rules/rules](plugins/total-functions/rules/rules.md)
- [plugins/total-functions/rules/unsafe-assignment-rule](plugins/total-functions/rules/unsafe-assignment-rule.md)
- [plugins/tree-shakable](plugins/tree-shakable.md)
- [plugins/tree-shakable/plugin](plugins/tree-shakable/plugin.md)
- [plugins/tree-shakable/rules](plugins/tree-shakable/rules.md)
- [plugins/tree-shakable/rules/import-star](plugins/tree-shakable/rules/import-star.md)
- [plugins/tree-shakable/rules/rules](plugins/tree-shakable/rules/rules.md)
- [rules](rules.md)
- [rules/eslint-array-func-rules](rules/eslint-array-func-rules.md)
- [rules/eslint-cypress-rules](rules/eslint-cypress-rules.md)
- [rules/eslint-functional-rules](rules/eslint-functional-rules.md)
- [rules/eslint-import-rules](rules/eslint-import-rules.md)
- [rules/eslint-jest-rules](rules/eslint-jest-rules.md)
- [rules/eslint-jsx-a11y-rules](rules/eslint-jsx-a11y-rules.md)
- [rules/eslint-playwright-rules](rules/eslint-playwright-rules.md)
- [rules/eslint-plugin-rules](rules/eslint-plugin-rules.md)
- [rules/eslint-plugin-sort-destructure-keys-rules](rules/eslint-plugin-sort-destructure-keys-rules.md)
- [rules/eslint-prefer-arrow-functions-rules](rules/eslint-prefer-arrow-functions-rules.md)
- [rules/eslint-promise-rules](rules/eslint-promise-rules.md)
- [rules/eslint-react-hooks-rules](rules/eslint-react-hooks-rules.md)
- [rules/eslint-react-perf-rules](rules/eslint-react-perf-rules.md)
- [rules/eslint-react-refresh-rules](rules/eslint-react-refresh-rules.md)
- [rules/eslint-react-rules](rules/eslint-react-rules.md)
- [rules/eslint-rules](rules/eslint-rules.md)
- [rules/eslint-security-rules](rules/eslint-security-rules.md)
- [rules/eslint-testing-library-rules](rules/eslint-testing-library-rules.md)
- [rules/eslint-total-functions-rules](rules/eslint-total-functions-rules.md)
- [rules/eslint-tree-shakable-rules](rules/eslint-tree-shakable-rules.md)
- [rules/eslint-unicorn-rules](rules/eslint-unicorn-rules.md)
- [rules/eslint-vitest-rules](rules/eslint-vitest-rules.md)
- [rules/typescript-eslint-rules](rules/typescript-eslint-rules.md)
- [types](types.md)
- [types/define-config](types/define-config.md)
- [types/define-known-rules](types/define-known-rules.md)
- [types/flat-config](types/flat-config.md)
- [types/rule-severity-with-default-option](types/rule-severity-with-default-option.md)
- [types/rules](types/rules.md)
- [types/rules/eslint-array-func-rules](types/rules/eslint-array-func-rules.md)
- [types/rules/eslint-custom-rules](types/rules/eslint-custom-rules.md)
- [types/rules/eslint-cypress-rules](types/rules/eslint-cypress-rules.md)
- [types/rules/eslint-functional-rules](types/rules/eslint-functional-rules.md)
- [types/rules/eslint-import-rules](types/rules/eslint-import-rules.md)
- [types/rules/eslint-jest-rules](types/rules/eslint-jest-rules.md)
- [types/rules/eslint-jsx-a11y-rules](types/rules/eslint-jsx-a11y-rules.md)
- [types/rules/eslint-playwright-rules](types/rules/eslint-playwright-rules.md)
- [types/rules/eslint-plugin-rules](types/rules/eslint-plugin-rules.md)
- [types/rules/eslint-plugin-sort-destructure-keys-rules](types/rules/eslint-plugin-sort-destructure-keys-rules.md)
- [types/rules/eslint-prefer-arrow-functions-rules](types/rules/eslint-prefer-arrow-functions-rules.md)
- [types/rules/eslint-promise-rules](types/rules/eslint-promise-rules.md)
- [types/rules/eslint-react-hooks-rules](types/rules/eslint-react-hooks-rules.md)
- [types/rules/eslint-react-perf-rules](types/rules/eslint-react-perf-rules.md)
- [types/rules/eslint-react-refresh-rules](types/rules/eslint-react-refresh-rules.md)
- [types/rules/eslint-react-rules](types/rules/eslint-react-rules.md)
- [types/rules/eslint-rules](types/rules/eslint-rules.md)
- [types/rules/eslint-security-rules](types/rules/eslint-security-rules.md)
- [types/rules/eslint-strict-dependencies-rules](types/rules/eslint-strict-dependencies-rules.md)
- [types/rules/eslint-testing-library-rules](types/rules/eslint-testing-library-rules.md)
- [types/rules/eslint-total-functions-rules](types/rules/eslint-total-functions-rules.md)
- [types/rules/eslint-tree-shakable-rules](types/rules/eslint-tree-shakable-rules.md)
- [types/rules/eslint-unicorn-rules](types/rules/eslint-unicorn-rules.md)
- [types/rules/eslint-vitest-rules](types/rules/eslint-vitest-rules.md)
- [types/rules/typescript-eslint-rules](types/rules/typescript-eslint-rules.md)
