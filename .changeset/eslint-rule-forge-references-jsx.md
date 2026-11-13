---
'eslint-rule-forge': minor
---

Add `isSameReference` (whether two expressions name the same variable or property, `x.y` and `x['y']` alike, through type wrappers), `staticPropertyName` (the name a member access reads when it is known statically) and `jsxValuePositionOf` (whether a node's value is rendered as a JSX child or passed as an attribute's value), which `eslint-plugin-ts-restrictions` and `eslint-plugin-ts-ui-restrictions` both use.
