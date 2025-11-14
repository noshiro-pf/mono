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
    - [Use RulesOptions Types](#use-rulesoptions-types)
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

- 🎯 **Type-Safe Configuration**: Fully typed ESLint rules **and options** and configurations for better IDE support
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

Create an `eslint.config.js` or `eslint.config.ts` file in your project root:

```tsx
import {
    defineConfig,
    defineKnownRules,
    eslintConfigForTypeScript,
    eslintConfigForVitest,
    withDefaultOption,
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
            '@typescript-eslint/no-explicit-any': withDefaultOption('warn'),
            '@typescript-eslint/prefer-readonly-parameter-types': 'off',
            'react-hooks/exhaustive-deps': withDefaultOption('warn'),
            'functional/no-let': [
                'error',
                {
                    allowInForLoopInit: true,
                    allowInFunctions: false,
                    ignoreIdentifierPattern: ['^mut_', '^_mut_', '^#mut_'],
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

```tsx
import {
    defineConfig,
    defineKnownRules,
    eslintConfigForTypeScript,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default defineConfig([
    ...eslintConfigForTypeScript({
        tsconfigRootDir: thisDir,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [thisDir],
    }),
    {
        rules: defineKnownRules({
            // ...
        }),
    },
]);
```

This is equivalent to:

```tsx
import {
    defineKnownRules,
    eslintConfigForTypeScript,
    type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default [
    ...eslintConfigForTypeScript({
        tsconfigRootDir: thisDir,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [thisDir],
    }),
    {
        rules: defineKnownRules({
            // ...
        }),
    },
] satisfies readonly FlatConfig[];
```

### defineKnownRules utility

`defineKnownRules` is a helper designed for the `rules` field in ESLint flat configs. It keeps the returned object untouched while giving you **type-safe rule names and option inference** in editors (like biome.json). When you wrap your overrides with this function you can rely on:

- autocomplete and early feedback for rule identifiers, eliminating typo-prone string literals;
- strongly typed options for every plugin rule that ships with `eslint-config-typed`, so you can discover valid properties without leaving your editor;
- a zero-cost runtime helper—because the object is returned as-is, it blends seamlessly into any flat config block.

```tsx
import {
    defineKnownRules,
    eslintConfigForTypeScript,
    type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default [
    ...eslintConfigForTypeScript({
        tsconfigRootDir: thisDir,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [thisDir],
    }),
    {
        rules: defineKnownRules({
            // @ts-expect-error typo of rule name
            'no-restricted-globalsSSSS': 'error',
            // ~~~~~~~~~~~~~~~~~~~~~~~
        }),
    },
    {
        rules: defineKnownRules({
            'no-unsafe-optional-chaining': [
                'error',
                // @ts-expect-error typo of an option key
                { disallowArithmeticOperatorsSSSSS: true },
                // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            ],
        }),
    },
] satisfies FlatConfig[];
```

### withDefaultOption utility

`withDefaultOption` is a companion helper that highlights rules which ship with option objects. It maps the familiar severity strings to the numeric values ESLint expects: `withDefaultOption('error')` returns `2`, and `withDefaultOption('warn')` returns `1`. Within `defineKnownRules`, rules that provide options require one of these helpers when you want to keep the defaults and only adjust severity. This convention visually distinguishes rules that contain options, reminding users that a rule has configurable options.

`defineKnownRules` also reserves `0` for deprecated rules. The resulting severity matrix looks like this:

| Rule type            | Allowed severity values in `defineKnownRules` |
| :------------------- | :-------------------------------------------- | ------ | -------- | ------- | ------------------- |
| Deprecated rule      | `0`                                           |
| Rule without options | `"off"                                        | "warn" | "error"` |
| Rule with options    | `"off"                                        | 1      | 2        | ["warn" | "error", <option>]` |

```tsx
import {
    defineKnownRules,
    eslintConfigForTypeScript,
    withDefaultOption,
    type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default [
    ...eslintConfigForTypeScript({
        tsconfigRootDir: thisDir,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [thisDir],
    }),
    {
        rules: defineKnownRules({
            // @ts-expect-error Simply passing the string "error" to a rule with options is not allowed
            'no-restricted-globals': 'error',
            // ~~~~~~~~~~~~~~~~~~~~
            // ^ Type Error! (Because "no-restricted-globals" has options)
            // NOTE: In addition, some rules, such as "no-restricted-syntax" "and no-restricted-globals", have no effect unless you set the option.

            // OK
            'object-shorthand': withDefaultOption('error'),

            // OK (options are set explicitly)
            'no-unsafe-optional-chaining': [
                'error',
                { disallowArithmeticOperators: true },
            ],
        }),
    },
] satisfies FlatConfig[];
```

### TypeScript Configuration Files

You can also write your eslint config in `.ts` or `.mts` format, all you need to do is run `npm add -D jiti`.

```tsx
import {
    eslintConfigForTypeScript,
    eslintConfigForVitest,
    type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

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

## Configuration Examples

### TypeScript + React Project

```tsx
import {
    defineKnownRules,
    eslintConfigForNodeJs,
    eslintConfigForReact,
    eslintConfigForTypeScript,
    type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default [
    { ignores: ['**/dist/**', '**/build/**', '**/.next/**', 'public/**'] },
    ...eslintConfigForTypeScript({
        tsconfigRootDir: thisDir,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [thisDir],
    }),
    ...eslintConfigForReact(['src/**']),
    eslintConfigForNodeJs(['scripts/**', 'configs/**']),
    {
        files: ['scripts/**', 'configs/**'],
        rules: defineKnownRules({
            '@typescript-eslint/explicit-function-return-type': 'off',
            'no-await-in-loop': 'off',
            'import-x/no-unassigned-import': 'off',
            'import-x/no-internal-modules': 'off',
            'import-x/no-default-export': 'off',
            'import-x/no-extraneous-dependencies': 'off',
        }),
    },
] satisfies FlatConfig[];
```

### Node.js TypeScript Project

```tsx
import {
    defineKnownRules,
    eslintConfigForNodeJs,
    eslintConfigForTypeScript,
    type FlatConfig,
} from 'eslint-config-typed';

export default [
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
        }),
    },
] satisfies FlatConfig[];
```

### React + Testing Libraries

```tsx
import {
    eslintConfigForReact,
    eslintConfigForTestingLibrary,
    eslintConfigForTypeScript,
    eslintConfigForVitest,
    type FlatConfig,
} from 'eslint-config-typed';

export default [
    { ignores: ['**/dist/**', '**/coverage/**'] },
    ...eslintConfigForTypeScript({
        tsconfigRootDir: import.meta.dirname,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [import.meta.dirname],
    }),
    ...eslintConfigForReact(),
    eslintConfigForVitest(),
    eslintConfigForTestingLibrary(),
] satisfies FlatConfig[];
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
    "eslint.experimental.useFlatConfig": true
    // "editor.codeActionsOnSave": {
    //   "source.fixAll.eslint": "explicit"
    // }
}
```

## Included plugins

- @typescript-eslint/eslint-plugin
- @stylistic/eslint-plugin
- eslint-plugin-unicorn
- eslint-plugin-functional
- eslint-plugin-total-functions (Reimplemented in this repository to support flat config)
- eslint-plugin-array-func
- eslint-plugin-prefer-arrow-functions
- eslint-plugin-sort-destructure-keys
- eslint-plugin-security
- eslint-plugin-promise
- eslint-plugin-import-x
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

These functions return (arrays of) ESLint flat configuration(s):

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
- **`eslintConfigForPreact(options?)`** - Preact (lighter React alternative) configuration
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

| Rule set                                   | Plugin name                            | Description                                            |
| :----------------------------------------- | :------------------------------------- | :----------------------------------------------------- |
| **`eslintRules`**                          | (eslint)                               | Core ESLint rules                                      |
| **`typescriptEslintRules`**                | `@typescript-eslint/eslint-plugin`     | TypeScript-specific ESLint rules                       |
| **`eslintFunctionalRules`**                | `eslint-plugin-functional`             | Functional programming style rules                     |
| **`eslintTotalFunctionsRules`**            | `eslint-plugin-total-functions`        | Functional programming style rules                     |
| **`eslintUnicornRules`**                   | `eslint-plugin-unicorn`                | Unicorn plugin rules for better code                   |
| **`eslintArrayFuncRules`**                 | `eslint-plugin-array-func`             | Array function preference rules                        |
| **`eslintPreferArrowFunctionRules`**       | `eslint-plugin-prefer-arrow-functions` | Arrow function preference rules                        |
| **`eslintPluginSortDestructureKeysRules`** | `eslint-plugin-sort-destructure-keys`  | Object destructuring rules                             |
| **`eslintPromiseRules`**                   | `eslint-plugin-promise`                | Promise handling rules                                 |
| **`eslintImportsRules`**                   | `eslint-plugin-import-x`               | Import/export rules                                    |
| **`eslintSecurityRules`**                  | `eslint-plugin-security`               | Security best practices                                |
| **`eslintTreeShakableRules`**              | `eslint-plugin-tree-shakable`          | Tree-shaking optimization rules                        |
| **`eslintReactRules`**                     | `eslint-plugin-react`                  | React-specific rules                                   |
| **`eslintReactHooksRules`**                | `eslint-plugin-react-hooks`            | React Hooks rules                                      |
| **`eslintReactPerfRules`**                 | `eslint-plugin-react-perf`             | React performance optimization rules                   |
| **`eslintReactRefreshRules`**              | `eslint-plugin-react-refresh`          | React Refresh (HMR) rules                              |
| **`eslintReactCodingStyleRules`**          | `eslint-plugin-react-coding-style`     | Opinionated React component style rules                |
| **`eslintStylisticRules`**                 | `@stylistic/eslint-plugin`             | Stylistic formatting rules disabled to mirror Prettier |
| **`eslintJsxA11yRules`**                   | `eslint-plugin-jsx-a11y`               | Accessibility rules for JSX                            |
| **`eslintVitestRules`**                    | `eslint-plugin-vitest`                 | Vitest-specific rules                                  |
| **`eslintJestRules`**                      | `eslint-plugin-jest`                   | Jest-specific rules                                    |
| **`eslintTestingLibraryRules`**            | `eslint-plugin-testing-library`        | Testing Library rules                                  |
| **`eslintPlaywrightRules`**                | `eslint-plugin-playwright`             | Playwright-specific rules                              |
| **`eslintCypressRules`**                   | `eslint-plugin-cypress`                | Cypress-specific rules                                 |
| **`eslintPluginRules`**                    | `eslint-plugin-eslint-plugin`          | eslint-plugin development rules                        |

### Exported Pre-configured Rule Options

| Pre-configured rule option        | Rule                    | Description                                                                                                                                                   |
| :-------------------------------- | :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`restrictedGlobals`**           | `no-restricted-globals` | Array of restricted global variables                                                                                                                          |
| **`restrictedGlobalsForBrowser`** | `no-restricted-globals` | Browser-environment-specific restricted globals                                                                                                               |
| **`restrictedSyntax`**            | `no-restricted-syntax`  | Disallows the `in` operator, `Object.prototype.hasOwnProperty.call` (suggests using `Object.hasOwn`), and `new Array(*)` syntax (suggests using `Array.from`) |

You can find other pre-configured rule options by traversing the pre-defined rules object like this:

- `typescriptEslintRules['@typescript-eslint/no-unused-vars'][1].varsIgnorePattern`
- `eslintRules['logical-assignment-operators'].slice(1)`

The shape of the rule option varies depending on the rule, so please check the contents by tracing the predefined rules each time and extract it.

### Custom Plugins

- **`eslintPluginTotalFunctions`**
    - `eslint-plugin-total-functions` with support for Flat Config
- **`eslintPluginTreeShakable`**
    - `eslint-plugin-tree-shakable` with support for Flat Config
- **`eslintPluginReactCodingStyle`**
    - Custom ESLint plugin that codifies this repository's React memo component conventions (namespace imports, `React.memo<Props>`, arrow props naming, etc.). See [`src/plugins/react-coding-style/README.md`](src/plugins/react-coding-style/README.md) for the rationale and examples.
    - Provides rules such as `react-coding-style/import-style`, `react-coding-style/component-var-type-annotation`, `react-coding-style/react-memo-type-parameter`, `react-coding-style/react-memo-props-argument-name`, `react-coding-style/props-type-annotation-style`, and `react-coding-style/react-hooks-definition-style`.
- **`eslintPluginTsRestrictions`** - Custom ESLint plugin with additional rules for TypeScript
    - Currently, this plugin only provides the `ts-restrictions/no-restricted-syntax` rule (which duplicates ESLint's `no-restricted-syntax` rule).
    - Can be used to set the error level to `error` or `warn` as needed.

Example:

```tsx
import {
    defineKnownRules,
    eslintRules,
    type FlatConfig,
} from 'eslint-config-typed';

export default [
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
] satisfies FlatConfig[];
```

### Type Definitions

All rules and configurations come with complete TypeScript type definitions:

#### Core Types

- **`FlatConfig`** - ESLint flat configuration type
    - `= DeepReadonly<import('@typescript-eslint/utils/ts-eslint').FlatConfig>`
- **`ESLintPlugin`** - ESLint plugin type
    - `= DeepReadonly<import('@typescript-eslint/utils/ts-eslint').FlatConfig.Plugin>`
- **`Rule`** - ESLint rule definition type
    - `= DeepReadonly<import('@eslint/core').RuleDefinition>`
- **`Rules`** - Collection of rules type
    - `= Readonly<Record<string, Rule>>`

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
    - **`EslintStylisticRules`** & **`EslintStylisticRulesOption`**
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

```tsx
import {
    defineKnownRules,
    eslintConfigForTypeScript,
    type FlatConfig,
    typescriptEslintRules,
    withDefaultOption,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default [
    ...eslintConfigForTypeScript({
        tsconfigRootDir: thisDir,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [thisDir],
    }),
    {
        rules: defineKnownRules({
            // Downgrade to warning (Option settings are inherited)
            '@typescript-eslint/no-explicit-any': withDefaultOption('warn'),
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
] satisfies FlatConfig[];
```

### Use RulesOptions Types

Leverage TypeScript for type-safe rule configuration:

```tsx
// configs/restricted-syntax-defs.mjs

import { eslintRules, type EslintRulesOption } from 'eslint-config-typed';

export const restrictedSyntax = [
    ...eslintRules['no-restricted-syntax'].slice(1),
    {
        // Restrict type annotation style for React.useMemo
        selector:
            "TSTypeAnnotation[parent.parent.type='CallExpression'][parent.parent.callee.object.name='React'][parent.parent.callee.property.name='useMemo']",
        message:
            'The variable type T should be annotated as `React.useMemo<T>` or `const v: T = React.useMemo(...)`.',
    },
] satisfies EslintRulesOption['no-restricted-syntax'];
```

```tsx
// eslint.config.mts

import {
    defineKnownRules,
    eslintConfigForTypeScript,
    type FlatConfig,
} from 'eslint-config-typed';
import { restrictedSyntax } from './restricted-syntax-defs.mjs';

const thisDir = import.meta.dirname;

export default [
    ...eslintConfigForTypeScript({
        tsconfigRootDir: thisDir,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [thisDir],
    }),
    {
        rules: defineKnownRules({
            'no-restricted-syntax': ['error', ...restrictedSyntax],
        }),
    },
] satisfies readonly FlatConfig[];
```

### Target Specific Files

Apply different rules to different file patterns:

```tsx
import {
    defineKnownRules,
    eslintConfigForTypeScript,
    type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default [
    ...eslintConfigForTypeScript({
        tsconfigRootDir: thisDir,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [thisDir],
    }),
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
            'import-x/no-unassigned-import': 'off',
        }),
    },
] satisfies FlatConfig[];
```

## Troubleshooting

### Common Issues

#### 1. ESLint can't find tsconfig.json

Ensure the paths are correct:

```tsx
import {
    eslintConfigForTypeScript,
    type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default eslintConfigForTypeScript({
    tsconfigRootDir: thisDir, // Must be absolute path
    tsconfigFileName: './tsconfig.json', // Relative to tsconfigRootDir
    packageDirs: [thisDir],
}) satisfies readonly FlatConfig[];
```

#### 2. Import resolution errors

The `packageDirs` option helps ESLint resolve imports correctly in monorepos:

```tsx
import {
    eslintConfigForTypeScript,
    type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [
        path.resolve(thisDir, '../../..'), // Monorepo root
        thisDir, // Current package
    ],
}) satisfies readonly FlatConfig[];
```

#### 3. Performance issues

For large projects, consider:

- Using `TIMING=1 eslint` to identify heavy rules
- Using `NODE_OPTIONS='--max-old-space-size=<memory-size-MB>' eslint` to increase the maximum memory available
- Separate heavy rules into a separate config and prepare a dedicated command
- Using `.eslintignore` or `ignores` patterns to skip generated files
- Running ESLint with `--cache` flag
- Limiting the scope of type-aware rules

#### 4. How to Use import-x/no-unused-modules

[`import-x/no-unused-modules`](https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-unused-modules.md) reports exported values that are never imported anywhere else. The rule still relies on ESLint’s classic configuration loader to discover ignore patterns, so a flat-config-only setup is not enough. For this to work, you need to place a `.eslintrc.cjs` file along with `eslint.config.mts`.

```cjs
// .eslintrc.cjs
module.exports = {
    ignorePatterns: ['**/node_modules/**', 'dist', '.eslintrc.cjs'],
};
```

The flat config then enables the rule for our source tree and marks the public federation module as an allowed unused export:

```ts
// eslint.config.mts (excerpt)
{
  files: ['src/**'],
  rules: defineKnownRules({
    'import-x/no-unused-modules': [
      'error',
      { unusedExports: true, ignoreExports: ['src/entry-point.mts'] },
    ],
  }),
},
```

With this configuration, you can run eslint and receive actionable diagnostic information when exports are no longer referenced. If you implement a library, add the file paths that define the variables, types, etc. that your library exports to the `ignoreExports` array so that the rule does not flag intentionally re-exported surfaces.

### Known Limitations

- Some type-aware rules may have performance impacts on very large codebases
- Flat config requires ESLint 9.0+ and may not be compatible with older tools

## Contributing

Contributions are welcome! Please check our [GitHub repository](https://github.com/noshiro-pf/eslint-config-typed) for:

- Issue reporting
- Feature requests
- Pull requests

## License

This project is licensed under the [Apache License 2.0](./LICENSE).
