---
'synstate': patch
---

`switchMap` subscribes to nothing for a projection that a write to its own source switched away from, or that completed `switchMap`, instead of leaving that inner subscribed and emitting twice; `mergeMap` does not subscribe to an inner once it has completed during the projection. A scope disposed while its `run` is still executing disposes what is created in it afterwards once that `run` returns and runs a cleanup it is given at once, and `dispose` runs every cleanup even when one throws, then rethrows the first error.
