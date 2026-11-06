---
'synstate': minor
'synstate-dom': patch
'synstate-router-dom': patch
---

synstate: `createScope(parent, { after })` makes every observable derived in the scope, and in its child scopes, update after `after` in an update that reaches both, however few steps it is from the source.

synstate-dom: `If`, `MatchOptional` and `MatchResult` mount each branch, and `For` each row, in a scope created with `after: value`, so a branch the next value rules out is disposed before what it derived computes that value. A component the branch mounts that reads `user$.pipe(map((u) => u!.name))` under `<If cond={…user$ is defined…}>` no longer sees `undefined` when the condition is derived in more steps than the branch's own value, as long as the condition updates in the same update as the source (not through `debounce` or `switchMap`). A subscription the branch makes to the source directly still hears the value when the source emits, JSX written inline in `then` is created in the enclosing scope and is not ordered, and a value that arrives while the switch is still mounting (or before it is attached) is applied after the update, as before.

synstate-router-dom: `Routes` mounts each route's branch in a scope created with `after: router.match` too. What a page derived from `router.location` in one step was as deep as `router.match`, and updated after the switch only because of the order the update queued them in; it now does so by depth.
