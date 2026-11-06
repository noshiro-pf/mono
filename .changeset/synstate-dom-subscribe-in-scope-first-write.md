---
'synstate-dom': patch
---

`subscribeInScope` passes on a value its first call writes to the source itself, which until now reached no subscriber.
