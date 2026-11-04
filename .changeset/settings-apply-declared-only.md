---
'github-settings-as-code': patch
---

`apply` for rulesets and environments now writes back only the resources the declaration files name, instead of every live one. A ruleset or environment that exists only on GitHub is no longer adopted into the declarations, so the drift check keeps reporting it.
