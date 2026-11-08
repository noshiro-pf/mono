---
'eslint-config-typed': minor
---

Add `ts-restrictions/no-optional-phantom-property`, enabled as an error: an optional property keyed by a type-only symbol (`declare const tag: unique symbol`) is satisfied by every value that lacks it, so the claim it stands for is never checked. Make the marker required, or put the claim in a type the implementation must produce.
