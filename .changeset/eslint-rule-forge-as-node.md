---
'eslint-rule-forge': minor
---

New `asNode(node)`: a `DeepReadonly` node typed as the mutable node it is, for an ESLint or typescript-eslint API that declares a mutable parameter and only reads it, so that a rule does not carry a cast of its own.
