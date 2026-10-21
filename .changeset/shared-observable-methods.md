---
'synstate': major
'synstate-preact-signals': major
'synstate-preact-hooks': major
'synstate-react-hooks': major
'synstate-react-hooks-compat': major
---

Creating an observable costs several times less: every observable is now an instance of a class — `ObservableBaseClass` and, below it, one class for each creator and operator — whose methods live on the prototype, rather than a set of closures made for each observable, and the collections of children and subscribers are made when the first one arrives. Two things change for users. The methods read `this`, so they must be called on the observable (`obs$.subscribe(f)`, `source$.next(v)`); taking one off it (`const { subscribe } = obs$`, `const { next } = source$`) or passing it as a callback no longer works. This holds for `getSnapshot`, `subscribe`, `pipe`, `complete` and `dispose`, and for `next` of a source and `start` of a timer or counter. Observables no longer carry an `id`, and the `ObservableId` and `SubscriberId` types are removed; nothing in synstate needed them once creating an observable stopped issuing ids. `UpdateToken` stays a symbol, now one per update rather than one per observable as well. The check for circular dependencies at creation runs only outside production (`NODE_ENV` other than `production`). `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so the change reaches their users as well.
