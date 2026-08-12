---
'eslint-config-typed': patch
'eslint-plugin-ts-data-forge': patch
---

Stop claiming to work with TypeScript 7. Both packages import the TypeScript
compiler API, which version 7 no longer provides, so a consumer installing the
declared peer range `>=5.0.0` and getting 7 hit

```text
SyntaxError: The requested module 'typescript' does not provide an export named 'SyntaxKind'
TypeError: Cannot read properties of undefined (reading 'Any')
```

at load time, before any rule ran. The range is now `>=5.0.0 <7.0.0`.
