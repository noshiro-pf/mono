---
'synstate-dom': minor
---

`derive`, `view` and `mapBindable` pass on a result only when it differs from the one held (`Object.is`), because synstate's `map`, which they are built on, now does: a derived value that did not change writes nothing to the DOM.
