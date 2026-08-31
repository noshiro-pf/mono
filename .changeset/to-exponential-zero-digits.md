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

Allow `0` as `toExponential`'s `fractionDigits`: the parameter type becomes `UintRangeInclusive<0, 100>`. ECMA-262 accepts 0–100 — `(1).toExponential(0)` is legal and returns `'1e+0'` — so the previous lower bound of 1 rejected a valid call.
