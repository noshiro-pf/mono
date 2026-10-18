---
'synstate': patch
---

`switchMap` and `mergeMap` no longer complete an inner observable they did not create. Each projection now runs in a scope of its own, and switching away (`switchMap`) or completing disposes what the projection created there; an observable created outside the projection and only returned by it, such as one shared with other subscribers, is unsubscribed and keeps running.
