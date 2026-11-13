---
'eslint-config-typed': minor
---

`ts-restrictions/jsx-boolean-logical-operands` and `ts-restrictions/require-ime-guard-on-enter` move to a plugin of their own, `eslint-plugin-ts-ui-restrictions`, as `ts-ui-restrictions/jsx-boolean-logical-operands` and `ts-ui-restrictions/require-ime-guard` (it checks Escape as well as Enter). `ts-restrictions` keeps the rules about TypeScript code in general; the new plugin holds those about code that runs a user interface. This package depends on the new one, registers it under `ts-ui-restrictions`, exports it as `eslintPluginTsUiRestrictions`, and turns both rules on through the new `eslintTsUiRestrictionsRules`, as it turned them on before.

The old ids stay registered until the next major, deprecated and off in the presets, so that a config or an `eslint-disable` comment naming one still loads; rename them to the new ids. A config that sets an old id to `error` runs the rule twice. In a config typed with `defineKnownRules` or `EslintTsRestrictionsRules`, an old id accepts only `0`, as every deprecated rule does: one that sets it to `'off'` or gives it options no longer type-checks until it names the new id.
