---
'blueprint-synstate': patch
---

`Toaster.remove` calls the `onDismiss` of each toast still shown with `false`, as `clear` does, once the toaster is out of the page, and drops those waiting to be shown, as `clear` drops them; a second `remove` does nothing, and a toast shown after it is ignored, including one an `onDismiss` shows then. An `onDismiss` is called once however its callback dismisses, clears or removes again, and one that throws is reported without keeping the others from being called. A toast an `onDismiss` shows while `clear` runs stays, where it was dropped.
