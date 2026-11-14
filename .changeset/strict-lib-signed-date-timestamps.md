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

Branded flavor: the `Date` timestamps no longer claim to be non-negative. A date
before 1970 has a negative timestamp, and a date before 1 BCE (year `0`) has a
negative year, so

- `Date#getTime()`, `Date#valueOf()` and `Date.UTC(...)` return `SafeInt`
  instead of `SafeUint`;
- `Date.parse(s)` returns `SafeInt | NaNType`, since `NaN` is how it reports a
  string it cannot read;
- `NumberType.YearEnum`, the type of `getFullYear()`, `getUTCFullYear()` and of
  the `year` parameter of `new Date(...)` and `Date.UTC(...)`, is `SafeInt`.

`Date.now()` stays `SafeUint`. `RegExp#[Symbol.search]` returns
`NumberType.StringSearchResult` (`StringSize | -1`), since it returns `-1` when
nothing matches. The plain flavor is unchanged.
