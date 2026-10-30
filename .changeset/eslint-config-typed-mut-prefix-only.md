---
'eslint-config-typed': major
---

`mut_` is the only prefix that marks a variable or property name as mutable, as in ts-codemod-lib 4.0.0 (which also leaves type names starting with `Mutable` mutable; no ESLint rule here reads type names).

- `functional/immutable-data` no longer ignores names starting with `draft`, `_mut_` or `#mut_`, and `functional/no-let` (which never ignored `draft`) those starting with `_mut_` or `#mut_`; `ignoreIdentifierPattern` is `['^mut_']` for both (plus `this`, `super` and `window.location.href` for `immutable-data`). Rename an immer recipe's `draft` to `mut_draft`, and `_mut_x` to `mut_x`. `^#mut_` matched no identifier, since a private name is never the root of a member chain; a private field is written inside its class, which `ignoreClasses: true` exempts.
- Remove the rules `total-functions/no-unsafe-enum-assignment` and `total-functions/no-unsafe-optional-property-assignment`. Both were deprecated and did nothing; they were registered, and switched off in `eslintTotalFunctionsRules`, only so that a configuration naming them kept loading. Delete any mention of them from your configuration.
