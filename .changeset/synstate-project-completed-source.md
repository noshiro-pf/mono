---
'synstate': patch
---

`switchMap` and `mergeMap` project the value a completed source holds, so that an initialized source with a projection that returns an initialized observable gives a result that holds a value, as its `InitializedObservable` type says, even when the source has completed: `just(1).pipe(switchMap((x) => just(x * 2)))` holds `2`, then completes. They used to complete holding no value. What the projection creates is still disposed when the operator completes.
