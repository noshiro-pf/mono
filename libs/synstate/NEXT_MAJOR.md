# Next major

- Remove the internal members from the public observable types and export
  an API for writing custom operators and creators (#2117).

    `addChild`, `addDescendant`, `tryUpdate`, `tryComplete`,
    `hasActiveChild`, `updateToken`, `depth`, `hasSubscriber` and `hasChild`
    leave `Observable<A>` and the types built on it. Code that reads them
    has to move to the authoring API that #2117 adds.
