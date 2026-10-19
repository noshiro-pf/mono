---
'eslint-config-typed': patch
---

`eslintConfigForVitest` now sets `settings.vitest.typecheck`, so that the Vitest rules read types. Without it, `vitest/prefer-describe-function-title` took any import named as a `describe` title for a function, a type-only import included, and its autofix replaced the string with a reference to that import, which does not compile and throws at runtime. With the setting, `vitest/expect-expect` also counts `expectTypeOf` and `assertType` as assertions, and `vitest/valid-expect` leaves `expectTypeOf` alone; a config that turns `vitest/valid-title` on gets it accepting a title whose type is a function or a string. The setting needs type-aware linting, which the config already needed for `vitest/unbound-method`.
