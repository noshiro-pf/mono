---
'synstate': patch
---

Make the four observable state flags (`isCompleted`, `updateToken`,
`hasSubscriber`, `hasChild`) plain data properties kept in step by the base
handle, instead of getters delegating to it. `updateToken` is read once per
child per update, so the propagation path was paying an accessor call plus a
closure call per step where a field read would do, and an object literal
carrying accessors is far more expensive to create than one carrying data.

Measured with `pnpm run benchmark` on one machine: the derived chain's 100,000
updates 16.7 ms -> 13.6 ms, the diamond 36.7 ms -> 32.6 ms, the deep chain at
K=1000, M=200 15.6 ms -> 11.2 ms, and the cascaded diamond at N=20 — dominated
by graph construction — 587 ms -> 362 ms. No API change.
