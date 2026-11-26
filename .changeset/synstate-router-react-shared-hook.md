---
'synstate-router-react': patch
---

The router's hooks and `Routes` read observables through `synstate-react-hooks`'
`useObservableValue`, now a dependency, instead of a copy of it kept in this
package. A fix to that hook now reaches the router too.
