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
