**eslint-config-typed**

---

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

This project is licensed under the [Apache License 2.0](_media/LICENSE).

## Future Updates

- Enhanced support for `eslint-plugin-functional`
    - Migration from `functional/prefer-readonly-type` to `functional/prefer-immutable-types` and `functional/type-declaration-immutability`

## Modules

- [configs](configs.md)
- [configs/cypress](configs/cypress.md)
- [configs/jest](configs/jest.md)
- [configs/playwright](configs/playwright.md)
- [configs/plugins](configs/plugins.md)
- [configs/preact](configs/preact.md)
- [configs/react](configs/react.md)
- [configs/react-base](configs/react-base.md)
- [configs/testing-library](configs/testing-library.md)
- [configs/typescript](configs/typescript.md)
- [configs/typescript-without-rules](configs/typescript-without-rules.md)
- [configs/vitest](configs/vitest.md)
- [custom-rules](custom-rules.md)
- [custom-rules/custom](custom-rules/custom.md)
- [custom-rules/no-restricted-syntax2](custom-rules/no-restricted-syntax2.md)
- [globals](globals.md)
- [plugins](plugins.md)
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
- [types/flat-config](types/flat-config.md)
- [types/rules](types/rules.md)
- [types/rules/eslint-array-func-rules](types/rules/eslint-array-func-rules.md)
- [types/rules/eslint-cypress-rules](types/rules/eslint-cypress-rules.md)
- [types/rules/eslint-functional-rules](types/rules/eslint-functional-rules.md)
- [types/rules/eslint-import-rules](types/rules/eslint-import-rules.md)
- [types/rules/eslint-jest-rules](types/rules/eslint-jest-rules.md)
- [types/rules/eslint-jsx-a11y-rules](types/rules/eslint-jsx-a11y-rules.md)
- [types/rules/eslint-playwright-rules](types/rules/eslint-playwright-rules.md)
- [types/rules/eslint-plugin-rules](types/rules/eslint-plugin-rules.md)
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
- [types/types](types/types.md)
