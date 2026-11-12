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

In the branded flavor, `String#repeat`'s `count` is
`NumberType.StringSizeArgNonNegative`, as `includes`, `startsWith` and
`endsWith` take, where it was a bare `SafeUint`. An integer literal from 0 to
39, such as `'-'.repeat(3)`, type-checks again without `asSafeUint`; a larger
one still needs it, and a negative or fractional one is rejected.
