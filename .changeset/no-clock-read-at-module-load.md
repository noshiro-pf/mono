---
'eslint-config-typed': minor
---

Add `ts-restrictions/no-clock-read-at-module-load`, on by default: it reports `Date.now()`, `new Date()` with no argument, and the callees named in its `functions` option, when the call runs as the module loads, which keeps that moment for as long as the module lives.
