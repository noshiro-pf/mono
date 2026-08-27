---
'synstate': major
'synstate-react-hooks': major
'synstate-react-hooks-compat': major
'synstate-preact-hooks': major
'synstate-preact-signals': major
---

Rewrite the observable core without classes and remove the class exports.

The internal implementation of every observable is now built from closure-based
factory functions (`src/core/base/`) instead of a class hierarchy. The public
API — `source`, `timer`, the operator factories, `pipe`, the structural
`Observable` interfaces and the `kind` tags — is unchanged, and all existing
behavior is preserved.

BREAKING CHANGE: the implementation classes `ObservableBaseClass`,
`RootObservableClass`, `SyncChildObservableClass`, `AsyncChildObservableClass`
and `InitializedSyncChildObservableClass` are no longer exported from
`synstate`, and consequently no longer re-exported from `synstate-react-hooks`,
`synstate-react-hooks-compat`, `synstate-preact-hooks` and
`synstate-preact-signals`. Code that extended or instantiated these classes
should build observables through the factory functions and the structural
`Observable` types instead.
