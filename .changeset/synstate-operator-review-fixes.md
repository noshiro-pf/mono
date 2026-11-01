---
'synstate': patch
---

Fixes found reviewing merged work:

- `skipWhile` and `takeWhile` keep their verdict on the parent's initial value: an initial value for which `skipWhile`'s predicate returns false lets every later value through without asking the predicate again, and one for which `takeWhile`'s predicate returns false completes the observable.
- `withBufferedFrom` no longer reports the buffered observable's current value twice when both observables already hold one.
- `withBufferedFrom` and `throttle` update their state before passing a value on, so a value a subscriber writes back lands in the next batch or inside the throttle window, as with the other stateful operators.
- `zip` completes after its last tuple has reached what is derived from it, as `take` does.
- `fromPromise` and `fromAbortablePromise` report only the promise's own rejection as an Err; a subscriber that throws on the Ok value no longer turns it into one, and its exception is thrown again from a task of its own, as one thrown during an update a timer started is.
- `createAsyncChildObservable` no longer throws when `init` completes the observable before returning.
- `mergeMap` releases an inner observable, and disposes what its projection made, as soon as that inner observable completes, instead of holding every one until `mergeMap` completes.
