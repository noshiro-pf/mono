---
'eslint-plugin-ts-ui-restrictions': patch
---

`require-ime-guard` tells one `this` from another: a key read on `this.ev` is matched only with a check on `this` bound by the same function, or by the same class for a field or a static block. A guard in another class no longer covers it, and a `const` bound to a chain on `this` (`const native = this.ev`) is followed to the check made on that chain.
