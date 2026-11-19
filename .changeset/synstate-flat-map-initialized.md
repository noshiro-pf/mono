---
'synstate': minor
---

`switchMap` and `mergeMap` (and its alias `flatMap`), on an initialized source
with a projection that returns an initialized observable, give an
`InitializedObservable`: they project the value the source holds as soon as they
are created, so the result holds a value from the start. They gave a plain
`Observable`, so a consumer passed a fallback that was never used, or restated
the value with `withInitialValue`. A source that has already completed, such as
`just(x)`, is still not projected, so there the result completes holding no
value although its type says it holds one.
