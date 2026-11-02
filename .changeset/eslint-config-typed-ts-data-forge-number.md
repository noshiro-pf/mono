---
'eslint-config-typed': patch
---

`import-x/no-internal-modules` allows `ts-data-forge/number`, the subpath ts-data-forge now exports for bundles that should keep only the `Num` functions they call.
