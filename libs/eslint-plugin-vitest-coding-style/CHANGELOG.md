# eslint-plugin-vitest-coding-style

## 1.0.4

### Patch Changes

- 076cc43: `prefer-assert-deep-strict-equal-over-deep-equal` and
  `prefer-assert-is-false-over-assert-not-ok` now recognize the method called
  through an optional chain, `(assert?.deepEqual)(a, b)` and `(assert?.notOk)(x)`,
  as they did through a type wrapper.
- Updated dependencies [076cc43]
    - eslint-rule-forge@0.14.0

## 1.0.3

### Patch Changes

- d0cb7aa: `prefer-assert-is-true-over-assert` and
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
- 5052026: `no-expect-to-strict-equal` leaves `expect(x).toStrictEqual(y)` alone when
  either side refers to Vitest's `expect`, or reads a member named `expect`, other
  than to call it, as an asymmetric matcher does (`expect.any(Date)`,
  `v.expect.arrayContaining([1])`, `ctx.expect.any(Date)`, a helper handed
  `expect`): only `toStrictEqual` understands the matcher, and the rewrite to
  `assert.deepStrictEqual` type-checked and failed. A call `expect(…)`, a property
  key spelled `expect` and a binding that shadows it are still fixed.
- Updated dependencies [8c46d7d]
- Updated dependencies [eb9be0c]
    - eslint-rule-forge@0.13.0
    - ts-data-forge@15.1.1

## 1.0.2

### Patch Changes

- Updated dependencies [f785bd5]
    - eslint-rule-forge@0.12.0

## 1.0.1

### Patch Changes

- b494544: Publish through npm trusted publishing for the first time. Nothing in the packages changes.
- Updated dependencies [e68e601]
- Updated dependencies [6f38584]
- Updated dependencies [38a2075]
- Updated dependencies [d92c572]
- Updated dependencies [6790e63]
- Updated dependencies [e6a4dac]
- Updated dependencies [745a60e]
- Updated dependencies [8f59370]
- Updated dependencies [e45e274]
- Updated dependencies [7f9658b]
    - ts-data-forge@15.0.1
