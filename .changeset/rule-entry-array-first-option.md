---
'eslint-config-typed': patch
---

A rule whose `meta.schema` is an array with one array-valued option now takes that option as one element of its entry, as ESLint does: `'n/callback-return': ['error', ['done', 'next']]` type-checks and `['error', 'done', 'next']`, which ESLint refuses at load, no longer does. The same goes for `n/no-restricted-import`, `n/no-restricted-require`, `playwright/no-restricted-locators`, `playwright/no-restricted-roles`, `eslint-plugin/meta-property-ordering`, `eslint-plugin/test-case-property-ordering` and `react/no-invalid-html-attribute`. Rules whose schema is a single object, such as `consistent-this`, still spread their options. For these eight rules, `['error']` with no option no longer type-checks, as is already the case for every other rule with positional options; write `'error'`.
