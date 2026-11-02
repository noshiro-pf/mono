---
'eslint-rule-forge': patch
'eslint-plugin-ts-data-forge': patch
'eslint-plugin-ts-std-forge': patch
'eslint-plugin-ts-fortress': patch
'eslint-plugin-synstate': patch
---

`hasForeignBinding` now passes over a binding with no value meaning inside the file — a type parameter, a local type alias or interface — and keeps looking outwards, because a type does not shadow the value, or the head of the qualified name, that a fix writes. Before, the rules that guard their fix with it reported code such as `function f<Arr>() { return xs.length > 0; }` but offered no fix; they now fix it. A rule that uses it to decide whether a call is the module's at all, such as `prefer-pipe-map-nullable` for `pipe`, now also reports a call made inside such a scope. A type-only binding at the top of the file still counts, because the import a fix adds there would conflict with it when the export also has a type meaning. `prefer-namespace-import` still gives up its fix where a type parameter or local type of the namespace name would capture a reference in a type position.
