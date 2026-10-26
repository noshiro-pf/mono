---
'synstate': patch
---

`switchMap` and `mergeMap` pass on the value an inner observable already holds when it is subscribed to (`just(x)`, a state) in the update that projected it, rather than in a nested update of its own. A node reading both the operator and its source, directly or through another branch (`combine([source$.pipe(map(f)), source$.pipe(switchMap(g))])`), no longer sees the new inner value beside the source's old one, nor emits twice for one update.
