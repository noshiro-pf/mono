---
'eslint-plugin-ts-restrictions': minor
'eslint-config-typed': minor
---

Add `ts-restrictions/no-unreturned-promise-in-cloud-function`, on in
`eslint-config-typed`: it reports a promise a Cloud Functions handler starts and
neither returns nor awaits, a statement ending in `.catch` or discarded with
`void` included, since the instance may be throttled or reclaimed once the
handler returns. A handler is a function passed to a function
`firebase-functions` declares, inline, by a name declared in the same file, or
built by a helper, read through type wrappers.
