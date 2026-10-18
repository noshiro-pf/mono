# Next major

- Pass on a pending value when `debounce` or `audit` completes, and drop it
  when it is disposed.

    Completing either now discards the value its timer is holding, so the
    last value of a source that completes within the window is lost.
    `complete()` will emit it first and then complete; `dispose()` will
    release the timer without emitting, because a disposed observable has no
    one left to tell.

- Remove the internal members from the public observable types and export
  an API for writing custom operators and creators (#2117).

    `addChild`, `addDescendant`, `tryUpdate`, `tryComplete`,
    `hasActiveChild`, `updateToken`, `depth`, `hasSubscriber` and `hasChild`
    leave `Observable<A>` and the types built on it. Code that reads them
    has to move to the authoring API that #2117 adds.
