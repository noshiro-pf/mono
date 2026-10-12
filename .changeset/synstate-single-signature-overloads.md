---
'synstate-react-hooks': patch
'synstate-preact-hooks': patch
---

`useObservableValue` is declared with one one-argument signature where it had
two that only refined the return type. Inference is unchanged: it still
returns `A` for an initialized observable and `A | undefined` otherwise, and
the two-argument form is untouched.
