---
'synstate': major
'synstate-preact-signals': major
'synstate-preact-hooks': major
'synstate-react-hooks': major
'synstate-react-hooks-compat': major
---

`take(n)` now completes in the same update as its `n`th emission, after passing that value on to its subscribers and to everything derived from it. Before, it completed only when the `n + 1`th value arrived, so `counter(1000).pipe(take(3))` stayed open for another tick after emitting three values, and over a source that emits exactly `n` times it stayed open until that source completed. The initial value is still passed on and not counted. `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so the change reaches their users as well.
