[**eslint-config-typed**](../README.md)

***

[eslint-config-typed](../README.md) / rules/eslint-import-rules

# rules/eslint-import-rules

## Variables

### eslintImportsRules

> `const` **eslintImportsRules**: `object`

Defined in: [src/rules/eslint-import-rules.mts:3](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/rules/eslint-import-rules.mts#L3)

#### Type Declaration

##### import/consistent-type-specifier-style

> `readonly` **import/consistent-type-specifier-style**: readonly \[`"error"`, `"prefer-inline"`\]

##### import/default

> `readonly` **import/default**: `"error"` = `'error'`

##### import/dynamic-import-chunkname

> `readonly` **import/dynamic-import-chunkname**: `1` \| `2`

##### import/enforce-node-protocol-usage

> `readonly` **import/enforce-node-protocol-usage**: readonly \[`"error"`, `"always"`\]

##### import/export

> `readonly` **import/export**: `"error"` = `'error'`

##### import/exports-last

> `readonly` **import/exports-last**: `"off"` = `'off'`

##### import/extensions

> `readonly` **import/extensions**: readonly \[`"error"`, `"never"`, \{ `pattern`: \{ `json`: `"always"`; `mjs`: `"always"`; \}; \}\]

##### import/first

> `readonly` **import/first**: readonly \[`"error"`, `"absolute-first"`\]

##### import/group-exports

> `readonly` **import/group-exports**: `"off"` = `'off'`

##### import/imports-first

> `readonly` **import/imports-first**: `0` = `0`

##### import/max-dependencies

> `readonly` **import/max-dependencies**: `"off"` = `'off'`

##### import/named

> `readonly` **import/named**: `"off"` = `'off'`

##### import/namespace

> `readonly` **import/namespace**: `1` \| `2`

##### import/newline-after-import

> `readonly` **import/newline-after-import**: readonly \[`"error"`, \{ `considerComments`: `true`; `count`: `1`; \}\]

##### import/no-absolute-path

> `readonly` **import/no-absolute-path**: `1` \| `2`

##### import/no-amd

> `readonly` **import/no-amd**: `"error"` = `'error'`

##### import/no-anonymous-default-export

> `readonly` **import/no-anonymous-default-export**: `1` \| `2`

##### import/no-commonjs

> `readonly` **import/no-commonjs**: `"off"` = `'off'`

##### import/no-cycle

> `readonly` **import/no-cycle**: `1` \| `2`

##### import/no-default-export

> `readonly` **import/no-default-export**: `"error"` = `'error'`

Prohibit default exports as renaming on the definition side is not
reflected on the import side

##### import/no-deprecated

> `readonly` **import/no-deprecated**: `"off"` = `'off'`

##### import/no-duplicates

> `readonly` **import/no-duplicates**: `1` \| `2`

##### import/no-dynamic-require

> `readonly` **import/no-dynamic-require**: `1` \| `2`

##### import/no-empty-named-blocks

> `readonly` **import/no-empty-named-blocks**: `"error"` = `'error'`

##### import/no-extraneous-dependencies

> `readonly` **import/no-extraneous-dependencies**: `"off"` = `'off'`

##### import/no-import-module-exports

> `readonly` **import/no-import-module-exports**: `"off"` = `'off'`

##### import/no-internal-modules

> `readonly` **import/no-internal-modules**: readonly \[`"error"`, \{ `allow`: readonly \[`"*/index.js"`, `"*/index.mjs"`, `"*/index.cjs"`, `"rxjs/operators"`, `"solid-js/web"`, `"@testing-library/jest-dom/**"`, `"react-dom/client"`, `"preact/**"`, `"immer/**"`, `"firebase/*"`, `"firebase-functions/**"`, `"@blueprintjs/*"`, `"@material-ui/**"`, `"@mui/material/**"`, `"@fontsource/**"`, `"resize-observer/lib/ResizeObserverEntry"`, `"vitest/config"`, `"zx/globals"`\]; \}\]

##### import/no-mutable-exports

> `readonly` **import/no-mutable-exports**: `"error"` = `'error'`

##### import/no-named-as-default

> `readonly` **import/no-named-as-default**: `"error"` = `'error'`

##### import/no-named-as-default-member

> `readonly` **import/no-named-as-default-member**: `"error"` = `'error'`

##### import/no-named-default

> `readonly` **import/no-named-default**: `"off"` = `'off'`

##### import/no-named-export

> `readonly` **import/no-named-export**: `"off"` = `'off'`

##### import/no-namespace

> `readonly` **import/no-namespace**: `"off"` = `'off'`

##### import/no-nodejs-modules

> `readonly` **import/no-nodejs-modules**: `"off"` = `'off'`

##### import/no-relative-packages

> `readonly` **import/no-relative-packages**: `1` \| `2`

##### import/no-relative-parent-imports

> `readonly` **import/no-relative-parent-imports**: `"off"` = `'off'`

##### import/no-restricted-paths

> `readonly` **import/no-restricted-paths**: `"off"` = `'off'`

##### import/no-self-import

> `readonly` **import/no-self-import**: `"error"` = `'error'`

##### import/no-unassigned-import

> `readonly` **import/no-unassigned-import**: readonly \[`"error"`, \{ `allow`: readonly \[`"**/*.css"`, `"@testing-library/jest-dom/**"`, `"solid-js"`, `"zx/globals"`\]; \}\]

##### import/no-unresolved

> `readonly` **import/no-unresolved**: `"off"` = `'off'`

##### import/no-unused-modules

> `readonly` **import/no-unused-modules**: `"off"` = `'off'`

##### import/no-useless-path-segments

> `readonly` **import/no-useless-path-segments**: `1` \| `2`

##### import/no-webpack-loader-syntax

> `readonly` **import/no-webpack-loader-syntax**: `"error"` = `'error'`

##### import/order

> `readonly` **import/order**: `"off"` = `'off'`

##### import/prefer-default-export

> `readonly` **import/prefer-default-export**: `"off"` = `'off'`

##### import/unambiguous

> `readonly` **import/unambiguous**: `"error"` = `'error'`
