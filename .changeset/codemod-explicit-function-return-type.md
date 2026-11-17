---
'ts-codemod-lib': minor
'ts-codemod-cli': minor
---

New transformer `enable-explicit-function-return-type` (`enableExplicitFunctionReturnTypeTransformer`) writes the return type the compiler infers onto every function `@typescript-eslint/explicit-function-return-type` reports, taking the rule's options, so that the rule can be turned on in an existing codebase. It imports types from other modules with `import type`, restores type aliases the checker forgets (`type Point = Readonly<{ … }>`), keeps inferred type predicates, and leaves a function alone when its type contains `any` or cannot be written without changing what a name means. `createProjectTransformer` checks files as part of the project a `tsconfig.json` describes, so that types from other modules resolve; the CLI exposes it as `--project`, and passes a transformer its options with `--transformer-options`.
