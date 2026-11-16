---
'synstate-preact-signals': patch
---

A `fromSignal` called inside a synstate scope now stops following its signal
when that scope is disposed. Only its source was disposed with the scope; the
subscription to the signal stayed until the returned `dispose` was called, so a
`fromSignal` in a scope created and disposed many times (a `switchMap`
projection, a synstate-dom row or branch) left one live subscription per
disposed scope. Calling `dispose` as well stays harmless.
