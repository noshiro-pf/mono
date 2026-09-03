---
'ts-repo-utils': minor
---

Add `stripDevOnlyCode` and `stripDevOnlyCodeInDir`, which remove the code that only exists for the type checker and the test runner from an emitted JavaScript module: `expectType(...)` statements, `if (import.meta.vitest !== undefined) { ... }` blocks, the blocks and loops those removals emptied, the imports nothing refers to afterwards, and calls to the identity functions the caller names. Which functions to remove or unwrap is passed in; there is no default. Line breaks are kept so that the compiler's source map stays valid. A call the pass cannot remove is reported as an error rather than left in place.

`typescript` (`>=5.0.0 <7.0.0`) is now a dependency: the pass parses with the TypeScript compiler API, which `typescript@7` no longer ships, so the package brings its own copy rather than constraining the compiler its consumer builds with.
