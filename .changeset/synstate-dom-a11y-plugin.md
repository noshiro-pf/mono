---
'eslint-config-typed': minor
---

The `synstate-dom-a11y/` rules, jsx-a11y's rules reading an attribute bound to synstate-dom's `constant(x)` as bound to `x`, move into a plugin of their own, `eslint-plugin-synstate-dom-a11y`, which this package depends on and registers under `synstate-dom-a11y` as before; the rule ids and `eslintConfigForSynstateDom` are unchanged. The plugin is exported as `eslintPluginSynstateDomA11y`, and `withSynstateDomConstants` is re-exported from it.
