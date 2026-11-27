---
'ts-fortress': minor
---

`uuid({ version })` builds for every `version` without a `defaultValue`: a
numbered version `V` defaults to `00000000-0000-V000-8000-000000000000` and
`'max'` to the max UUID, where both used to panic on the nil UUID. Every
`version` now reads the hexadecimal digits in any case, as RFC 9562 says for
input, so a numbered version, `'loose'` and `'max'` accept upper- and mixed-case
UUIDs they used to reject. The max-UUID member of `UuidBaseString` is now a
pattern whose third group starts with `f` or `F`, so that every value `is`
accepts is of the type.
