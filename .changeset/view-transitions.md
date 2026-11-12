---
'synstate-router': minor
'synstate-router-react': minor
'synstate-router-dom': minor
---

A navigation can run inside a View Transition: `push(href, { viewTransition: true })`, `replace` with the same option, and `viewTransition` on both bindings' `Link` wrap the update in `document.startViewTransition`, which ends once a binding's `Routes` has drawn the new page, or after the next frame without one. Where the browser has no View Transitions the navigation is made as usual. `RouterBrowser` gains an optional `startViewTransition`, and `createMemoryBrowser` a `viewTransitions` option with `viewTransitions()` for tests.
