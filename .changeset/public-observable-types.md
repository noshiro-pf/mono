---
'synstate': major
'synstate-preact-signals': major
'synstate-preact-hooks': major
'synstate-react-hooks': major
'synstate-react-hooks-compat': major
---

The observable types keep only the members meant for users — `id`, `kind`, `parents` (on child observables), `getSnapshot`, `isCompleted`, `updateToken`, `depth`, `subscribe`, `pipe`, `complete` and `dispose` — and can no longer be satisfied with an object literal. `addChild`, `deleteChild`, `addDescendant`, `deleteDescendant`, `tryUpdate`, `tryComplete`, `hasActiveChild`, `hasSubscriber` and `hasChild` leave them; they are still there at run time, for propagation, but code reading them no longer compiles. `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so the change reaches their users as well.
