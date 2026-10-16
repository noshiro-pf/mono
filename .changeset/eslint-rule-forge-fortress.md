---
'eslint-plugin-ts-fortress': patch
---

Recognize a call through a namespace import written with a type wrapper, such as `(t as typeof t).minLengthArray(1, …)`. A fix that adds several imports now writes them as one `import { … } from 'ts-fortress';` line. The rule helpers now come from the new `eslint-rule-forge` package instead of a copy in this one.
