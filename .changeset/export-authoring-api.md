---
'synstate': minor
'synstate-preact-signals': minor
'synstate-preact-hooks': minor
'synstate-react-hooks': minor
'synstate-react-hooks-compat': minor
---

The factories every built-in observable is made by are exported for writing custom creators and operators: `createRootObservable`, `createSyncChildObservable`, `createInitializedSyncChildObservable` and `createAsyncChildObservable`, with their config and tools types. A custom operator tells whether a parent emitted in the update now propagating by comparing the parent's `updateToken` with the token its `tryUpdate` receives, as the built-in ones do. A guide, "Custom Operators and Creators", shows how. `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so the factories reach their users as well.
