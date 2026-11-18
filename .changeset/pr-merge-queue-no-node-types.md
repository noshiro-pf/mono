---
'pr-merge-queue': minor
---

The published declarations no longer import `node:util`, so a consumer without `@types/node` can compile against them with `skipLibCheck` off, given the `DOM` lib (TypeScript's default) for the `AbortSignal` that `pause` names. `parseCommandArgs` types its options and values with the package's own `CommandOption`, `CommandOptions` and `CommandValues`, which follow `util.parseArgs`, with three differences: the values are read-only, a flag's `default` must have the flag's type, with none for a `multiple` flag, and only a `multiple` flag may be typed as either `'string'` or `'boolean'`.
