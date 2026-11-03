---
'eslint-config-typed': minor
---

Add `ts-restrictions/require-ime-guard-on-enter`, enabled as an error. It reports a comparison of a keyboard event's `key` or `code` with `'Enter'` (or `'NumpadEnter'`) by `===`, `!==`, `==`, `!=` or a `case` of a `switch` on it when nothing checks the same event for input method composition. Without that check, the Enter that confirms a conversion triggers the handler too, and a half-typed Japanese value is submitted. The check is a call that passes the event to one of the `guardFunctions` option's names (default `["isImeKeyDown"]`, the helper `synstate-dom` exports, which also covers Safari's Enter after `compositionend`), or a read of `isComposing` on the event or on a React event's `nativeEvent`. It may be in the same condition or anywhere else on the same variable, such as an early return before a `switch`.
