---
'eslint-config-typed': minor
---

`eslintConfigForSynstateDom(files?)` brings the jsx-a11y rules of `eslintConfigForReact` to components written with synstate-dom, registered a second time under `synstate-dom-a11y/` (rule set `eslintSynstateDomA11yRules`). Those rules read an attribute bound to synstate-dom's `constant(x)` as bound to `x`, so `role={constant('button')}` counts as a role and `aria-hidden={constant('yes')}` is reported; the element's other attributes, and those of the elements around and inside it, are read the same way. A child in `{...}` is read as React's is, as content jsx-a11y does not look into, and an attribute's name is read as written (`autofocus`, not React's `autoFocus`). `jsx-a11y` itself is registered unchanged.
