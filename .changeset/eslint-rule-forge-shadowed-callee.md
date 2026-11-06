---
'eslint-rule-forge': minor
---

`buildCalleeResolver` resolves a default import (`import d from 'm'`, `d(…)`) to the export `default`, and the `ResolvedCallee` it returns carries `bindingNode`, the identifier whose binding decides what is called: the callee, or the namespace object. `ResolvedCallee` gains that field as a required one, so code that builds one itself has to supply it. The new `isShadowedCallee(sourceCode, resolved, moduleNames)` says whether that identifier is bound to something other than an import from `moduleNames` where the call is made, and `hasForeignBinding` takes several module names too.
