---
'synstate': patch
---

`fromSubscribable` now completes after the subscribable reports an error. The error is still passed on as a `Result.err`, and it is the last value: the observable completes, unsubscribes from the subscribable, and ignores anything the subscribable passes on afterwards, as an error ends an RxJS or TC39-style observable and as a rejection ends `fromPromise`. Before, the observable stayed open after the `Err`, so `collectToArray` on it never resolved, a `mergeMap` kept each inner `fromSubscribable` that ended in an error until the `mergeMap` itself completed, and nothing derived from it completed. A hand-written subscribable that calls `onError` and then goes on calling `onNext` now loses those later values.
