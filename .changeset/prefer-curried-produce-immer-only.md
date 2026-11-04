---
'eslint-config-typed': patch
---

`immer-coding-style/prefer-curried-produce` reports only a `produce` imported from `immer` (named, aliased, default or through a namespace import) that nothing nearer shadows, so a local or another library's `produce(topic, callback)` is no longer rewritten.

It no longer fixes an updater whose base is cast to a type other than the parameter's annotation, such as `(state: State | undefined) => produce(state as State, recipe)`, into `produce<State>(recipe)`, which narrowed what callers may pass. Such an updater, and one that casts an unannotated parameter, is now left alone.

It now also reports, without a fix, an updater whose call is under `satisfies` or `!`, or whose callee or namespace object is in a type wrapper (`(produce as typeof produce)(state, recipe)`), which it did not see before. An updater with a comment outside the recipe is still reported, but the fix, which deleted the comment, is withheld.
