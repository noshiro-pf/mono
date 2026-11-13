---
'blueprint-synstate': patch
---

Keep one `SegmentedControl` option and one `Tabs` title in the tab order when none is chosen. A `SegmentedControl` whose `value` matches no option, or names a disabled one, now puts its first enabled option in the tab order; `Tabs` whose `selectedTabId` matches no tab puts its first title there.
