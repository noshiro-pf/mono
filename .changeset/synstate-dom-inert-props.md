---
'synstate-dom': minor
---

A type-level break, released as a minor while synstate-dom is 0.x: the element props no longer accept writable DOM properties that have no attribute (`selectedIndex`, `valueAsNumber`, `selectionStart`, `currentTime`, `volume`, `playbackRate`, the URL parts of `<a>` such as `hash`, the obsolete `ch` and `chOff`, and others). The binding wrote them with `setAttribute`, which changed nothing. `defaultMuted`, `defaultSelected` and `encoding` are now written as their attributes `muted`, `selected` and `enctype`.
