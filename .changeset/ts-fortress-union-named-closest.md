---
'ts-fortress': patch
---

`union` now reports how the closest member failed even when the member listing is short enough to print, as it is once the members carry a `typeName`. Such a union used to list the names alone, so naming the members hid which field was wrong. The closest member replaces the listing when no other member is as close and the value has a key that member checks and accepts; a union of literals, a value that resembles no member, or a union with another union among its members keeps the listing. `is` on a union also no longer builds the error report it discards.
