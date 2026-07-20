---
'ts-data-forge': patch
---

Generate the branded-number **integer** modules (`Int`, `Uint`, `SafeInt`, the
`Int16/32`, `Uint16/32`, `NonNegative*`, `Positive*`, `NonZero*`, `NonPositive*`
and `Negative*` families — 26 modules) from a declarative config
(`scripts/gen-branded-number`) instead of maintaining them by hand. The
generated code is structurally identical to the previous hand-written modules
(same factory calls, `is`/`as`, namespace objects and `expectType` assertions),
so the runtime and type surface are unchanged; only the JSDoc prose is now
produced from flag-driven templates for consistency, with worked `@example`
blocks still embedded from `samples/`. Generation runs as part of the build.

The `operatorsForFloat` families and the two `enum` modules remain hand-written
for now and continue to be covered by `check:branded-number-casts`.
