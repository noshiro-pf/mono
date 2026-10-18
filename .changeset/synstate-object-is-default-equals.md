---
'synstate': major
'synstate-preact-signals': major
'synstate-preact-hooks': major
'synstate-react-hooks': major
'synstate-react-hooks-compat': major
---

Make `Object.is` the default `equals` of `createState`, `createReducer` and `createBooleanState`.

An update whose next state is `Object.is`-equal to the current one is no longer passed on: no subscriber, and nothing derived from the state, is told of it, and the current state is kept. Pass `equals: () => false` to pass on every update as before.

`synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` pass `equals` through, so the change reaches their users too: the signal, the components using the hook and the subscribers of `state` are not told of such an update.
