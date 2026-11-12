---
'synstate-router': minor
---

A node's `href` takes `retain: { from, keys }`, which carries the named search values over from another page's search (a match's `search`, say) unless `search` gives them: a filter kept across pages without building the search by hand. The keys are limited to the search the destination declares, and the values to its codecs' types. The result is the same canonical `Href` as one built by hand, and a value equal to its default is still left out of the URL.
