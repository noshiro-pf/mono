---
'ts-data-forge': patch
---

Generate the remaining branded-number modules — the 6 `operatorsForFloat`
families (`FiniteNumber`, `NonNegative`/`NonPositive`/`NonZero`/`Positive`/
`Negative` finite numbers) and the 2 `enum` modules (`Int8`, `Uint8`) — from the
same declarative generator that already produces the integer modules, so all 34
branded-number modules are now generated. The generated code is structurally
identical to the previous hand-written modules (verified by a comment-stripped
diff), so the runtime and type surface are unchanged; only the JSDoc prose is
templated (with per-member overrides preserving design-intent notes such as why
`add`/`sub` are absent from `NonZeroFiniteNumber`). Worked `@example` blocks are
still embedded from `samples/`.

With every branded-number type now generated, the `check:branded-number-casts`
guard is removed — consistency is enforced by generation.
