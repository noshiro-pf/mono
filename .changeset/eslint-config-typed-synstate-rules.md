---
'eslint-config-typed': major
---

The rule types of eslint-plugin-synstate follow its rebuild for the new synstate: `synstate/prefer-map-to` and `synstate/prefer-derive` are gone, and `synstate/no-constant-map` is added. A configuration that names either removed rule no longer type-checks; `no-constant-map` replaces `prefer-map-to`, and `prefer-derive` has no successor, since `combine` is gone.
