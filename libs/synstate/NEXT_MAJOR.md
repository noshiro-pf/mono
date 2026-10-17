# Next major

- Make `Object.is` the default `equals` of `createState`, `createReducer` and
  `createBooleanState`.

    An update whose next state is `Object.is`-equal to the current one is then
    not passed on: no subscriber, and nothing derived from the state, is told
    of it, and the current state is kept. Pass `equals: () => false` to pass
    on every update as before.

    `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks`
    and `synstate-react-hooks-compat` pass `equals` through, so the change
    reaches their users too: the signal, the components using the hook and
    the subscribers of `state` are not told of such an update. Name all five
    packages with `major` in the changeset that makes it, so that its text
    reaches each changelog; `check:prose:linked-releases` holds the release
    until it does.

- Stop completing upstream observables when a child completes, and drop
  `autoComplete`.

    A child's `complete()` then no longer calls `tryComplete` on its parents,
    and an observable completes only when it is completed itself or when all
    of its parents have completed. An unused upstream with a teardown
    (`counter`, `timer`, `debounce`, `switchMap`, …) keeps running until its
    owner completes or disposes it, so `counter(1000).pipe(take(3))` no
    longer stops the counter. `complete()` and `dispose()` are then the same
    with respect to parents. This is what the `synstate-dom` spec
    (`libs/synstate-dom/SPEC.md`) assumes: lifetimes belong to scopes, not
    to whichever consumer finishes last.

- Complete `take(n)` right after its `n`th emission.

    `take(n)` now completes only when the `n + 1`th value arrives, so
    `counter(1000).pipe(take(3))` stays open after emitting three values
    until the counter ticks again, and over a source that emits exactly `n`
    times it stays open until that source completes. It will complete in the same update as its
    `n`th emission, after passing that value on. The initial value is still
    not counted: `take` counts emissions, not states.

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
