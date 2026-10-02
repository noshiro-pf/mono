# Next major

- Make `Object.is` the default `equals` of `createState`, `createReducer` and
  `createBooleanState`.

    An update whose next state is `Object.is`-equal to the current one is then
    not passed on: no subscriber, and nothing derived from the state, is told
    of it, and the current state is kept. Pass `equals: () => false` to pass
    on every update as before.

    `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks`
    and `synstate-react-hooks-compat` pass `equals` through and depend on this
    exact version, so the change reaches their users too; each of them carries
    the same item and changes in its own major, released together with this
    one.
