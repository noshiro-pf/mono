---
'synstate-react-hooks': minor
'synstate-react-hooks-compat': minor
'synstate-preact-hooks': minor
---

`useObservableEffect` now calls the callback of the latest render, so it sees the current props and state, and moves its subscription when a different Observable is passed. It used to keep the first render's callback and Observable for as long as the component was mounted. Pass an Observable that keeps its identity across renders: one built during render is now subscribed again on every render.
