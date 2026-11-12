---
'blueprint-synstate': minor
---

A `Tab` with no `panel` takes `panelId`: the `id` of the element, drawn elsewhere, that it controls, written as its `aria-controls`, so that the content a navbar's tabs choose can be their `tabpanel`. `tabTitleId(tabsId, tabId)` gives the `id` of a tab's title, for that element's `aria-labelledby`.
