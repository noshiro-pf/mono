# Next major

- Follow synstate's new default `equals`, `Object.is`, in `createState`,
  `createReducer` and `createBooleanState`.

    An update whose next state is `Object.is`-equal to the current one is then
    not passed on: components using the hook and the subscribers of `state` are not told of it, and
    the current state is kept. Pass `equals: () => false` to pass on every
    update as before.

    The change is synstate's, whose major makes it; release this one together
    with it.
