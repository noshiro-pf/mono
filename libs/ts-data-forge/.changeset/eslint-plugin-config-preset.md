---
'eslint-plugin-ts-data-forge': minor
---

Ship a `recommended` config preset. `eslintPluginTsDataForge.configs.recommended`
is a flat-config object that registers the plugin and enables every rule at
`error`, so consuming projects can start from:

```ts
export default [eslintPluginTsDataForge.configs.recommended];
```

The preset registers the exported plugin object itself, so listing the plugin in
your own `plugins` record alongside the preset does not trigger ESLint's
`Cannot redefine plugin` error.

Also exports the `ESLintFlatConfig` type alongside the existing `ESLintPlugin`.
