[**eslint-config-typed**](../README.md)

***

[eslint-config-typed](../README.md) / rules/eslint-react-rules

# rules/eslint-react-rules

## Variables

### eslintReactRules

> `const` **eslintReactRules**: `object`

Defined in: [src/rules/eslint-react-rules.mts:3](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/rules/eslint-react-rules.mts#L3)

#### Type Declaration

##### react/boolean-prop-naming

> `readonly` **react/boolean-prop-naming**: `1` \| `2`

##### react/button-has-type

> `readonly` **react/button-has-type**: `1` \| `2`

##### react/checked-requires-onchange-or-readonly

> `readonly` **react/checked-requires-onchange-or-readonly**: `1` \| `2`

##### react/default-props-match-prop-types

> `readonly` **react/default-props-match-prop-types**: `1` \| `2`

##### react/destructuring-assignment

> `readonly` **react/destructuring-assignment**: `1` \| `2`

Enforce consistent usage of props destructuring.

##### react/display-name

> `readonly` **react/display-name**: `1` \| `2`

##### react/forbid-component-props

> `readonly` **react/forbid-component-props**: readonly \[`"error"`, \{ `forbid`: readonly \[`"className"`\]; \}\]

##### react/forbid-dom-props

> `readonly` **react/forbid-dom-props**: `1` \| `2`

##### react/forbid-elements

> `readonly` **react/forbid-elements**: `1` \| `2`

##### react/forbid-foreign-prop-types

> `readonly` **react/forbid-foreign-prop-types**: `1` \| `2`

##### react/forbid-prop-types

> `readonly` **react/forbid-prop-types**: `1` \| `2`

##### react/forward-ref-uses-ref

> `readonly` **react/forward-ref-uses-ref**: `"error"` = `'error'`

##### react/function-component-definition

> `readonly` **react/function-component-definition**: readonly \[`"error"`, \{ `namedComponents`: `"arrow-function"`; `unnamedComponents`: `"arrow-function"`; \}\]

##### react/hook-use-state

> `readonly` **react/hook-use-state**: `"off"` = `'off'`

##### react/iframe-missing-sandbox

> `readonly` **react/iframe-missing-sandbox**: `"error"` = `'error'`

##### react/jsx-boolean-value

> `readonly` **react/jsx-boolean-value**: readonly \[`"error"`, `"never"`\]

##### react/jsx-child-element-spacing

> `readonly` **react/jsx-child-element-spacing**: `"off"` = `'off'`

Disable in favor of prettier

###### Link

https://github.com/prettier/eslint-config-prettier/blob/main/index.js

##### react/jsx-closing-bracket-location

> `readonly` **react/jsx-closing-bracket-location**: `"off"` = `'off'`

##### react/jsx-closing-tag-location

> `readonly` **react/jsx-closing-tag-location**: `"off"` = `'off'`

##### react/jsx-curly-brace-presence

> `readonly` **react/jsx-curly-brace-presence**: readonly \[`"error"`, `"always"`\]

##### react/jsx-curly-newline

> `readonly` **react/jsx-curly-newline**: `"off"` = `'off'`

##### react/jsx-curly-spacing

> `readonly` **react/jsx-curly-spacing**: `"off"` = `'off'`

##### react/jsx-equals-spacing

> `readonly` **react/jsx-equals-spacing**: `"off"` = `'off'`

##### react/jsx-filename-extension

> `readonly` **react/jsx-filename-extension**: readonly \[`"error"`, \{ `extensions`: readonly \[`".tsx"`\]; \}\]

Enforce consistent file naming

##### react/jsx-first-prop-new-line

> `readonly` **react/jsx-first-prop-new-line**: `"off"` = `'off'`

##### react/jsx-fragments

> `readonly` **react/jsx-fragments**: `1` \| `2`

##### react/jsx-handler-names

> `readonly` **react/jsx-handler-names**: `"off"` = `'off'`

##### react/jsx-indent

> `readonly` **react/jsx-indent**: `"off"` = `'off'`

##### react/jsx-indent-props

> `readonly` **react/jsx-indent-props**: `"off"` = `'off'`

##### react/jsx-key

> `readonly` **react/jsx-key**: `1` \| `2`

##### react/jsx-max-depth

> `readonly` **react/jsx-max-depth**: `"off"` = `'off'`

##### react/jsx-max-props-per-line

> `readonly` **react/jsx-max-props-per-line**: `"off"` = `'off'`

##### react/jsx-newline

> `readonly` **react/jsx-newline**: `"off"` = `'off'`

##### react/jsx-no-bind

> `readonly` **react/jsx-no-bind**: `1` \| `2`

Prohibit inline callback functions in JSX. Fix: Use React.useCallback.

##### react/jsx-no-comment-textnodes

> `readonly` **react/jsx-no-comment-textnodes**: `"error"` = `'error'`

##### react/jsx-no-constructed-context-values

> `readonly` **react/jsx-no-constructed-context-values**: `"error"` = `'error'`

##### react/jsx-no-duplicate-props

> `readonly` **react/jsx-no-duplicate-props**: `1` \| `2`

##### react/jsx-no-leaked-render

> `readonly` **react/jsx-no-leaked-render**: readonly \[`"error"`, \{ `validStrategies`: readonly \[`"ternary"`\]; \}\]

##### react/jsx-no-literals

> `readonly` **react/jsx-no-literals**: `1` \| `2`

Avoid writing strings directly in JSX, enforce using `<div>{"aaa"}</div>`
format. Benefits: Easier to catch missing `{}` around variables, better
syntax highlighting for readability.

##### react/jsx-no-script-url

> `readonly` **react/jsx-no-script-url**: `1` \| `2`

##### react/jsx-no-target-blank

> `readonly` **react/jsx-no-target-blank**: `1` \| `2`

##### react/jsx-no-undef

> `readonly` **react/jsx-no-undef**: `1` \| `2`

##### react/jsx-no-useless-fragment

> `readonly` **react/jsx-no-useless-fragment**: readonly \[`"error"`, \{ `allowExpressions`: `true`; \}\]

##### react/jsx-one-expression-per-line

> `readonly` **react/jsx-one-expression-per-line**: `"off"` = `'off'`

##### react/jsx-pascal-case

> `readonly` **react/jsx-pascal-case**: `1` \| `2`

##### react/jsx-props-no-multi-spaces

> `readonly` **react/jsx-props-no-multi-spaces**: `"off"` = `'off'`

##### react/jsx-props-no-spread-multi

> `readonly` **react/jsx-props-no-spread-multi**: `"error"` = `'error'`

##### react/jsx-props-no-spreading

> `readonly` **react/jsx-props-no-spreading**: `1` \| `2`

Avoid `{...props}` spread as it weakens type checking for props
excess/shortage

##### react/jsx-sort-default-props

> `readonly` **react/jsx-sort-default-props**: `0` = `0`

##### react/jsx-sort-props

> `readonly` **react/jsx-sort-props**: readonly \[`"error"`, \{ `callbacksLast`: `true`; `reservedFirst`: `true`; \}\]

##### react/jsx-space-before-closing

> `readonly` **react/jsx-space-before-closing**: `0` = `0`

##### react/jsx-tag-spacing

> `readonly` **react/jsx-tag-spacing**: `"off"` = `'off'`

##### react/jsx-uses-react

> `readonly` **react/jsx-uses-react**: `"off"` = `'off'`

##### react/jsx-uses-vars

> `readonly` **react/jsx-uses-vars**: `"error"` = `'error'`

Enforce consistent file naming

##### react/jsx-wrap-multilines

> `readonly` **react/jsx-wrap-multilines**: `"off"` = `'off'`

##### react/no-access-state-in-setstate

> `readonly` **react/no-access-state-in-setstate**: `"error"` = `'error'`

##### react/no-adjacent-inline-elements

> `readonly` **react/no-adjacent-inline-elements**: `"error"` = `'error'`

##### react/no-array-index-key

> `readonly` **react/no-array-index-key**: `"error"` = `'error'`

##### react/no-arrow-function-lifecycle

> `readonly` **react/no-arrow-function-lifecycle**: `"error"` = `'error'`

##### react/no-children-prop

> `readonly` **react/no-children-prop**: `1` \| `2`

##### react/no-danger

> `readonly` **react/no-danger**: `1` \| `2`

##### react/no-danger-with-children

> `readonly` **react/no-danger-with-children**: `"error"` = `'error'`

##### react/no-deprecated

> `readonly` **react/no-deprecated**: `"error"` = `'error'`

##### react/no-did-mount-set-state

> `readonly` **react/no-did-mount-set-state**: `1` \| `2`

##### react/no-did-update-set-state

> `readonly` **react/no-did-update-set-state**: `1` \| `2`

##### react/no-direct-mutation-state

> `readonly` **react/no-direct-mutation-state**: `"error"` = `'error'`

##### react/no-find-dom-node

> `readonly` **react/no-find-dom-node**: `"error"` = `'error'`

##### react/no-invalid-html-attribute

> `readonly` **react/no-invalid-html-attribute**: `1` \| `2`

##### react/no-is-mounted

> `readonly` **react/no-is-mounted**: `"error"` = `'error'`

##### react/no-multi-comp

> `readonly` **react/no-multi-comp**: readonly \[`"error"`, \{ `ignoreStateless`: `true`; \}\]

##### react/no-namespace

> `readonly` **react/no-namespace**: `"error"` = `'error'`

##### react/no-object-type-as-default-prop

> `readonly` **react/no-object-type-as-default-prop**: `"error"` = `'error'`

##### react/no-redundant-should-component-update

> `readonly` **react/no-redundant-should-component-update**: `"error"` = `'error'`

##### react/no-render-return-value

> `readonly` **react/no-render-return-value**: `"error"` = `'error'`

##### react/no-set-state

> `readonly` **react/no-set-state**: `"error"` = `'error'`

##### react/no-string-refs

> `readonly` **react/no-string-refs**: `1` \| `2`

##### react/no-this-in-sfc

> `readonly` **react/no-this-in-sfc**: `"error"` = `'error'`

##### react/no-typos

> `readonly` **react/no-typos**: `"error"` = `'error'`

##### react/no-unescaped-entities

> `readonly` **react/no-unescaped-entities**: `1` \| `2`

##### react/no-unknown-property

> `readonly` **react/no-unknown-property**: readonly \[`"error"`, \{ `ignore`: readonly \[`"css"`\]; \}\]

##### react/no-unsafe

> `readonly` **react/no-unsafe**: `1` \| `2`

##### react/no-unstable-nested-components

> `readonly` **react/no-unstable-nested-components**: `1` \| `2`

##### react/no-unused-class-component-methods

> `readonly` **react/no-unused-class-component-methods**: `"error"` = `'error'`

##### react/no-unused-prop-types

> `readonly` **react/no-unused-prop-types**: `1` \| `2`

##### react/no-unused-state

> `readonly` **react/no-unused-state**: `"error"` = `'error'`

##### react/no-will-update-set-state

> `readonly` **react/no-will-update-set-state**: `1` \| `2`

##### react/prefer-es6-class

> `readonly` **react/prefer-es6-class**: `1` \| `2`

##### react/prefer-exact-props

> `readonly` **react/prefer-exact-props**: `"error"` = `'error'`

##### react/prefer-read-only-props

> `readonly` **react/prefer-read-only-props**: `"error"` = `'error'`

##### react/prefer-stateless-function

> `readonly` **react/prefer-stateless-function**: `1` \| `2`

##### react/prop-types

> `readonly` **react/prop-types**: `"off"` = `'off'`

Not needed with TypeScript

##### react/react-in-jsx-scope

> `readonly` **react/react-in-jsx-scope**: `"off"` = `'off'`

##### react/require-default-props

> `readonly` **react/require-default-props**: `1` \| `2`

##### react/require-optimization

> `readonly` **react/require-optimization**: `1` \| `2`

##### react/require-render-return

> `readonly` **react/require-render-return**: `"error"` = `'error'`

##### react/self-closing-comp

> `readonly` **react/self-closing-comp**: `1` \| `2`

##### react/sort-comp

> `readonly` **react/sort-comp**: `1` \| `2`

##### react/sort-default-props

> `readonly` **react/sort-default-props**: `1` \| `2`

##### react/sort-prop-types

> `readonly` **react/sort-prop-types**: `1` \| `2`

##### react/state-in-constructor

> `readonly` **react/state-in-constructor**: `1` \| `2`

##### react/static-property-placement

> `readonly` **react/static-property-placement**: `1` \| `2`

##### react/style-prop-object

> `readonly` **react/style-prop-object**: `1` \| `2`

##### react/void-dom-elements-no-children

> `readonly` **react/void-dom-elements-no-children**: `"error"` = `'error'`
