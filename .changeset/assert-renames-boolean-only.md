---
'eslint-config-typed': patch
'eslint-plugin-vitest-coding-style': patch
---

`prefer-assert-is-true-over-assert` and
`prefer-assert-is-false-over-assert-not-ok` fix `assert(X)`, `assert.isOk(X)`,
`assert.ok(X)`, `assert.isNotOk(X)` and `assert.notOk(X)` only when `X` is a
boolean at every layer of its type wrappers; any other operand is reported under
a message that asks for the assertion meant (`assert.isDefined(X)`,
`assert.isUndefined(X)`, …), since `assert.ok(X)` passes for any truthy `X` and
`assert.isTrue(X)` for `true` alone:
the rewrite of `assert(el)` with `el: T | undefined` made a passing test fail,
or one that did not compile.
`prefer-assert-is-false-over-negated-assert-is-true` and
`prefer-assert-is-true-over-negated-assert-is-false` report `assert.isTrue(!X)`
/ `assert.isFalse(!X)` only when `X` is a boolean:
on any other, `!X` is already a strict boolean. The four rules read type
information now; without it (another parser, or no project) the first two write
no fix and report under the message that asks for the assertion meant, and the
negation rules report nothing, rather than throw. A call with no operand
(`assert.ok()`), which the type checker reports, is left alone.
