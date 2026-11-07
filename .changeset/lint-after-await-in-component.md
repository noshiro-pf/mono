---
'eslint-plugin-synstate': minor
---

`no-observable-in-handler` also reports an observable created, or a subscription made, after an `await` in a component: in an `async` function that contains JSX or is written inside a function that does, other than JSX passed to a `render` call. It reports what may run after an `await` there: after it in source order, with it in the call's own arguments, in the body of a `for await`, and in the body, test or update of a loop that awaits. A component runs in its scope only until it returns, so what follows the first `await` belongs to no scope and is never disposed or ended. Code before the first `await`, work in the `run` of a scope taken with `getCurrentScope()` before it, and `untracked(…)` are not reported; an `async` callback of `run` is in its scope only until its first `await`, and what follows is reported.
