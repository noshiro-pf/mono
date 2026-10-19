---
'synstate': minor
'synstate-preact-signals': minor
'synstate-preact-hooks': minor
'synstate-react-hooks': minor
'synstate-react-hooks-compat': minor
---

Add `isObservable(value)`, which tells an observable made by synstate from any other value. Every observable now carries a symbol key that marks it, so a plain object that happens to have a `subscribe` method is not taken for one. The marker is the same symbol the public observable types were already branded with, so an object literal still cannot pass for an observable. `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so `isObservable` reaches their users as well.
