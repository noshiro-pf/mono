---
'synstate-dom': minor
---

Control the bound `value` of a `<select>`, as `checked` is controlled: after a `change`, the select is drawn as its bound value again before the next frame is painted, so a choice the owner does not take in `onChange` undoes itself. A choice taken asynchronously is drawn as the bound value in between; bind `value` to what should be shown meanwhile. The `value` of an `<input>` or a `<textarea>` stays bound one way.
