---
'eslint-plugin-synstate': minor
'eslint-config-typed': minor
---

eslint-plugin-synstate gains `no-unfocusable-focus-handler`, which reports
`onFocus` / `onBlur` on an intrinsic element that cannot take the focus itself
and suggests the bubbling `onFocusIn` / `onFocusOut`: synstate-dom binds the
DOM's `focus` and `blur` events, which do not bubble, so on a wrapper they never
run. It is for synstate-dom code alone, so it is not in `recommended` but in a
new `synstate-dom` preset (`eslintPluginSynstate.configs['synstate-dom']`).

eslint-config-typed's `eslintConfigForSynstateDom` turns it on, and
eslint-config-typed now depends on eslint-plugin-synstate, registered as
`synstate`.
