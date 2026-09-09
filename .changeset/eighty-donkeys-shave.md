---
'eslint-config-typed': patch
---

Correct the rationale documented on `vitest-coding-style/no-expect-to-strict-equal`, and pin the underlying behavior as executable tests.

The rule's description claimed that `expect(X).toStrictEqual(Y)` "also checks type equality between X and Y". It is the other way round: every `expect` matcher is `<E>(expected: E) => void` and constrains nothing, while `assert.deepStrictEqual: <T>(actual: T, expected: T) => void` binds both arguments to one type parameter. That compile-time check is what the rule is for.

The trade-off it makes in exchange is now written down too: Vitest's `assert.deepStrictEqual` is Chai's `deepEqual` under a second name — the same function object, not Node.js's `node:assert` function of that name — and compares structure without regard to prototypes, where `toStrictEqual` separates a class instance from a plain object of the same shape. A test that has to pin a class needs `assert.instanceOf` alongside it.

No rule behavior changes.
