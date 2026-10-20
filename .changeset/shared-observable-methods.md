---
'synstate': major
'synstate-preact-signals': major
'synstate-preact-hooks': major
'synstate-react-hooks': major
'synstate-react-hooks-compat': major
---

Creating an observable costs several times less: every observable is now one object whose `getSnapshot`, `subscribe`, `pipe`, `complete` and `dispose` are functions all observables share, rather than a set of closures made for each one, and the collections of children and subscribers are made when the first one arrives. Three things change for users. The methods read `this`, so they must be called on the observable (`obs$.subscribe(f)`); taking one off it (`const { subscribe } = obs$`) or passing it as a callback no longer works. Observables no longer carry an `id`, and the `ObservableId` and `SubscriberId` types are removed; nothing in synstate needed them once creating an observable stopped issuing ids. `UpdateToken` stays a symbol, now one per update rather than one per observable as well. The check for circular dependencies at creation runs only outside production (`NODE_ENV` other than `production`). `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so the change reaches their users as well.
