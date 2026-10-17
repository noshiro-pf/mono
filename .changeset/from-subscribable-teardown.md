---
'synstate': patch
---

`fromSubscribable` now unsubscribes from the wrapped subscribable when the observable completes or is disposed, instead of keeping the subscription alive. It does not unsubscribe when the subscribable completed first. Like `timer` and `counter`, it is now also completed when a child completes and nothing else uses it.
