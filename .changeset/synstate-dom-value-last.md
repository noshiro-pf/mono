---
'synstate-dom': patch
---

Bind `value` after every other prop of an element, whatever the order the props are written in. A range or number input fits its value to the `type`, `min`, `max` and `step` it has when the value is written, so `<input type="range" value="150" max="200">` written in that order showed 100; it now shows 150.
