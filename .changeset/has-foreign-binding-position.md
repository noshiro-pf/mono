---
'eslint-rule-forge': minor
---

`hasForeignBinding` takes, as an optional fifth argument, the kind of reference the name is written as: `'value'` (the default, as before) or `'type'`, for a reference the scope manager marks `isTypeReference`. For a type reference, a type parameter, a local type alias or a local interface of the name around the node now counts as a foreign binding, as it already did at the top of the file, so a fix that writes a name at one no longer has to look for those itself.
