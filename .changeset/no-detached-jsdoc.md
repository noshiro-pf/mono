---
'eslint-config-typed': minor
'ts-data-forge': patch
---

`eslint-config-typed`: add `ts-restrictions/no-detached-jsdoc` (`error` in the TypeScript config), which reports a `/** … */` block that TypeScript attaches to no node — one left above another block, at the end of a file or a block, inside an expression, on a JSX attribute or a call argument — so that an editor shows it nowhere. A top-level block with only imports before it and a blank line after it, or with `@module` / `@packageDocumentation` / `@file` / `@fileoverview`, is left alone as the module's documentation. The generated rule option types no longer leave their `### schema` block detached above the `Options` description: the two are one block.

`ts-data-forge`: the documentation of `NumberClass` in the refined number utilities is attached to it again.
