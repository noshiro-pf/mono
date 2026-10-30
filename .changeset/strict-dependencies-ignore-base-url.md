---
'eslint-config-typed': major
---

`strict-dependencies` no longer reads `baseUrl`, which is deprecated in TypeScript 6.0: a `paths` entry is resolved from the directory of the `tsconfig.json` that declares it, as `tsc` resolves it when `baseUrl` is not set. Write `paths` relative to that `tsconfig.json` (`"@/*": ["./src/*"]` in place of `"baseUrl": "src"` with `"@/*": ["*"]`).

- With `baseUrl` set, the rule used to resolve an aliased import to an absolute path, which a `module` written relative to the project root does not match, so such imports went unchecked.
- A `paths` entry was taken as relative to the working directory, which differs from the `tsconfig.json`'s directory when ESLint runs below it, or when `paths` is declared in a configuration named by `extends` in another directory.
