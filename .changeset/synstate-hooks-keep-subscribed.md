---
'synstate-react-hooks': patch
'synstate-preact-hooks': patch
---

`useObservableValue` stays subscribed across renders with the same observable, instead of unsubscribing and subscribing again on every render.
