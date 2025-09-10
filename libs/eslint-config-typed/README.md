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
- [Configuration Examples](#configuration-examples)
    - [TypeScript + React Project](#typescript--react-project)
    - [Node.js TypeScript Project](#nodejs-typescript-project)
    - [React + Testing Libraries](#react--testing-libraries)
- [VS Code Integration](#vs-code-integration)
- [API Reference](#api-reference)
    - [Configuration Functions](#configuration-functions)
    - [Rule Collections](#rule-collections)
    - [Utility Exports](#utility-exports)
    - [Custom Plugins](#custom-plugins)
    - [Custom Rules](#custom-rules)
    - [Type Definitions](#type-definitions)
- [Customization](#customization)
    - [Override Specific Rules](#override-specific-rules)
    - [Use Type-Safe Rule Options](#use-type-safe-rule-options)
    - [Target Specific Files](#target-specific-files)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🎯 **Type-Safe Configuration**: Fully typed ESLint rules and configurations for better IDE support
- 📦 **Pre-configured Setups**: Ready-to-use configurations for TypeScript, React, Preact, and popular testing frameworks
- 🔧 **Custom Rules**: Additional custom ESLint rules for enhanced code quality
- 🚀 **Zero Configuration**: Works out of the box with sensible defaults
- 🔄 **ESLint Flat Config Support**: Built for the modern ESLint flat configuration system
- 📝 **Comprehensive Type Definitions**: Complete TypeScript types for all ESLint rules and options

## Requirements

- Node.js >= 18.0.0
- ESLint >= 9.0.0
- TypeScript >= 5.0.0 (for TypeScript projects)

## Installation

```sh
npm install --save-dev eslint-config-typed
# or
yarn add -D eslint-config-typed
# or
pnpm add -D eslint-config-typed
```

All required ESLint plugins and dependencies are automatically installed.

## Quick Start

Create an `eslint.config.js` file in your project root:

```js
import {
    eslintFlatConfigForTypeScript,
    eslintFlatConfigForVitest,
} from 'eslint-config-typed';
import * as path from 'node:path';
import * as url from 'node:url';

const thisDir = import.meta.dirname;
// or path.dirname(url.fileURLToPath(import.meta.url));

/** @returns {readonly import('eslint-config-typed').FlatConfig[]} */
const defineConfig = () => [
    {
        // config with just ignores is the replacement for `.eslintignore`
        ignores: ['**/build/**', '**/dist/**', 'src/some/file/to/ignore.ts'],
    },
    ...eslintFlatConfigForTypeScript({
        tsconfigRootDir: thisDir,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [thisDir],

        // If you are using mono repo and the root package.json is in ../../../ :
        // packageDirs: [path.resolve(thisDir, '../../..'), thisDir],
    }),
    eslintFlatConfigForVitest(),

    // You can override per-rule settings if necessary.
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/prefer-readonly-parameter-types': 'off',
            'react-hooks/exhaustive-deps': 'warn',
            'functional/no-let': ['error', noLetOptions],
        },
    },
];

/** @type {import('eslint-config-typed').EslintFunctionalRulesOption['functional/no-let']} */
const noLetOptions = {
    allowInForLoopInit: false,
    allowInFunctions: false,
    ignoreIdentifierPattern: ignorePattern.filter((p) => p !== '^draft'),
};

export default defineConfig();
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

## Configuration Examples

### TypeScript + React Project

```js
import {
    eslintFlatConfigForTypeScript,
    eslintFlatConfigForReact,
} from 'eslint-config-typed';
import * as path from 'node:path';
import * as url from 'node:url';

const thisDir = import.meta.dirname;

export default [
    { ignores: ['**/dist/**', '**/build/**', '**/.next/**'] },
    ...eslintFlatConfigForTypeScript({
        tsconfigRootDir: thisDir,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [thisDir],
    }),
    ...eslintFlatConfigForReact(),
];
```

### Node.js TypeScript Project

```js
import { eslintFlatConfigForTypeScript } from 'eslint-config-typed';
import * as path from 'node:path';
import * as url from 'node:url';

const thisDir = import.meta.dirname;

export default [
    { ignores: ['**/dist/**', '**/node_modules/**'] },
    ...eslintFlatConfigForTypeScript({
        tsconfigRootDir: thisDir,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [thisDir],
    }),
    {
        rules: {
            // Allow console in Node.js
            'no-console': 'off',
            // Allow process.env access
            'no-process-env': 'off',
        },
    },
];
```

### React + Testing Libraries

```js
import {
    eslintFlatConfigForTypeScript,
    eslintFlatConfigForReact,
    eslintFlatConfigForVitest,
    eslintFlatConfigForTestingLibrary,
} from 'eslint-config-typed';
import * as path from 'node:path';
import * as url from 'node:url';

const thisDir = import.meta.dirname;

export default [
    { ignores: ['**/dist/**', '**/coverage/**'] },
    ...eslintFlatConfigForTypeScript({
        tsconfigRootDir: thisDir,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [thisDir],
    }),
    ...eslintFlatConfigForReact(),
    eslintFlatConfigForVitest(),
    eslintFlatConfigForTestingLibrary(),
];
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

## API Reference

### Configuration Functions

These functions return arrays of ESLint flat configurations:

#### Framework Configurations

- **`eslintFlatConfigForTypeScript(options)`** - TypeScript configuration with strict type checking rules
    - `options.tsconfigRootDir`: Root directory containing tsconfig.json
    - `options.tsconfigFileName`: Path to tsconfig.json file
    - `options.packageDirs`: Array of package directories for import resolution
- **`eslintFlatConfigForReact(options?)`** - React configuration with hooks and JSX rules
- **`eslintFlatConfigForPreact(options?)`** - Preact configuration (lighter React alternative)
- **`eslintFlatConfigForReactBase(options?)`** - Base React configuration without specific framework rules

#### Testing Framework Configurations

- **`eslintFlatConfigForVitest(options?)`** - Vitest testing framework configuration
- **`eslintFlatConfigForJest(options?)`** - Jest testing framework configuration
- **`eslintFlatConfigForCypress(options?)`** - Cypress E2E testing configuration
- **`eslintFlatConfigForPlaywright(options?)`** - Playwright E2E testing configuration
- **`eslintFlatConfigForTestingLibrary(options?)`** - Testing Library configuration

#### Utility Configurations

- **`eslintFlatConfigForTypeScriptWithoutRules(options)`** - TypeScript parser setup without any rules

### Rule Collections

Pre-configured rule sets that can be imported and customized:

- **`eslintRules`** - Core ESLint rules
- **`typescriptEslintRules`** - TypeScript-specific ESLint rules
- **`eslintReactRules`** - React-specific rules
- **`eslintReactHooksRules`** - React Hooks rules
- **`eslintReactPerfRules`** - React performance optimization rules
- **`eslintReactRefreshRules`** - React Refresh (HMR) rules
- **`eslintJsxA11yRules`** - Accessibility rules for JSX
- **`eslintFunctionalRules`** - Functional programming style rules
- **`eslintImportsRules`** - Import/export rules
- **`eslintUnicornRules`** - Unicorn plugin rules for better code
- **`eslintPromiseRules`** - Promise handling rules
- **`eslintSecurityRules`** - Security best practices
- **`eslintArrayFuncRules`** - Array function preference rules
- **`eslintPreferArrowFunctionRules`** - Arrow function preference rules
- **`eslintTotalFunctionsRules`** - Total functions (no partial functions) rules
- **`eslintTreeShakableRules`** - Tree-shaking optimization rules
- **`eslintVitestRules`** - Vitest-specific rules
- **`eslintJestRules`** - Jest-specific rules
- **`eslintCypressRules`** - Cypress-specific rules
- **`eslintPlaywrightRules`** - Playwright-specific rules
- **`eslintTestingLibraryRules`** - Testing Library rules
- **`eslintStrictDependenciesRules`** - Strict dependency checking rules
- **`eslintPluginRules`** - Additional plugin rules

### Utility Exports

- **`restrictedSyntax`** - Array of restricted JavaScript syntax patterns
- **`restrictedGlobals`** - Array of restricted global variables
- **`restrictedGlobalsForFrontend`** - Frontend-specific restricted globals
- **`restrictedImportsOption`** - Configuration for restricted imports
- **`banTypes`** - TypeScript types that should be banned
- **`ignoredMutablePattern`** - Patterns for allowed mutable variables
- **`immutableDataOptions`** - Options for functional/immutable-data rule
- **`noLetOptions`** - Options for functional/no-let rule

### Custom Plugins

- **`eslintPluginCustom`** - Custom ESLint plugin with additional rules
- **`eslintPluginTotalFunctions`** - Plugin for enforcing total functions
- **`eslintPluginTreeShakable`** - Plugin for tree-shaking optimizations
- **`plugins`** - Collection of all available plugins

### Custom Rules

- **`noRestrictedSyntax`** - Enhanced restricted syntax rule
- **`importStarRule`** - Rule for controlling import \* usage
- **`noUnsafeOptionalPropertyAssignment`** - Prevent unsafe optional property assignments
- **`noPrematureFpTsEffects`** - Prevent premature fp-ts effect usage
- **`noPartialStringNormalize`** - Prevent partial string normalization
- **`noUnsafeMutableReadonlyAssignment`** - Prevent unsafe mutable/readonly assignments
- **`noPartialDivision`** - Prevent division by zero possibilities
- **`requireStrictMode`** - Enforce strict mode
- **`noEnums`** - Disallow TypeScript enums
- **`noPartialUrlConstructor`** - Prevent partial URL constructor usage
- **`noUnsafeTypeAssertion`** - Prevent unsafe type assertions
- **`noUnsafeEnumAssignment`** - Prevent unsafe enum assignments
- **`noUnsafeReadonlyMutableAssignment`** - Prevent readonly/mutable mismatches
- **`noNestedFpTsEffects`** - Prevent nested fp-ts effects
- **`noPartialArrayReduce`** - Prevent partial array reduce operations
- **`noHiddenTypeAssertions`** - Prevent hidden type assertions

### Type Definitions

All rules and configurations come with complete TypeScript type definitions:

#### Core Types

- **`FlatConfig`** - ESLint flat configuration type
- **`ESLintPlugin`** - ESLint plugin type
- **`Rule`** - ESLint rule definition type
- **`Rules`** - Collection of rules type
- **`RestrictedImportsOption`** - Type for restricted imports configuration

#### Rule Types

Each plugin provides typed rule definitions:

- **`EslintRules`** & **`EslintRulesOption`**
- **`TypeScriptEslintRules`** & **`TypeScriptEslintRulesOption`**
- **`EslintReactRules`** & **`EslintReactRulesOption`**
- **`EslintReactHooksRules`** & **`EslintReactHooksRulesOption`**
- **`EslintReactPerfRules`** & **`EslintReactPerfRulesOption`**
- **`EslintReactRefreshRules`** & **`EslintReactRefreshRulesOption`**
- **`EslintJsxA11yRules`** & **`EslintJsxA11yRulesOption`**
- **`EslintFunctionalRules`** & **`EslintFunctionalRulesOption`**
- **`EslintImportsRules`** & **`EslintImportsRulesOption`**
- **`EslintUnicornRules`** & **`EslintUnicornRulesOption`**
- **`EslintPromiseRules`** & **`EslintPromiseRulesOption`**
- **`EslintSecurityRules`** (no options)
- **`EslintArrayFuncRules`** (no options)
- **`EslintPreferArrowFunctionRules`** & **`EslintPreferArrowFunctionRulesOption`**
- **`EslintTotalFunctionsRules`** (no options)
- **`EslintTreeShakableRules`** (no options)
- **`EslintVitestRules`** & **`EslintVitestRulesOption`**
- **`EslintJestRules`** & **`EslintJestRulesOption`**
- **`EslintCypressRules`** & **`EslintCypressRulesOption`**
- **`EslintPlaywrightRules`** & **`EslintPlaywrightRulesOption`**
- **`EslintTestingLibraryRules`** & **`EslintTestingLibraryRulesOption`**
- **`EslintStrictDependenciesRules`** & **`EslintStrictDependenciesRulesOption`**
- **`EslintPluginRules`** & **`EslintPluginRulesOption`**
- **`EslintDeprecationRules`** (no options)

## Customization

### Override Specific Rules

You can override any rule by adding a configuration object after the preset configurations:

```js
export default [
    ...eslintFlatConfigForTypeScript(options),
    {
        rules: {
            // Downgrade to warning
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
        },
    },
];
```

### Use Type-Safe Rule Options

Leverage TypeScript for type-safe rule configuration:

```js
/** @type {import('eslint-config-typed').EslintFunctionalRulesOption['functional/no-let']} */
const noLetOptions = {
    allowInForLoopInit: false,
    allowInFunctions: false,
};

export default [
    ...eslintFlatConfigForTypeScript(options),
    {
        rules: {
            'functional/no-let': ['error', noLetOptions],
        },
    },
];
```

### Target Specific Files

Apply different rules to different file patterns:

```js
export default [
    ...eslintFlatConfigForTypeScript(options),
    {
        files: ['**/*.test.ts', '**/*.spec.ts'],
        rules: {
            // Allow any in tests
            '@typescript-eslint/no-explicit-any': 'off',
            // Allow console in tests
            'no-console': 'off',
        },
    },
    {
        files: ['**/scripts/**/*.ts'],
        rules: {
            // Allow console in scripts
            'no-console': 'off',
            'no-process-exit': 'off',
        },
    },
];
```

## Troubleshooting

### Common Issues

#### 1. ESLint can't find tsconfig.json

Ensure the paths are correct:

```js
const thisDir = import.meta.dirname;

...eslintFlatConfigForTypeScript({
    tsconfigRootDir: thisDir, // Must be absolute path
    tsconfigFileName: './tsconfig.json', // Relative to tsconfigRootDir
    packageDirs: [thisDir],
})
```

#### 2. Import resolution errors

The `packageDirs` option helps ESLint resolve imports correctly in monorepos:

```js
...eslintFlatConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [
        path.resolve(thisDir, '../../..'), // Monorepo root
        thisDir, // Current package
    ],
})
```

#### 3. Rule conflicts

If you encounter rule conflicts, the last configuration wins. Place your overrides after the preset configurations.

#### 4. Performance issues

For large projects, consider:

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

## Future Updates

- Enhanced support for `eslint-plugin-functional`
    - Migration from `functional/prefer-readonly-type` to `functional/prefer-immutable-types` and `functional/type-declaration-immutability`
