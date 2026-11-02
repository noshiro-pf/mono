---
'eslint-config-typed': patch
---

`import-x/no-internal-modules` allows `ts-data-forge/array`, the subpath ts-data-forge now exports for bundles that should keep only the `Arr` functions they call.
