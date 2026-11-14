---
'strict-ts-lib-v5.0-source': patch
'strict-ts-lib-v5.1-source': patch
'strict-ts-lib-v5.2-source': patch
'strict-ts-lib-v5.3-source': patch
'strict-ts-lib-v5.4-source': patch
'strict-ts-lib-v5.5-source': patch
'strict-ts-lib-v5.6-source': patch
'strict-ts-lib-v5.7-source': patch
'strict-ts-lib-v5.8-source': patch
'strict-ts-lib-v5.9-source': patch
'strict-ts-lib-v6.0-source': patch
'strict-ts-lib-v7.0-source': patch
---

The `minimumFractionDigits` / `maximumFractionDigits` options of
`Intl.NumberFormat`, `Intl.PluralRules`, `Number#toLocaleString` and
`BigInt#toLocaleString`, and the same fields of the resolved options, are
`UintRangeInclusive<0, 100>`, where they were capped at 20. ECMA-402 raised the
limit to 100 in its 2023 edition, so `{ maximumFractionDigits: 30 }` now
type-checks. Integer and significant digits keep their range of 1–21.
