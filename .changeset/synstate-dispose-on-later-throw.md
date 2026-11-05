---
'synstate': patch
---

`switchMap` and `mergeMap` dispose what a projection made when the projection, or the subscription to the observable it returned, throws on a value the source emits later, rather than holding it until the next projection that succeeds (`switchMap`) or until the operator completes (`mergeMap`).
