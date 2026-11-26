---
'eslint-plugin-ts-restrictions': minor
'eslint-config-typed': minor
---

Add `no-empty-rejection-handler`, which reports an empty rejection handler (`p.catch(() => {})`, `p.then(f, () => {})`) on a thenable, and turn it on in `recommended` and in `eslint-config-typed`. `() => undefined` remains the way to drop a rejection on purpose.
