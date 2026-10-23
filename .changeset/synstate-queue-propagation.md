---
'synstate': major
'synstate-preact-hooks': major
'synstate-preact-signals': major
'synstate-react-hooks': major
'synstate-react-hooks-compat': major
---

An update now visits only the nodes its value reaches. Every node that emits puts its children into a queue of the update, one bucket per depth, and the update visits the buckets shallowest first, so each node still runs once per update and only after all its parents have settled (glitch-free). A root no longer keeps a list of all its descendants, and a descendant no longer registers to every root it can be reached from: building a graph in which many roots meet is linear in its edges (a 1,000-task critical-path schedule with a state per task builds in about 30 ms instead of a second), and an update stopped by `filter` or `skipIfNoChange` costs only the nodes above the stop (0.07 ms instead of 1.1 ms in that schedule). An update in which every node changes costs about the same as before, between 25% faster and 30% slower depending on the graph.

Breaking changes:

- `tryUpdate` of an observable made with `createChildObservable` (and the other child factories) is called only on updates in which at least one of its parents emitted. It used to be called on every update of a root it descends from.
- `UpdateToken` is an opaque object type instead of a symbol.
- An observable's children are queued before its subscribers run. A node created during an update is updated by it when one of its parents emits after the node was created; it used to keep the value it was created with until the next update.
- Nodes at the same depth are visited in the order their parents emitted rather than the order they were created.
- At most 100 updates can be nested, one started inside another by a write from a subscriber or projection. A write that would open the 101st throws an error that names the loop; a loop that never converges used to run until the stack overflowed.

`synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so the change reaches their users as well.
