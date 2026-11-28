---
'synstate-router': minor
'synstate-router-dom': minor
'synstate-router-react': minor
'synstate-router-preact': minor
---

The router and its bindings are written against the rebuilt synstate (and synstate-dom, for synstate-router-dom), which they take as peer dependencies of the same release; the bindings take synstate-router the same way, so the synstate-router 0.5 written against synstate 9 no longer satisfies them. A router's observables are created outside every owner, so a component or a test that happens to create the router does not dispose them, and following an `href$` ends when that observable is disposed, where it ended when it completed.
