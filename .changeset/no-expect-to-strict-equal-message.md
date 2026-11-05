---
'eslint-config-typed': patch
---

`vitest-coding-style/no-expect-to-strict-equal` reports `expect(X, message).toStrictEqual(Y)` too, and its fix keeps the message: `assert.deepStrictEqual(X, Y, message)`. Because the message is then evaluated after `Y`, the fix is written only when that order cannot matter — the message or `Y` is a literal, or neither may have a side effect — and the call is otherwise reported, as `useAssertMovingMessage`, without a fix. A spread argument or three or more arguments to `expect` are still left alone.
