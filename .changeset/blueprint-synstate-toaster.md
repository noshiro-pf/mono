---
'blueprint-synstate': minor
---

Add `createToaster`, Blueprint's `OverlayToaster.create`: toasts that queue, time out, pause under the pointer, and animate in and out as Blueprint's style sheets do. A dialog opened with a toast on show still takes focus, and a press on its backdrop brings focus back whatever is open over it, as Blueprint's do.
