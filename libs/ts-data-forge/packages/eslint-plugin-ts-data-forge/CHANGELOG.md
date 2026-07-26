# eslint-plugin-ts-data-forge

## 0.1.7

### Patch Changes

- 8ef64f1: chore(deps): bump actions/checkout from 7.0.0 to 7.0.1
- 37cedcb: chore(deps): bump actions/setup-node from 6.4.0 to 7.0.0
- 6cb1c29: chore(deps): bump anthropics/claude-code-action from 1.0.177 to 1.0.178
- Updated dependencies [8ef64f1]
- Updated dependencies [37cedcb]
- Updated dependencies [6cb1c29]
    - ts-data-forge@12.2.2

## 0.1.6

### Patch Changes

- 59bfcbe: Fix how dependencies are specified.
- Updated dependencies [59bfcbe]
    - ts-data-forge@12.2.1

## 0.1.5

### Patch Changes

- Updated dependencies [36b9be2]
    - ts-data-forge@12.2.0

## 0.1.4

### Patch Changes

- Updated dependencies [1bf4200]
    - ts-data-forge@12.1.0

## 0.1.3

### Patch Changes

- Updated dependencies [db6c5f5]
    - ts-data-forge@12.0.0

## 0.1.2

### Patch Changes

- Updated dependencies [aec5752]
- Updated dependencies [bf3466d]
    - ts-data-forge@11.0.1

## 0.1.0

### Minor Changes

- f947b42: Initial release of `eslint-plugin-ts-data-forge`: 16 auto-fixable ESLint rules that steer TypeScript code toward `ts-data-forge` idioms (array length guards, `Arr` array helpers, branded-number casts, safe parsing, non-null-object checks, canonical array slicing, and removal of unnecessary type guards). The rules target the `ts-data-forge` v11 API and are versioned together with `ts-data-forge`.

    The package also exports typed rule-entry definitions — `EslintTsDataForgeRules` and `EslintTsDataForgeRulesOption` — mirroring `eslint-config-typed`, so consumers can type-check their rule configuration. These are auto-generated from the rule implementations (option types are derived at the type level from each rule's `TSESLint.RuleModule` signature), so they always stay in sync with the actual rules.
