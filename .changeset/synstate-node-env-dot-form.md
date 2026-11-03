---
'synstate': patch
---

Read `process.env.NODE_ENV` in the form bundlers replace, so the development-only circular-dependency check runs in a browser development build as well. It stays off in production and where nothing replaces the expression and there is no `process`.
