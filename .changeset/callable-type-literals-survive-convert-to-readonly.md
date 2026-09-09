---
'ts-codemod-lib': patch
---

Leave a type literal that declares a call or construct signature unwrapped in `convert-to-readonly`.

`Readonly<T>` is a mapped type over `keyof T`, and neither signature kind is a property, so neither survives the mapping. Wrapping an annotation such as

```ts
const panic: {
    (message: string, options?: { cause?: unknown }): never;
    (error: Error): never;
} = impl;
```

produced a value that is no longer callable — `TS2349` at every call site, and `TS2366` after it wherever the `never` return was what terminated the control flow. A literal mixing properties with a call signature was worse: the properties came through and only the signature disappeared.

Such a literal is now marked `readonly` member by member instead of being wrapped, which is what interfaces have always done, and is skipped by the union/intersection grouping that joins type literals under a single `Readonly<...>`. Everything inside it — parameter and return types, property types — is still converted.
