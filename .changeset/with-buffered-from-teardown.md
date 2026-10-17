---
'synstate': patch
---

`withBufferedFrom` (and its alias `withBuffered`) now unsubscribes from the buffered observable and empties its buffer when the result completes or is disposed. Before, the subscription was kept and values kept piling up in a buffer nobody read. Like other operators that hold a resource (`debounce`, `switchMap`, ...), the result now also completes when a child of it completes and it has no subscriber or other active child left.
