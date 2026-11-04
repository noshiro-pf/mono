---
'ts-codemod-lib': patch
---

`convert-to-readonly` keeps a comment that sits just before the `)` of a parenthesized type it unwraps, such as `(A /* x */) | (B)` or `(A /* x */)`, and one just before the `>` of an `Array<T>` / `ReadonlyArray<T>` it rewrites, such as `Array<(A | B /* x */)>`. Both were dropped. Where the comment breaks the line (a `// ...` comment, or a `/* ... */` one spanning lines) and the `)` is followed by an array's `[]`, an indexed access's `[K]` or a conditional type's `extends`, the parentheses stay: TypeScript reads those only on the line of the type before them.
