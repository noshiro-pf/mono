---
'eslint-plugin-vitest-coding-style': patch
---

`prefer-assert-deep-strict-equal-over-deep-equal` and
`prefer-assert-is-false-over-assert-not-ok` now recognize the method called
through an optional chain, `(assert?.deepEqual)(a, b)` and `(assert?.notOk)(x)`,
as they did through a type wrapper.
