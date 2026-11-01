---
'github-settings-as-code': patch
---

`apply` for rulesets and environments now reads only the `*.json` files of `repo-settings/rulesets/` and `repo-settings/environments/`. It parsed every file there, so a README beside the declarations made it throw a `SyntaxError` before sending anything, although `backup` already left such a file alone. Both readers and `clearJsonFilesIn` now pick the declaration files through the new `listJsonFilesIn`, and `readRulesetFilesIn` / `readEnvironmentFilesIn` read a given directory.
