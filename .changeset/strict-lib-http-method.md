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

`XMLHttpRequest#open` takes any HTTP method token: its `method` is
`HTTPRequestMethod | (string & {})`, where it was the `<form method>` values
`'post' | 'get' | 'dialog'`. `xhr.open('POST', url)`, `'PUT'`, `'patch'` and a
custom token such as `'PROPFIND'` now type-check, and the union keeps the
upper-case methods as literal members.

`Request#method` is `string`, as in TypeScript's own lib, where it was the
upper-case `HTTPRequestMethod`. Fetch upper-cases only some standard methods and
passes any other token through as written, so `'patch'` and `'PROPFIND'` are
possible values.
