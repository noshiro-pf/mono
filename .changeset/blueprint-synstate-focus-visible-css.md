---
'blueprint-synstate': minor
---

`blueprint-synstate/focus-visible.css`: imported after Blueprint's style sheets, it draws the focus ring for keyboard focus only, as Blueprint React's `FocusStyleManager.onlyShowFocusOnTabs()` does, so that a button, tab or checkbox clicked with the mouse keeps no ring; as Blueprint's, it leaves the ring inside `.bp6-focus-style-manager-ignore`.
