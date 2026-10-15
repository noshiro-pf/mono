---
'eslint-config-typed': patch
---

Stop checking the same thing twice:

- `logical-assignment-operators`, `operator-assignment` and `no-useless-concat` are off in favor of the `unicorn/` rules of the same name, which wrap or replace them; `unicorn/logical-assignment-operators` takes over `enforceForIfStatements: true`.
- `no-unused-private-class-members` is off in favor of `@typescript-eslint/no-unused-private-class-members`.
- `no-class-assign`, `no-new-native-nonconstructor`, `no-with` and `@typescript-eslint/no-dupe-class-members` are off, because TypeScript reports them (ts(2629), ts(7009), ts(1101) / ts(2410), ts(2393) / ts(2300)).
- `eslintConfigForVitest` turns off `@typescript-eslint/unbound-method`, which `vitest/unbound-method` extends.
