---
'eslint-config-typed': minor
---

Enable `security/detect-invisible-characters`, added in
`eslint-plugin-security` 4.1.0, as `error` alongside
`security/detect-bidi-characters`. It reports the Hangul fillers U+3164 and
U+FFA0, which render as nothing and can hide code from review.
