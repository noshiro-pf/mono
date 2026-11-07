---
'synstate': patch
---

`subscribe` passes on a value the first call of `onNext` writes to the observable itself (a clamp, a default), once, after that call has returned, unless the call disposed the scope the subscription is made in. `onNext` is not a subscriber yet while its first call runs, so that write used to reach no one. If the call passing it on throws, `subscribe` ends the subscription before the exception reaches its caller.
