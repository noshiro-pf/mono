---
'better-preact-use-state': patch
---

`resetState` resets to the value the state was created with — the first render's `initialState`, as `useState` reads it — rather than the latest render's argument, and keeps its identity across renders. It changed identity whenever the argument did, so `useState({ name: '' })` gave a new `resetState` on every render, and an effect depending on it re-ran after every render.
