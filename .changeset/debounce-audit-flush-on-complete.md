---
'synstate': major
'synstate-preact-signals': major
'synstate-preact-hooks': major
'synstate-react-hooks': major
'synstate-react-hooks-compat': major
---

`debounce` and `audit` now pass on the value their timer is holding when they complete, and drop it when they are disposed. Completing either used to discard that value, so the last value of a source that completes within the window was lost; `complete()`, and the completion of the source, now emit it first and then complete. `dispose()` releases the timer without emitting, because a disposed observable has no one left to tell. `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so the change reaches their users as well.
